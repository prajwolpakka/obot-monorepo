import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Chatbot } from '../chatbots/entities/chatbot.entity';
import { ChatbotsModule } from '../chatbots/chatbots.module';
import { ChatbotDocument } from '../chatbots/entities/chatbot-document.entity';
import { Document } from '../documents/entities/document.entity';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMessage, Chatbot, ChatbotDocument, Document]),
    forwardRef(() => AuthModule),
    SubscriptionModule,
    AiModule,
    ChatbotsModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
