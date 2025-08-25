import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatMessage } from "../chat/entities/chat-message.entity";
import { Chat } from "../chat/entities/chat.entity";
import { Chatbot } from "../chatbots/entities/chatbot.entity";
import { Document } from "../documents/entities/document.entity";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [TypeOrmModule.forFeature([Chatbot, Chat, ChatMessage, Document])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
