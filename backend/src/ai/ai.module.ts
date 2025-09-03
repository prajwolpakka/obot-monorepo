import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmbeddingsService } from './embeddings.service';
import { QdrantService } from './qdrant.service';
import { DocumentProcessorService } from './document-processor.service';
import { DocumentEmbeddingPipelineService } from './document-embedding-pipeline.service';
import { ChatAiService } from './chat-ai.service';

@Module({
  imports: [ConfigModule],
  providers: [EmbeddingsService, QdrantService, DocumentProcessorService, DocumentEmbeddingPipelineService, ChatAiService],
  exports: [EmbeddingsService, QdrantService, DocumentProcessorService, DocumentEmbeddingPipelineService, ChatAiService],
})
export class AiModule {}

