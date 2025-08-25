import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Chatbot } from '../chatbots/entities/chatbot.entity';
import { ChatbotDocument } from '../chatbots/entities/chatbot-document.entity';
import { ConfigService } from '@nestjs/config';
import { ChatRequestDto } from './dto/chat-request.dto';

export interface SaveMessageDto {
  content: string;
  sender: 'user' | 'bot';
  chatbotId: string;
  sessionId: string;
}

interface ChatbotConfig {
  tone?: 'professional' | 'friendly' | 'casual';
  shouldFollowUp?: boolean;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly brainApiUrl: string;

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Chatbot)
    private chatbotRepository: Repository<Chatbot>,
    @InjectRepository(ChatbotDocument)
    private chatbotDocumentRepository: Repository<ChatbotDocument>,
    private configService: ConfigService,
  ) {
    this.brainApiUrl = this.configService.get<string>('BRAIN_API_URL', 'http://localhost:6002');
    this.logger.log(`🧠 Brain API URL configured: ${this.brainApiUrl}`);
  }

  async saveMessage(saveMessageDto: SaveMessageDto): Promise<ChatMessage> {
    const { content, sender, chatbotId, sessionId } = saveMessageDto;

    // Verify chatbot exists
    const chatbot = await this.chatbotRepository.findOne({
      where: { id: chatbotId }
    });

    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    // Find or create chat session
    let chat = await this.chatRepository.findOne({
      where: { 
        chatbotId: chatbotId,
        sessionId: sessionId 
      }
    });

    if (!chat) {
      chat = this.chatRepository.create({
        chatbotId: chatbotId,
        sessionId: sessionId,
        startedAt: new Date(),
      });
      chat = await this.chatRepository.save(chat);
    }

    // Save message
    const message = this.chatMessageRepository.create({
      content,
      sender,
      chatId: chat.id,
      timestamp: new Date(),
    });

    return await this.chatMessageRepository.save(message);
  }

  async getChatHistory(chatbotId: string, sessionId: string): Promise<ChatMessage[]> {
    const chat = await this.chatRepository.findOne({
      where: { 
        chatbotId: chatbotId,
        sessionId: sessionId 
      },
      relations: ['messages']
    });

    return chat?.messages || [];
  }

  async getConversationsForUser(userId: string, limit: number = 10, offset: number = 0): Promise<Chat[]> {
    // Get all chatbots for this user first
    const chatbots = await this.chatbotRepository.find({
      where: { userId },
      select: ['id']
    });
    
    const chatbotIds = chatbots.map(cb => cb.id);
    
    if (chatbotIds.length === 0) {
      return [];
    }
    
    return await this.chatRepository.find({
      where: { chatbotId: In(chatbotIds) },
      relations: ['messages', 'chatbot'],
      select: {
        chatbot: {
          id: true,
          name: true,
          iconUrl: true,
          color: true,
        }
      },
      order: { startedAt: 'DESC' },
      take: limit,
      skip: offset
    });
  }

  async getAllChatsForChatbot(chatbotId: string): Promise<Chat[]> {
    return await this.chatRepository.find({
      where: { chatbotId },
      relations: ['messages'],
      order: { startedAt: 'DESC' }
    });
  }

  async getChatMessagesForChat(chatId: string): Promise<ChatMessage[]> {
    return await this.chatMessageRepository.find({
      where: { chatId },
      order: { createdAt: 'ASC' }
    });
  }

  async deleteConversation(chatId: string, userId: string): Promise<void> {
    // First verify that the chat belongs to the user
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['chatbot']
    });

    if (!chat) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify ownership through chatbot
    const chatbot = await this.chatbotRepository.findOne({
      where: { id: chat.chatbotId, userId }
    });

    if (!chatbot) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    // Delete all messages first (cascade should handle this, but being explicit)
    await this.chatMessageRepository.delete({ chatId });
    
    // Delete the chat
    await this.chatRepository.delete(chatId);
  }

  async getChatbotDocuments(chatbotId: string): Promise<string[]> {
    this.logger.log(`📋 Getting documents for chatbot: ${chatbotId}`);
    
    const chatbotDocuments = await this.chatbotDocumentRepository.find({
      where: { chatbotId },
      select: ['documentId'],
      relations: ['document']
    });

    const documentIds = chatbotDocuments.map(cd => cd.documentId);
    this.logger.log(`📄 Found ${documentIds.length} documents for chatbot ${chatbotId}`);
    
    return documentIds;
  }

  async chatWithBrain(chatRequest: ChatRequestDto): Promise<string> {
    try {
      // Get chatbot configuration if chatbotId is provided
      let chatbotConfig: ChatbotConfig | null = null;
      if (chatRequest.chatbotId) {
        const chatbot = await this.chatbotRepository.findOne({
          where: { id: chatRequest.chatbotId }
        });
        chatbotConfig = {
          tone: chatbot?.tone,
          shouldFollowUp: chatbot?.shouldFollowUp
        };
      }

      const enhancedRequest = {
        ...chatRequest,
        chatbotConfig
      };

      const response = await fetch(`${this.brainApiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedRequest),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read response');
        this.logger.error(`❌ Brain API failed with status ${response.status}: ${errorText}`);
        throw new Error(`Brain API failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      this.logger.debug(`📥 Brain API response: ${JSON.stringify(result)}`);
      
      const answer = result.data?.answer || 'No response from AI';
      this.logger.log(`✅ Chat response received from brain (${answer.length} characters)`);
      return answer;
    } catch (error) {
      this.logger.error(`❌ Failed to chat with brain: ${error.message}`, error.stack);
      throw new Error('Failed to get AI response');
    }
  }

  async chatWithBrainStream(chatRequest: ChatRequestDto, onChunk: (chunk: string) => void): Promise<void> {
    try {
      // Get chatbot configuration if chatbotId is provided
      let chatbotConfig: ChatbotConfig | null = null;
      if (chatRequest.chatbotId) {
        const chatbot = await this.chatbotRepository.findOne({
          where: { id: chatRequest.chatbotId }
        });
        chatbotConfig = {
          tone: chatbot?.tone,
          shouldFollowUp: chatbot?.shouldFollowUp
        };
      }

      const enhancedRequest = {
        ...chatRequest,
        chatbotConfig,
        stream: true
      };

      const response = await fetch(`${this.brainApiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedRequest),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read response');
        this.logger.error(`Brain API failed with status ${response.status}: ${errorText}`);
        throw new Error(`Brain API failed: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
      
      this.logger.log(`✅ Chat stream completed`);
    } catch (error) {
      this.logger.error(`❌ Failed to stream chat with brain: ${error.message}`, error.stack);
      throw new Error('Failed to stream AI response');
    }
  }
}
