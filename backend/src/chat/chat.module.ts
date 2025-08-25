import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Chatbot } from '../chatbots/entities/chatbot.entity';
import { ChatbotsService } from '../chatbots/chatbots.service';
import { ChatbotDocument } from '../chatbots/entities/chatbot-document.entity';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMessage, Chatbot, ChatbotDocument, Document]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, ChatbotsService],
  exports: [ChatService],
})
export class ChatModule {}