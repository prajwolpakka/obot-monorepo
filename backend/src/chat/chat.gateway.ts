import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatbotsService } from '../chatbots/chatbots.service';
import { WebSocketAuthService } from '../auth/websocket-auth.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private chatService: ChatService,
    private chatbotsService: ChatbotsService,
    private webSocketAuthService: WebSocketAuthService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.webSocketAuthService.authenticateSocket(client);
      (client as any).user = user;
      this.logger.log(`Client connected: ${client.id} for user ${user.id}`);
    } catch (error) {
      this.logger.warn(`Authentication failed for client ${client.id}: ${error.message}`);
      // Don't disconnect for chat gateway as it might be used for public chatbots
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('get-chatbot-config')
  async handleGetChatbotConfig(
    @MessageBody() data: { chatbotId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Getting chatbot config for: ${data.chatbotId}`);

      // Use public method to get chatbot config without user validation
      const chatbot = await this.chatbotsService.findPublicChatbot(data.chatbotId);

      if (!chatbot) {
        client.emit('chatbot-config-error', {
          error: 'Chatbot not found',
        });
        return;
      }

      // Send configuration to client
      client.emit('chatbot-config', {
        id: chatbot.id,
        name: chatbot.name,
        welcomeMessage: chatbot.welcomeMessage,
        placeholder: chatbot.placeholder,
        color: chatbot.color,
        iconUrl: chatbot.iconUrl,
        triggers: chatbot.triggers || [],
        isActive: chatbot.isActive,
      });

    } catch (error) {
      this.logger.error(`Error getting chatbot config: ${error.message}`);
      client.emit('chatbot-config-error', {
        error: 'Failed to load chatbot configuration',
      });
    }
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @MessageBody() data: { 
      message: string; 
      chatbotId: string; 
      sessionId?: string;
      apiKey?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Received message: ${data.message} for chatbot: ${data.chatbotId}`);

      // Save user message
      const userMessage = await this.chatService.saveMessage({
        content: data.message,
        sender: 'user',
        chatbotId: data.chatbotId,
        sessionId: data.sessionId || client.id,
      });

      // Get documents associated with this chatbot
      const documents = await this.chatService.getChatbotDocuments(data.chatbotId);
      
      // Call brain API to get AI response
      const chatRequest = {
        question: data.message,
        chatbotId: data.chatbotId,
        stream: false,
        documents: documents // Include chatbot's documents for context
      };

      const botResponse = await this.chatService.chatWithBrain(chatRequest);

      // Save bot response
      const botMessage = await this.chatService.saveMessage({
        content: botResponse,
        sender: 'bot',
        chatbotId: data.chatbotId,
        sessionId: data.sessionId || client.id,
      });

      // Send response back to client
      client.emit('message-response', {
        message: botResponse,
        messageId: botMessage.id,
        timestamp: botMessage.createdAt,
      });

    } catch (error) {
      this.logger.error(`Error handling message: ${error.message}`);
      client.emit('message-error', {
        error: 'Failed to process message',
      });
    }
  }

  @SubscribeMessage('get-chat-history')
  async handleGetChatHistory(
    @MessageBody() data: { 
      chatbotId: string; 
      sessionId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Getting chat history for session: ${data.sessionId}, chatbot: ${data.chatbotId}`);

      const messages = await this.chatService.getChatHistory(data.chatbotId, data.sessionId);

      client.emit('chat-history', {
        messages: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp,
        })),
      });

    } catch (error) {
      this.logger.error(`Error getting chat history: ${error.message}`);
      client.emit('chat-history-error', {
        error: 'Failed to load chat history',
      });
    }
  }

  @SubscribeMessage('join-chat')
  handleJoinChat(
    @MessageBody() data: { chatbotId: string; sessionId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `chatbot-${data.chatbotId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} joined room: ${roomName}`);
  }
}