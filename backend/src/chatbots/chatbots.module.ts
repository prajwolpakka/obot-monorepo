import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotsController } from './chatbots.controller';
import { ChatbotsPublicController } from './chatbots-public.controller';
import { ChatbotsService } from './chatbots.service';
import { Chatbot } from './entities/chatbot.entity';
import { ChatbotDocument } from './entities/chatbot-document.entity';
import { Document } from '../documents/entities/document.entity';
import { SubscriptionModule } from '../subscription/subscription.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chatbot, ChatbotDocument, Document]), SubscriptionModule, DocumentsModule],
  controllers: [ChatbotsController, ChatbotsPublicController],
  providers: [ChatbotsService],
  exports: [ChatbotsService],
})
export class ChatbotsModule {}
