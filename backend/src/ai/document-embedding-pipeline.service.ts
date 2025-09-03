import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { QdrantService } from './qdrant.service';
import { DocumentProcessorService } from './document-processor.service';

export interface DocumentLike {
  id: string;
  filePath: string;
  name?: string;
  mimeType?: string;
}

@Injectable()
export class DocumentEmbeddingPipelineService {
  private readonly logger = new Logger(DocumentEmbeddingPipelineService.name);

  constructor(
    private readonly embeddings: EmbeddingsService,
    private readonly qdrant: QdrantService,
    private readonly processor: DocumentProcessorService,
  ) {}

  async processDocument(document: DocumentLike): Promise<{ chunksProcessed: number; totalChunks: number }> {
    this.logger.log(`Processing document ${document.id} at ${document.filePath}`);
    const text = await this.processor.extractText(document.filePath, document.mimeType);
    const chunks = this.processor.chunkText(text, 1000, 200);
    if (!chunks.length) {
      this.logger.warn(`No content chunks generated for document ${document.id}`);
      return { chunksProcessed: 0, totalChunks: 0 };
    }

    let processed = 0;
    // Simple sequential embedding & upsert. Could be batched later.
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const vector = await this.embeddings.embedText(chunk);
        const contentHash = this.processor.hashContent(chunk);
        const pointId = `${document.id}_chunk_${i}`;
        const payload = {
          id: document.id, // for filtering by document id
          page_content: chunk,
          document_name: document.name || '',
          chunk_index: i,
          content_hash: contentHash,
          embedding_model: this.embeddings.modelName,
        };
        await this.qdrant.upsert([{ id: pointId, vector, payload }]);
        processed++;
      } catch (e: any) {
        this.logger.error(`Failed chunk ${i + 1}/${chunks.length} for document ${document.id}: ${e?.message || e}`);
        // continue with next chunk
      }
    }

    return { chunksProcessed: processed, totalChunks: chunks.length };
  }
}

