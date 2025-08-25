import PageTitle from "@/common/components/page-title";
import { useState } from "react";
import ChatbotPerformance from "../components/chatbot-performance";
import DashboardSkeleton from "../components/dashboard-skeleton";
import MessagesTrendsChart from "../components/messages-trends-chart";
import MetricsCards from "../components/metrics-cards";
import RecentConversations from "../components/recent-conversations";
import { useChatbotPerformance, useMessagesOverTime, useMetrics, useRecentConversations } from "../services/hooks";

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [performanceTimeRange, setPerformanceTimeRange] = useState("7days");

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useMetrics();
  const { data: messagesPerDay, isLoading: messagesLoading, error: messagesError } = useMessagesOverTime();
  const {
    data: popularChatbots,
    isLoading: performanceLoading,
    error: performanceError,
  } = useChatbotPerformance(performanceTimeRange);
  const { data: recentChats, isLoading: chatsLoading, error: chatsError } = useRecentConversations(10);

  const isLoading = metricsLoading || messagesLoading || chatsLoading || performanceLoading;
  const error = metricsError || messagesError || chatsError || performanceError;

  if (error) {
    return (
      <div className="p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading dashboard data</p>
        </div>
      </div>
    );
  }

  if (isLoading || !metrics) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 p-4">
      <PageTitle title="Dashboard" description="Overview of your chatbot performance and analytics" />

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} />

      {/* Two Column Layout - Recent Conversations & Messages Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentConversations recentChats={recentChats} />
        <MessagesTrendsChart messagesPerDay={messagesPerDay} timeRange={timeRange} setTimeRange={setTimeRange} />
      </div>

      {/* Chatbot Performance - Full Width */}
      <ChatbotPerformance
        selectedChatbots={popularChatbots}
        performanceTimeRange={performanceTimeRange}
        isPerformanceLoading={performanceLoading}
        onTimeRangeChange={setPerformanceTimeRange}
      />
    </div>
  );
};

export default DashboardPage;
