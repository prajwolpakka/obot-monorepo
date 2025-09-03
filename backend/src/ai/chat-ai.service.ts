import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatRequestDto } from "../chat/dto/chat-request.dto";
import { EmbeddingsService } from "./embeddings.service";
import { QdrantService } from "./qdrant.service";

@Injectable()
export class ChatAiService {
  private readonly logger = new Logger(ChatAiService.name);
  private readonly orApiKey: string;
  private readonly orModel: string;
  private readonly orBaseUrl = "https://openrouter.ai/api/v1";
  private readonly minScore: number;

  constructor(
    private readonly config: ConfigService,
    private readonly embeddings: EmbeddingsService,
    private readonly qdrant: QdrantService
  ) {
    this.orApiKey = this.config.get<string>("OPENROUTER_API_KEY", "");
    this.orModel = this.config.get<string>("OPENROUTER_MODEL", "openai/gpt-3.5-turbo");
    this.minScore = parseFloat(String(this.config.get<string>("QDRANT_SCORE_THRESHOLD", "0.65")) || "0.65");
    if (!this.orApiKey) {
      this.logger.warn("OPENROUTER_API_KEY not set; chat inference will fail until configured.");
    }
  }

  async chatStream(chatRequest: ChatRequestDto, onChunk: (chunk: string) => void): Promise<void> {
    // Short-circuit when no documents are provided: reply directly without calling any model
    if (!chatRequest.documents || chatRequest.documents.length === 0) {
      const fallback = "I looked far and deep but couldn't get what you are looking for.";
      this.logger.warn("No documents provided — skipping model call and replying with fallback message.");
      onChunk(fallback);
      return;
    }

    if (!this.orApiKey) throw new Error("OPENROUTER_API_KEY is not configured");

    // 1) Embed the question
    const queryVector = await this.embeddings.embedText(chatRequest.question);

    // 2) Retrieve similar chunks filtered by provided document IDs
    this.logger.log(
      `📋 Searching Qdrant with filter for ${chatRequest.documents?.length || 0} document(s): ${
        (chatRequest.documents || []).map((d) => d.slice(0, 8)).join(", ") || "none"
      }`
    );
    const hits = await this.qdrant.search(queryVector, {
      limit: 8,
      documentIdsFilter: chatRequest.documents,
      scoreThreshold: this.minScore,
    });

    if (!hits?.length) {
      this.logger.warn(
        `❌ No chunks found from Qdrant for provided document IDs (${(chatRequest.documents || []).map((d) => d.slice(0, 8)).join(", ") || "none"}) with score >= ${this.minScore}.`
      );
    } else {
      this.logger.log(`📄 Found ${hits.length} relevant chunks`);
      hits.slice(0, 3).forEach((h, idx) => {
        const did = String(h?.payload?.id || "").slice(0, 8) || "unknown";
        const cidx = h?.payload?.chunk_index ?? "?";
        const preview = String(h?.payload?.page_content || "")
          .replace(/\n/g, " ")
          .slice(0, 100);
        this.logger.log(
          `   • Chunk ${idx + 1}: doc=${did}, index=${cidx}, score=${
            h.score?.toFixed?.(3) ?? h.score
          } — '${preview}...'`
        );
      });
      if (hits.length > 3) this.logger.log(`   • ...and ${hits.length - 3} more chunk(s)`);
    }

    // Build plain context string from payloads (no labels)
    const contextChunks = hits
      .map((h) => (h?.payload?.page_content ? String(h.payload.page_content) : ""))
      .filter((c) => c && c.trim().length > 0);
    const context = contextChunks.join("\n\n");

    // Compose system/user prompts to replicate the previous behavior
    const hasContext = context.trim().length > 0;
    const systemPrompt = hasContext
      ? [
          "You are a helpful AI assistant. You must ONLY answer questions based on the provided context from documents. Do not use any knowledge outside of the provided context.",
          "",
          "IMPORTANT RULES:",
          "1. Provide SHORT, CONCISE answers (maximum 2-3 sentences)",
          "2. Be direct and to the point",
          "3. If the question can be answered using the provided context, answer it accurately.",
          '4. If the question cannot be answered from the provided context, respond EXACTLY with: "I looked far and deep but couldn\'t get what you are looking for." and DO NOT include any sources section.',
          "5. Do not make up information or use general knowledge not present in the context.",
          "6. If (and only if) you answer using the provided context, include a final sources section in this exact format:",
          "   ---",
          "   Sources: [List the specific files where this information comes from]",
        ].join("\n")
      : 'You are a helpful AI assistant. You only answer questions based on the provided documents. Since no documents are available, respond with: "I looked far and deep but couldn\'t get what you are looking for." Do not include any sources section.';

    const userPrompt = hasContext
      ? `Context from documents:\n${context}\n\nQuestion: ${chatRequest.question}\n\nAnswer:`
      : `Question: ${chatRequest.question}\n\nAnswer:`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // 3) Stream response from OpenRouter
    const resp = await fetch(`${this.orBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.orApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": this.config.get<string>("OPENROUTER_REFERRER", "http://localhost"),
        "X-Title": this.config.get<string>("OPENROUTER_TITLE", "obot"),
      },
      body: JSON.stringify({ model: this.orModel, messages, stream: true }),
    } as any);

    if (!resp.ok || !resp.body) {
      const text = await resp.text().catch(() => "");
      throw new Error(`OpenRouter request failed: ${resp.status} ${text?.slice(0, 200)}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split(/\r?\n/);
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length) onChunk(delta);
        } catch {
          // ignore parse errors on heartbeats/keepalives
        }
      }
    }
  }
}
