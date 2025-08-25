import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IMetrics } from "../models/types";
import { dashboardApi } from "./api";

export const dashboardKeys = {
  metrics: ["dashboard", "metrics"] as const,
  messages: (timeRange: string) => ["dashboard", "messages", timeRange] as const,
  performance: (timeRange: string) => ["dashboard", "performance", timeRange] as const,
  recentChats: (limit: number) => ["dashboard", "recent-chats", limit] as const,
};

export const useMetrics = () => {
  return useQuery({
    queryKey: dashboardKeys.metrics,
    queryFn: dashboardApi.getMetrics,
  });
};

export const useMessagesOverTime = () => {
  return useQuery({
    queryKey: dashboardKeys.messages("365days"),
    queryFn: dashboardApi.getMessagesOverTime,
  });
};

export const useChatbotPerformance = (timeRange: string = "7days") => {
  return useQuery({
    queryKey: dashboardKeys.performance(timeRange),
    queryFn: () => dashboardApi.getChatbotPerformance(timeRange),
  });
};

export const useRecentConversations = (limit: number = 10) => {
  return useQuery({
    queryKey: dashboardKeys.recentChats(limit),
    queryFn: () => dashboardApi.getRecentConversations(limit),
  });
};

// Cache update utilities
export const useDashboardCache = () => {
  const queryClient = useQueryClient();

  const updateMetricsCache = (updates: Partial<IMetrics>) => {
    queryClient.setQueryData<IMetrics>(dashboardKeys.metrics, (old) => {
      if (!old) return old;
      return { ...old, ...updates };
    });
  };

  const incrementChatbots = () => {
    updateMetricsCache({
      totalChatbots: (queryClient.getQueryData<IMetrics>(dashboardKeys.metrics)?.totalChatbots || 0) + 1,
    });
  };

  const decrementChatbots = () => {
    updateMetricsCache({
      totalChatbots: Math.max(0, (queryClient.getQueryData<IMetrics>(dashboardKeys.metrics)?.totalChatbots || 0) - 1),
    });
  };

  const incrementDocuments = () => {
    updateMetricsCache({
      totalDocuments: (queryClient.getQueryData<IMetrics>(dashboardKeys.metrics)?.totalDocuments || 0) + 1,
    });
  };

  const decrementDocuments = () => {
    updateMetricsCache({
      totalDocuments: Math.max(0, (queryClient.getQueryData<IMetrics>(dashboardKeys.metrics)?.totalDocuments || 0) - 1),
    });
  };

  const incrementChats = () => {
    updateMetricsCache({
      totalChats: (queryClient.getQueryData<IMetrics>(dashboardKeys.metrics)?.totalChats || 0) + 1,
    });
  };

  const decrementChats = () => {
    updateMetricsCache({
      totalChats: Math.max(0, (queryClient.getQueryData<IMetrics>(dashboardKeys.metrics)?.totalChats || 0) - 1),
    });
  };

  const incrementMessages = (count: number = 1) => {
    updateMetricsCache({
      totalMessages: (queryClient.getQueryData<IMetrics>(dashboardKeys.metrics)?.totalMessages || 0) + count,
    });
  };

  return {
    updateMetricsCache,
    incrementChatbots,
    decrementChatbots,
    incrementDocuments,
    decrementDocuments,
    incrementChats,
    decrementChats,
    incrementMessages,
  };
};
