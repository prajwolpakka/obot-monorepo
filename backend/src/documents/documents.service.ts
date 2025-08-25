import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginatedResult, PaginationDto } from "../common/dto/pagination.dto";
import { paginate } from "../common/utils/pagination";
import { NotificationGateway } from "../notifications/notification.gateway";
import { NotificationService } from "../notifications/notification.service";
import { EmbeddingStatusGateway } from "./gateways/embedding-status.gateway";
import { CreateDocumentDto, UpdateDocumentDto } from "./dto/document.dto";
import { Document } from "./entities/document.entity";

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly brainApiUrl: string;

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
    private embeddingStatusGateway: EmbeddingStatusGateway
  ) {
    this.brainApiUrl = this.configService.get<string>("BRAIN_API_URL", "http://localhost:4002");
    this.logger.log(`🧠 Brain API URL configured: ${this.brainApiUrl}`);
  }

  async create(createDocumentDto: CreateDocumentDto, file: Express.Multer.File, userId: string): Promise<Document> {
    this.logger.log(`📄 Creating document for user ${userId}: ${file.filename}`);
    this.logger.debug(`📊 File details - Size: ${file.size} bytes, Type: ${file.mimetype}, Path: ${file.path}`);

    try {
      const document = this.documentRepository.create({
        ...createDocumentDto,
        fileName: file.filename,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        status: "pending",
        userId,
      });

      const savedDocument = await this.documentRepository.save(document);
      this.logger.log(`✅ Document saved to database with ID: ${savedDocument.id}`);

      // Console log the document details for debugging
      console.log('🔍 [BACKEND DEBUG] Document created:', {
        id: savedDocument.id,
        name: savedDocument.name,
        fileName: savedDocument.fileName,
        filePath: savedDocument.filePath,
        fileSize: savedDocument.fileSize,
        mimeType: savedDocument.mimeType,
        status: savedDocument.status,
        isProcessed: savedDocument.isProcessed,
        userId: savedDocument.userId,
        createdAt: savedDocument.createdAt
      });

      // Start async embedding process
      this.startAsyncEmbedding(savedDocument);

      return savedDocument;
    } catch (error) {
      this.logger.error(`❌ Failed to create document: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async startAsyncEmbedding(document: Document): Promise<void> {
    this.logger.log(`🔄 Starting async embedding for document: ${document.id}`);

    // Update status to embedding
    await this.updateDocumentStatus(document.id, "embedding");

    // Create notification that embedding has started
    await this.notificationService.createSystemNotification(
      document.userId,
      "Document Processing Started",
      `Your document "${document.name}" is being processed. You'll be notified when it's ready.`
    );

    // Send real-time notification
    this.notificationGateway.sendNotificationToUser(document.userId, {
      type: "document-embedding-started",
      documentId: document.id,
      status: "embedding",
      title: "Document Processing Started",
      message: `Processing "${document.name}"...`,
    });

    // Send to brain and wait for completion
    try {
      this.logger.log(`🧠 Sending document to brain for embedding: ${document.filePath}`);

      const absolutePath = require("path").resolve(document.filePath);

      const response = await fetch(`${this.brainApiUrl}/api/embedd/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_path: [absolutePath],
          document_id: document.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Brain API failed: ${response.status}`);
      }

      this.logger.log(`✅ Document processed successfully: ${document.id}`);
      await this.handleEmbeddingComplete(document.id, true);
    } catch (error) {
      this.logger.error(`❌ Failed to process document: ${error.message}`, error.stack);
      await this.handleEmbeddingComplete(document.id, false);
    }
  }

  private async updateDocumentStatus(
    documentId: string,
    status: "pending" | "embedding" | "processed" | "failed"
  ): Promise<void> {
    await this.documentRepository.update(documentId, {
      status,
      isProcessed: status === "processed",
    });
    this.logger.log(`📊 Updated document ${documentId} status to: ${status}`);
    
    // Emit status update via WebSocket
    this.embeddingStatusGateway.emitStatusUpdate(documentId, status);
  }

  private async handleEmbeddingComplete(documentId: string, success: boolean): Promise<void> {
    this.logger.log(`🔔 Embedding complete for document: ${documentId}, success: ${success}`);

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ["user"],
    });

    if (!document) {
      this.logger.error(`❌ Document not found: ${documentId}`);
      return;
    }

    const status = success ? "processed" : "failed";
    await this.updateDocumentStatus(documentId, status);

    // Create notification
    const title = success ? "Document Processed Successfully" : "Document Processing Failed";
    const message = success
      ? `Your document "${document.name}" has been processed and is ready for use.`
      : `Failed to process document "${document.name}". Please try uploading again.`;

    if (success) {
      await this.notificationService.createSuccessNotification(document.userId, title, message);
    } else {
      await this.notificationService.createErrorNotification(document.userId, title, message);
    }

    // Send real-time notification via WebSocket
    this.notificationGateway.sendNotificationToUser(document.userId, {
      type: "document-processed",
      documentId: documentId,
      status: status,
      title: title,
      message: message,
      success: success,
    });

    this.logger.log(`📡 Notification sent to user ${document.userId} for document: ${documentId}`);
  }

  private getBackendUrl(): string {
    return this.configService.get<string>("BACKEND_URL", "http://localhost:4001");
  }

  async findAll(userId: string): Promise<Document[]> {
    this.logger.log(`📋 Retrieving all documents for user: ${userId}`);

    try {
      const documents = await this.documentRepository.find({
        where: { userId },
        order: { createdAt: "DESC" },
      });

      this.logger.log(`✅ Found ${documents.length} documents for user ${userId}`);
      return documents;
    } catch (error) {
      this.logger.error(`❌ Failed to retrieve documents for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAllPaginated(userId: string, paginationDto: PaginationDto): Promise<PaginatedResult<Document>> {
    this.logger.log(`📋 Retrieving paginated documents for user: ${userId}`);

    try {
      const queryBuilder = this.documentRepository
        .createQueryBuilder("document")
        .where("document.userId = :userId", { userId });

      const result = await paginate<Document>(queryBuilder, paginationDto);

      this.logger.log(`✅ Found ${result.data.length} documents (page ${result.page} of ${result.totalPages})`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to retrieve documents: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<Document> {
    this.logger.log(`🔍 Finding document ${id} for user ${userId}`);

    try {
      const document = await this.documentRepository.findOne({
        where: { id, userId },
      });

      if (!document) {
        this.logger.warn(`⚠️ Document ${id} not found for user ${userId}`);
        throw new NotFoundException("Document not found");
      }

      this.logger.log(`✅ Found document: ${document.fileName}`);
      return document;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`❌ Failed to find document ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string): Promise<Document> {
    this.logger.log(`📝 Updating document ${id} for user ${userId}`);
    this.logger.debug(`📊 Update data: ${JSON.stringify(updateDocumentDto)}`);

    try {
      const document = await this.findOne(id, userId);
      Object.assign(document, updateDocumentDto);

      const updatedDocument = await this.documentRepository.save(document);
      this.logger.log(`✅ Document ${id} updated successfully`);
      return updatedDocument;
    } catch (error) {
      this.logger.error(`❌ Failed to update document ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`🗑️ Removing document ${id} for user ${userId}`);

    try {
      const document = await this.findOne(id, userId);
      await this.documentRepository.remove(document);
      this.logger.log(`✅ Document ${id} (${document.fileName}) removed successfully`);
    } catch (error) {
      this.logger.error(`❌ Failed to remove document ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async reprocessDocument(id: string, userId: string): Promise<void> {
    this.logger.log(`🔄 Starting reprocessing for document ${id}`);
    
    const document = await this.findOne(id, userId);
    
    if (!document) {
      throw new NotFoundException("Document not found");
    }

    // Reset status to pending
    await this.updateDocumentStatus(document.id, "pending");
    
    // Start async embedding process again
    this.startAsyncEmbedding(document);
    
    this.logger.log(`✅ Reprocessing initiated for document ${id}`);
  }
}
