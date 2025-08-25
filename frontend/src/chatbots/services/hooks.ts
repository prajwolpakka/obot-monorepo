import { CHAT_KEY, MESSAGES_KEY } from "@/chat/services/hooks";
import { dashboardKeys, useDashboardCache } from "@/dashboard/services/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatbotsApi } from "./api";

const CHATBOT_KEY = "chatbots";

export const useChatbots = () => {
  return useQuery({
    queryKey: [CHATBOT_KEY],
    queryFn: chatbotsApi.getAll,
  });
};

export const useChatbot = (id: string) => {
  return useQuery({
    queryKey: [CHATBOT_KEY, id],
    queryFn: () => chatbotsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateChatbot = () => {
  const queryClient = useQueryClient();
  const { incrementChatbots } = useDashboardCache();

  return useMutation({
    mutationFn: chatbotsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHATBOT_KEY] });
      // Optimistically update dashboard metrics instead of refetching
      incrementChatbots();
    },
  });
};

export const useUpdateChatbot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatbotsApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CHATBOT_KEY] });
      queryClient.invalidateQueries({ queryKey: [CHATBOT_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [CHAT_KEY] });
      queryClient.invalidateQueries({ queryKey: [MESSAGES_KEY] });
      // Note: Update doesn't change metrics count, so no cache update needed
    },
  });
};

export const useDeleteChatbot = () => {
  const queryClient = useQueryClient();
  const { decrementChatbots } = useDashboardCache();

  return useMutation({
    mutationFn: chatbotsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHATBOT_KEY] });
      // Optimistically update dashboard metrics instead of refetching
      decrementChatbots();
    },
  });
};

export const useAddDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatbotId, files }: { chatbotId: string; files: File[] }) =>
      chatbotsApi.addDocuments(chatbotId, files),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CHATBOT_KEY, data.id] });
      // Note: Adding documents to chatbot doesn't change total document count
      // since they're linked, not new documents
    },
  });
};

export const useLinkDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatbotId, documentIds }: { chatbotId: string; documentIds: string[] }) =>
      chatbotsApi.linkDocuments(chatbotId, documentIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CHATBOT_KEY, data.id] });
      // Note: Linking documents to chatbot doesn't change total document count
      // since they're linked, not new documents
    },
  });
};

export const useRemoveDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatbotId, documentId }: { chatbotId: string; documentId: string }) =>
      chatbotsApi.removeDocument(chatbotId, documentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CHATBOT_KEY, data.id] });
      // Note: Removing documents from chatbot doesn't change total document count
      // since they're unlinked, not deleted
    },
  });
};
