import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingsService } from './embeddings.service';
import { QdrantService } from './qdrant.service';
import { ChatRequestDto } from '../chat/dto/chat-request.dto';

@Injectable()
export class ChatAiService {
  private readonly logger = new Logger(ChatAiService.name);
  private readonly orApiKey: string;
  private readonly orModel: string;
  private readonly orBaseUrl = 'https://openrouter.ai/api/v1';

  constructor(
    private readonly config: ConfigService,
    private readonly embeddings: EmbeddingsService,
    private readonly qdrant: QdrantService,
  ) {
    this.orApiKey = this.config.get<string>('OPENROUTER_API_KEY', '');
    this.orModel = this.config.get<string>('OPENROUTER_MODEL', 'openai/gpt-3.5-turbo');
    if (!this.orApiKey) {
      this.logger.warn('OPENROUTER_API_KEY not set; chat inference will fail until configured.');
    }
  }

  async chatStream(chatRequest: ChatRequestDto, onChunk: (chunk: string) => void): Promise<void> {
    if (!this.orApiKey) throw new Error('OPENROUTER_API_KEY is not configured');

    // 1) Embed the question
    const queryVector = await this.embeddings.embedText(chatRequest.question);

    // 2) Retrieve similar chunks filtered by provided document IDs
    const hits = await this.qdrant.search(queryVector, {
      limit: 8,
      documentIdsFilter: chatRequest.documents,
      scoreThreshold: undefined,
    });

    const context = hits
      .map((h, idx) => `Context ${idx + 1} (score=${h.score.toFixed(3)}):\n${(h.payload?.page_content || '').slice(0, 1200)}`)
      .join('\n\n');

    const systemPrompt = [
      'You are a helpful assistant. Answer the user question using the provided context snippets when relevant.',
      'If context is insufficient, say so. Be concise and cite when helpful (e.g., [Context 2]).',
    ].join(' ');

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${chatRequest.question}` },
    ];

    // 3) Stream response from OpenRouter
    const resp = await fetch(`${this.orBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.orApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.config.get<string>('OPENROUTER_REFERRER', 'http://localhost'),
        'X-Title': this.config.get<string>('OPENROUTER_TITLE', 'obot'),
      },
      body: JSON.stringify({ model: this.orModel, messages, stream: true }),
    } as any);

    if (!resp.ok || !resp.body) {
      const text = await resp.text().catch(() => '');
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
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta.length) onChunk(delta);
        } catch {
          // ignore parse errors on heartbeats/keepalives
        }
      }
    }
  }
}

