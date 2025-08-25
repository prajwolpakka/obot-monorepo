import { IChat } from "@/chat/models/types";
import api from "@/common/services/api";
import { IMessageData, IMetrics, ITimeRangeStats } from "../models/types";

export const dashboardApi = {
  getMetrics: async () => {
    const response = await api.get<IMetrics>("/dashboard/metrics");
    return response.data;
  },

  getMessagesOverTime: async () => {
    const response = await api.get<IMessageData[]>("/dashboard/messages-over-time");
    return response.data;
  },

  getChatbotPerformance: async (timeRange: string = "7days") => {
    const response = await api.get<ITimeRangeStats>(`/dashboard/chatbot-performance?timeRange=${timeRange}`);
    return response.data;
  },

  getRecentConversations: async (limit: number = 10) => {
    const response = await api.get<IChat[]>(`/chat/conversations?limit=${limit}&offset=0`);
    return response.data;
  },
};
