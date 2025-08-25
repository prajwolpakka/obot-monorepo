import { IChat, IMessage } from "@/chat/models/types";
import { ICreateChatbotSchema } from "@/chatbots/models/schema";
import api from "@/common/services/api";

export const chatApi = {
  createChat: async (data: ICreateChatbotSchema) => {
    const response = await api.post<IChat>("/chat/create", data);
    return response.data;
  },

  getConversations: async (limit: number = 10, offset: number = 0) => {
    const response = await api.get<IChat[]>(`/chat/conversations?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getChatMessages: async (chatId: string) => {
    const response = await api.get<IMessage[]>(`/chat/${chatId}/messages`);
    return response.data;
  },

  getChatbotConversations: async (chatbotId: string) => {
    const response = await api.get<IChat[]>(`/chat/chatbot/${chatbotId}/conversations`);
    return response.data;
  },

  deleteConversation: async (chatId: string) => {
    const response = await api.delete(`/chat/${chatId}`);
    return response.data;
  },

  askQuestion: async (data: {
    question: string;
    documents: string[];
    chatbotId?: string;
    stream: boolean;
  }) => {
    const response = await api.post("/chat/ask", data);
    return response.data;
  },
};
