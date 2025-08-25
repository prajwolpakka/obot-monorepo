import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly brainApiUrl: string;

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private configService: ConfigService,
  ) {
    this.brainApiUrl = this.configService.get<string>('BRAIN_API_URL', 'http://localhost:4002');
  }

  async processDocument(documentId: string): Promise<void> {
    try {
      // Update status to embedding
      await this.updateDocumentStatus(documentId, 'embedding');
      
      const document = await this.documentRepository.findOne({
        where: { id: documentId }
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Call brain API to process embeddings
      const response = await fetch(`${this.brainApiUrl}/api/embed/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          filePath: document.filePath,
          mimeType: document.mimeType,
        }),
      });
      if (response.ok) {
        await this.updateDocumentStatus(documentId, 'processed');
        this.logger.log(`✅ Document ${documentId} embedding completed`);
      } else {
        throw new Error(`Embedding API returned ${response.status}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to process document ${documentId}: ${error.message}`);
      await this.updateDocumentStatus(documentId, 'failed');
      throw error;
    }
  }

  async updateDocumentStatus(
    documentId: string, 
    status: 'pending' | 'embedding' | 'processed' | 'failed'
  ): Promise<void> {
    await this.documentRepository.update(documentId, { 
      status,
      isProcessed: status === 'processed'
    });
    
    // Emit status update via WebSocket if needed
    // This could be implemented using Socket.IO or similar
  }

  async getDocumentStatus(documentId: string): Promise<string> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      select: ['status']
    });
    
    return document?.status || 'unknown';
  }
}
