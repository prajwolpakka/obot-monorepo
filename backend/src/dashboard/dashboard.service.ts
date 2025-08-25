import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, MoreThanOrEqual, Repository } from "typeorm";
import { ChatMessage } from "../chat/entities/chat-message.entity";
import { Chat } from "../chat/entities/chat.entity";
import { Chatbot } from "../chatbots/entities/chatbot.entity";
import { Document } from "../documents/entities/document.entity";
import { getDefaultMessagesData, getDefaultPerformanceData, getTimeRangeDays } from "./utils/dashboard-helpers";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Chatbot)
    private chatbotRepository: Repository<Chatbot>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>
  ) {}

  async getMetrics(userId: string) {
    try {
      // Get user's chatbots
      const userChatbots = await this.chatbotRepository.find({
        where: { userId },
      });

      const chatbotIds = userChatbots.map((bot) => bot.id);

      // Basic counts
      const totalChatbots = userChatbots.length;

      const totalChats =
        chatbotIds.length > 0
          ? await this.chatRepository.count({
              where: { chatbotId: In(chatbotIds) },
            })
          : 0;

      const totalMessages =
        chatbotIds.length > 0
          ? await this.chatMessageRepository.count({
              where: {
                chat: { chatbotId: In(chatbotIds) },
              },
              relations: ["chat"],
            })
          : 0;

      const totalDocuments = await this.documentRepository.count({
        where: { userId },
      });

      return {
        totalChatbots,
        totalChats,
        totalMessages,
        totalDocuments,
      };
    } catch (error) {
      console.error("Metrics service error:", error);
      return {
        totalChatbots: 0,
        totalChats: 0,
        totalMessages: 0,
        totalDocuments: 0,
      };
    }
  }

  async getMessagesOverTime(userId: string) {
    try {
      // Get user's chatbots
      const userChatbots = await this.chatbotRepository.find({
        where: { userId },
      });

      const chatbotIds = userChatbots.map((bot) => bot.id);

      if (chatbotIds.length === 0) {
        return getDefaultMessagesData("365days");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Always return 365 days of data
      const days = 365;
      const messagesPerDay: Array<{ date: string; messages: number }> = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await this.chatMessageRepository.count({
          where: {
            createdAt: Between(date, nextDate),
            chat: { chatbotId: In(chatbotIds) },
          },
          relations: ["chat"],
        });

        messagesPerDay.push({
          date: date.toISOString().split("T")[0],
          messages: count,
        });
      }

      return messagesPerDay;
    } catch (error) {
      console.error("Messages service error:", error);
      return getDefaultMessagesData("365days");
    }
  }

  async getChatbotPerformance(userId: string, timeRange: string = "7days") {
    try {
      // Get user's chatbots
      const userChatbots = await this.chatbotRepository.find({
        where: { userId },
      });

      if (userChatbots.length === 0) {
        return getDefaultPerformanceData();
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const days = getTimeRangeDays(timeRange);
      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const chatbotStats = await Promise.all(
        userChatbots.map(async (chatbot) => {
          // Get messages for this time period
          const messageCount = await this.chatMessageRepository.count({
            where: {
              chat: { chatbotId: chatbot.id },
              createdAt: MoreThanOrEqual(cutoffDate),
            },
            relations: ["chat"],
          });

          // Get chats for this time period
          const chatCount = await this.chatRepository.count({
            where: {
              chatbotId: chatbot.id,
              startedAt: MoreThanOrEqual(cutoffDate),
            },
          });

          return {
            id: chatbot.id,
            name: chatbot.name,
            color: chatbot.color,
            iconUrl: chatbot.iconUrl,
            messageCount,
            chatCount,
          };
        })
      );

      return {
        byMessages: chatbotStats.sort((a, b) => b.messageCount - a.messageCount).slice(0, 5),
        byConversations: chatbotStats.sort((a, b) => b.chatCount - a.chatCount).slice(0, 5),
      };
    } catch (error) {
      console.error("Performance service error:", error);
      return getDefaultPerformanceData();
    }
  }
}
