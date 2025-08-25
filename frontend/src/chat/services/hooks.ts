import { useDashboardCache } from "@/dashboard/services/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "./api";

export const CHAT_KEY = "chats";
export const MESSAGES_KEY = "chat-messages";

// Queries
export const useChats = (limit: number = 10, offset: number = 0) => {
  return useQuery({
    queryKey: [CHAT_KEY, limit, offset],
    queryFn: () => chatApi.getConversations(limit, offset),
  });
};

export const useChatMessages = (chatId: string) => {
  return useQuery({
    queryKey: [MESSAGES_KEY, chatId],
    queryFn: () => chatApi.getChatMessages(chatId),
    enabled: !!chatId,
  });
};

export const useChatbotConversations = (chatbotId: string) => {
  return useQuery({
    queryKey: [CHAT_KEY, "chatbot", chatbotId],
    queryFn: () => chatApi.getChatbotConversations(chatbotId),
    enabled: !!chatbotId,
  });
};

// Mutations
export const useCreateChat = () => {
  const queryClient = useQueryClient();
  const { incrementChats } = useDashboardCache();

  return useMutation({
    mutationFn: chatApi.createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAT_KEY] });
      // Optimistically update dashboard metrics instead of refetching
      incrementChats();
    },
  });
};

// Helper hook for when messages are sent (to be used by chat components)
export const useMessageSent = () => {
  const { incrementMessages } = useDashboardCache();

  return {
    onMessageSent: (messageCount: number = 1) => {
      incrementMessages(messageCount);
    },
  };
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  const { decrementChats } = useDashboardCache();

  return useMutation({
    mutationFn: chatApi.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAT_KEY] });
      decrementChats();
    },
  });
};
