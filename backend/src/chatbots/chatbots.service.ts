import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { rename, unlink } from "fs/promises";
import { extname, join } from "path";
import { In, Repository } from "typeorm";
import { DocumentsService } from "../documents/documents.service";
import { Document } from "../documents/entities/document.entity";
import { CreateChatbotDto } from "./dto/create-chatbot.dto";
import { UpdateChatbotDto } from "./dto/update-chatbot.dto";
import { ChatbotDocument } from "./entities/chatbot-document.entity";
import { Chatbot } from "./entities/chatbot.entity";
import { SubscriptionService } from "../subscription/subscription.service";

@Injectable()
export class ChatbotsService {
  constructor(
    @InjectRepository(Chatbot)
    private chatbotRepository: Repository<Chatbot>,
    @InjectRepository(ChatbotDocument)
    private chatbotDocumentRepository: Repository<ChatbotDocument>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private subscriptionService: SubscriptionService,
    private documentsService: DocumentsService
  ) {}

  private transformChatbot(chatbot: Chatbot): any {
    if (!chatbot) {
      return null;
    }

    const transformed: any = {
      ...chatbot,
    };

    if (chatbot.documents && Array.isArray(chatbot.documents)) {
      transformed.documents = chatbot.documents
        .filter((cd) => cd.document) // Filter out any null documents
        .map((cd) => ({
          id: cd.document.id,
          name: cd.document.name,
          fileName: cd.document.fileName,
          mimeType: cd.document.mimeType,
          fileSize: cd.document.fileSize,
          isProcessed: cd.document.isProcessed,
          createdAt: cd.document.createdAt,
        }));
    } else {
      transformed.documents = [];
    }

    return transformed;
  }

  async create(
    createChatbotDto: CreateChatbotDto,
    userId: string,
    iconFile?: Express.Multer.File,
    uploadedFiles?: Express.Multer.File[]
  ): Promise<any> {
    const subscription = await this.subscriptionService.findOrCreateByUserId(userId);
    const plan = this.subscriptionService.getPlanById(subscription.plan);
    if (plan?.maxChatbots !== undefined) {
      const existing = await this.chatbotRepository.count({ where: { userId } });
      if (existing >= plan.maxChatbots) {
        throw new BadRequestException("Chatbot limit reached for your current plan");
      }
    }

    // Extract selectedDocuments, files, triggers, and allowedDomains from DTO
    const { selectedDocuments, files, triggers, allowedDomains, ...chatbotData } = createChatbotDto;

    // Convert triggers to proper format
    const processedTriggers =
      triggers && Array.isArray(triggers) && triggers.length > 0
        ? triggers // Triggers are already objects with id and value from frontend
        : [];

    // Convert allowedDomains to proper format
    const processedAllowedDomains =
      allowedDomains && Array.isArray(allowedDomains) && allowedDomains.length > 0
        ? allowedDomains // AllowedDomains are already objects with id and value from frontend
        : [];

    const chatbot = this.chatbotRepository.create({
      ...chatbotData,
      triggers: processedTriggers,
      allowedDomains: processedAllowedDomains,
      userId,
    });
    const savedChatbot = await this.chatbotRepository.save(chatbot);

    // Handle uploaded files first
    let uploadedDocumentIds: string[] = [];
    let createdDocs: Document[] = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      // Create document entries for uploaded files
      const uploadedDocs = await Promise.all(
        uploadedFiles.map(async (file) => {
          const document = this.documentRepository.create({
            name: file.originalname,
            fileName: file.filename,
            filePath: file.path,
            mimeType: file.mimetype,
            fileSize: file.size,
            userId: userId,
            isProcessed: false,
          });
          return await this.documentRepository.save(document);
        })
      );
      uploadedDocumentIds = uploadedDocs.map((doc) => doc.id);
      createdDocs = uploadedDocs;
    }

    // Combine selected documents and newly uploaded document IDs
    const allDocumentIds = [...(selectedDocuments || []), ...uploadedDocumentIds];

    // Handle document associations
    if (allDocumentIds.length > 0) {
      // Verify that selected documents exist and belong to the user
      if (selectedDocuments && selectedDocuments.length > 0) {
        const existingDocs = await this.documentRepository.find({
          where: {
            id: In(selectedDocuments),
            userId: userId,
          },
        });

        if (existingDocs.length !== selectedDocuments.length) {
          throw new BadRequestException("Some selected documents not found or not owned by user");
        }
      }

      // Create associations
      const chatbotDocuments = allDocumentIds.map((documentId) => ({
        chatbotId: savedChatbot.id,
        documentId: documentId,
      }));

      await this.chatbotDocumentRepository.save(chatbotDocuments);

      // Kick off embedding for each newly uploaded document so status + notifications mirror direct uploads
      for (const doc of createdDocs) {
        try {
          await this.documentsService.reprocessDocument(doc.id, userId);
        } catch (err) {
          // Continue processing others even if one fails to enqueue
          console.error(`Failed to start embedding for document ${doc.id}:`, err?.message || err);
        }
      }
    }

    // Handle icon file
    if (iconFile && savedChatbot.id) {
      const oldPath = iconFile.path;
      const extension = iconFile.filename.split(".").pop();
      const newFilename = `${savedChatbot.id}.${extension}`;
      const newPath = join(process.cwd(), "uploads", "icons", newFilename);

      try {
        await rename(oldPath, newPath);
        savedChatbot.iconUrl = `/api/chatbots/icons/${newFilename}`;
        await this.chatbotRepository.save(savedChatbot);
      } catch (error) {
        console.error("Error renaming icon file:", error);
      }
    }

    // Return chatbot with documents
    const chatbotWithDocuments = await this.chatbotRepository.findOne({
      where: { id: savedChatbot.id },
      relations: ["documents", "documents.document"],
    });

    if (!chatbotWithDocuments) {
      throw new Error("Failed to retrieve created chatbot");
    }

    return this.transformChatbot(chatbotWithDocuments);
  }

  async findAll(userId: string): Promise<any[]> {
    const chatbots = await this.chatbotRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      relations: ["documents", "documents.document"],
    });

    return chatbots.map((chatbot) => this.transformChatbot(chatbot));
  }

  async findAllWithDomains(): Promise<{ id: string; allowedDomains: { id: string; value: string }[] }[]> {
    const chatbots = await this.chatbotRepository.find({
      where: { isActive: true },
      select: ["id", "allowedDomains"],
    });

    return chatbots.map((chatbot) => ({
      id: chatbot.id,
      allowedDomains: chatbot.allowedDomains || [],
    }));
  }

  async findOne(id: string, userId?: string): Promise<any> {
    const whereClause = userId ? { id, userId } : { id };

    const chatbot = await this.chatbotRepository.findOne({
      where: whereClause,
      relations: ["documents", "documents.document"],
    });

    if (!chatbot) {
      throw new NotFoundException("Chatbot not found");
    }

    return this.transformChatbot(chatbot);
  }

  // Public method to get chatbot config without user validation
  async findPublicChatbot(id: string): Promise<any> {
    const chatbot = await this.chatbotRepository.findOne({
      where: { id },
      select: ["id", "name", "welcomeMessage", "placeholder", "color", "iconUrl", "triggers", "isActive"],
    });

    if (!chatbot) {
      throw new NotFoundException("Chatbot not found");
    }

    return chatbot;
  }

  async update(
    id: string,
    updateChatbotDto: UpdateChatbotDto,
    userId: string,
    iconFile?: Express.Multer.File
  ): Promise<any> {
    const chatbot = await this.chatbotRepository.findOne({
      where: { id, userId },
    });

    if (!chatbot) {
      throw new NotFoundException("Chatbot not found");
    }

    // Extract files, triggers, and allowedDomains from DTO
    const { files, triggers, allowedDomains, ...chatbotData } = updateChatbotDto;

    // Update basic chatbot data
    Object.assign(chatbot, chatbotData);

    // Handle triggers update
    if (triggers !== undefined) {
      if (Array.isArray(triggers) && triggers.length > 0) {
        // Triggers are already objects with id and value from frontend
        chatbot.triggers = triggers;
      } else {
        chatbot.triggers = [];
      }
    }

    // Handle allowedDomains update
    if (allowedDomains !== undefined) {
      if (Array.isArray(allowedDomains) && allowedDomains.length > 0) {
        // AllowedDomains are already objects with id and value from frontend
        chatbot.allowedDomains = allowedDomains;
      } else {
        chatbot.allowedDomains = [];
      }
    }

    // Handle icon update
    if (iconFile && chatbot.id) {
      const oldPath = iconFile.path;
      const extension = iconFile.filename.split(".").pop();
      const newFilename = `${chatbot.id}.${extension}`;
      const newPath = join(process.cwd(), "uploads", "icons", newFilename);

      try {
        await rename(oldPath, newPath);
        chatbot.iconUrl = `/api/chatbots/icons/${newFilename}`;
      } catch (error) {
        console.error("Error renaming icon file:", error);
      }
    }

    await this.chatbotRepository.save(chatbot);

    // Handle file associations if files field is provided
    if (files !== undefined) {
      // Delete existing associations
      await this.chatbotDocumentRepository.delete({ chatbotId: id });

      // Create new associations if files array is not empty
      if (files.length > 0) {
        // Verify that all documents exist and belong to the user
        const documents = await this.documentRepository.find({
          where: {
            id: In(files),
            userId: userId,
          },
        });

        if (documents.length !== files.length) {
          throw new BadRequestException("Some documents not found or not owned by user");
        }

        // Create new associations
        const chatbotDocuments = files.map((documentId) => ({
          chatbotId: id,
          documentId: documentId,
        }));

        await this.chatbotDocumentRepository.save(chatbotDocuments);
      }
    }

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const chatbot = await this.chatbotRepository.findOne({
      where: { id, userId },
      relations: ["chats", "chats.messages"],
    });

    if (!chatbot) {
      throw new NotFoundException(`Chatbot with ID ${id} not found`);
    }

    // Delete icon file if exists
    if (chatbot.iconUrl) {
      const filename = chatbot.iconUrl.split("/").pop();
      if (filename) {
        const filePath = join(process.cwd(), "uploads", "icons", filename);
        try {
          await unlink(filePath);
        } catch (error) {
          console.error("Error deleting icon file:", error);
        }
      }
    }

    // TypeORM cascade will handle chats and their messages automatically
    await this.chatbotRepository.remove(chatbot);
  }

  async addDocuments(chatbotId: string, files: Express.Multer.File[], userId: string): Promise<Chatbot> {
    const chatbot = await this.findOne(chatbotId, userId);

    if (files && files.length > 0) {
      const newDocuments = await Promise.all(
        files.map(async (file) => {
          const document = this.documentRepository.create({
            name: file.originalname.replace(extname(file.originalname), ""),
            fileName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype,
            isProcessed: false,
            userId: userId,
          });
          return await this.documentRepository.save(document);
        })
      );

      const chatbotDocuments = newDocuments.map((doc) =>
        this.chatbotDocumentRepository.create({
          chatbotId: chatbotId,
          documentId: doc.id,
        })
      );

      await this.chatbotDocumentRepository.save(chatbotDocuments);

      // Trigger embedding for each new document (match behavior of direct upload)
      for (const doc of newDocuments) {
        try {
          await this.documentsService.reprocessDocument(doc.id, userId);
        } catch (err) {
          console.error(`Failed to start embedding for document ${doc.id}:`, err?.message || err);
        }
      }
    }

    return this.findOne(chatbotId, userId);
  }

  async linkDocuments(chatbotId: string, documentIds: string[], userId: string): Promise<Chatbot> {
    const chatbot = await this.findOne(chatbotId, userId);

    if (documentIds && documentIds.length > 0) {
      // Verify that all documents exist and belong to the user
      const documents = await this.documentRepository.find({
        where: {
          id: In(documentIds),
          userId: userId,
        },
      });

      if (documents.length !== documentIds.length) {
        throw new BadRequestException("One or more documents not found or do not belong to you");
      }

      // Check if any documents are already linked
      const existingAssociations = await this.chatbotDocumentRepository.find({
        where: {
          chatbotId: chatbotId,
          documentId: In(documentIds),
        },
      });

      // Filter out documents that are already linked
      const alreadyLinkedIds = existingAssociations.map((assoc) => assoc.documentId);
      const newDocumentIds = documentIds.filter((id) => !alreadyLinkedIds.includes(id));

      if (newDocumentIds.length > 0) {
        // Create new associations for documents that aren't already linked
        const chatbotDocuments = newDocumentIds.map((docId) =>
          this.chatbotDocumentRepository.create({
            chatbotId: chatbotId,
            documentId: docId,
          })
        );

        await this.chatbotDocumentRepository.save(chatbotDocuments);
      }
    }

    return this.findOne(chatbotId, userId);
  }

  async findOnePublic(id: string): Promise<Chatbot | null> {
    return this.chatbotRepository.findOne({
      where: { id, isActive: true },
      select: ["id", "allowedDomains"],
    });
  }

  async findByDomain(domain: string): Promise<{ id: string } | null> {
    const chatbots = await this.chatbotRepository.find({
      where: { isActive: true },
      select: ["id", "allowedDomains"],
    });

    // Find chatbot that has this domain in allowedDomains
    for (const chatbot of chatbots) {
      if (chatbot.allowedDomains && chatbot.allowedDomains.length > 0) {
        const isAllowed = chatbot.allowedDomains.some((allowedDomain) => {
          try {
            // Parse the stored domain value to extract hostname and port
            const storedValue = allowedDomain.value;

            // If stored value is a full URL (starts with http/https), extract hostname
            if (storedValue.startsWith("http://") || storedValue.startsWith("https://")) {
              const url = new URL(storedValue);
              const storedHost = url.host; // includes port if present (e.g., "localhost:4000")
              const storedHostname = url.hostname; // just hostname (e.g., "localhost")

              // Check exact match with host (hostname:port) or just hostname
              return domain === storedHost || domain === storedHostname || domain.endsWith("." + storedHostname);
            } else {
              // For backwards compatibility, handle plain domain values
              return domain === storedValue || domain.endsWith("." + storedValue);
            }
          } catch (error) {
            // If URL parsing fails, fall back to direct comparison
            return domain === allowedDomain.value || domain.endsWith("." + allowedDomain.value);
          }
        });
        if (isAllowed) {
          return { id: chatbot.id };
        }
      }
    }

    return null;
  }

  async removeDocument(chatbotId: string, documentId: string, userId: string): Promise<Chatbot> {
    const chatbot = await this.findOne(chatbotId, userId);

    // Find and remove the chatbot-document association
    const association = await this.chatbotDocumentRepository.findOne({
      where: { chatbotId, documentId },
    });

    if (association) {
      // Only unlink from the chatbot — keep the document in the user's library
      await this.chatbotDocumentRepository.remove(association);
    }

    return this.findOne(chatbotId, userId);
  }

  async debugChatbotDocuments(chatbotId: string, userId: string): Promise<any> {
    const chatbot = await this.findOne(chatbotId, userId);

    // Get all chatbot-document associations
    const associations = await this.chatbotDocumentRepository.find({
      where: { chatbotId },
      relations: ["document"],
    });

    // Get detailed document information
    const documentDetails = await Promise.all(
      associations.map(async (assoc) => {
        const document = assoc.document;
        return {
          association_id: assoc.id,
          document_id: document.id,
          document_name: document.name,
          file_name: document.fileName,
          file_path: document.filePath,
          file_size: document.fileSize,
          mime_type: document.mimeType,
          status: document.status,
          is_processed: document.isProcessed,
          created_at: document.createdAt,
          updated_at: document.updatedAt,
        };
      })
    );

    return {
      chatbot_id: chatbotId,
      chatbot_name: chatbot.name,
      total_documents: documentDetails.length,
      documents: documentDetails,
      associations_raw: associations.map((assoc) => ({
        id: assoc.id,
        chatbot_id: assoc.chatbotId,
        document_id: assoc.documentId,
      })),
    };
  }
}
