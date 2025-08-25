import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Bot, MessageCircle, MessageSquare } from "lucide-react";
import { ITimeRangeStats } from "../models/types";
import PerformanceEmptyState from "./performance-empty-state";
import PerformanceSkeleton from "./performance-skeleton";

interface ChatbotPerformanceProps {
  selectedChatbots: ITimeRangeStats;
  performanceTimeRange: string;
  isPerformanceLoading: boolean;
  onTimeRangeChange: (value: string) => void;
}

const ChatbotPerformance = ({
  selectedChatbots,
  performanceTimeRange,
  isPerformanceLoading,
  onTimeRangeChange,
}: ChatbotPerformanceProps) => {
  const getTimeRangeDescription = () => {
    switch (performanceTimeRange) {
      case "7days":
        return "in last 7 days";
      case "30days":
        return "in last 30 days";
      case "90days":
        return "in last 90 days";
      case "365days":
        return "in last 365 days";
      default:
        return "in last 7 days";
    }
  };

  const hasData = selectedChatbots.byMessages.length > 0 || selectedChatbots.byConversations.length > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Bot className="h-5 w-5" />
            Chatbot Performance
          </CardTitle>
          <Select value={performanceTimeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="365days">Last 365 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-gray-500 mt-1">Performance metrics {getTimeRangeDescription()}</p>
      </CardHeader>
      <CardContent className="pt-0">
        {isPerformanceLoading ? (
          <PerformanceSkeleton />
        ) : hasData ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Message Performance */}
            <div className="h-full">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Per Message
              </h4>
              <div className="space-y-3 overflow-y-auto max-h-80 md:h-80">
                {selectedChatbots.byMessages.map((chatbot, index) => (
                  <div
                    key={`msg-${chatbot.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 text-xs font-medium text-blue-600 dark:text-blue-400 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{chatbot.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{chatbot.messageCount}</p>
                      <p className="text-xs text-gray-500">messages</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation Performance */}
            <div className="h-full">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Per Conversation
              </h4>
              <div className="space-y-3 overflow-y-auto max-h-80 md:h-80">
                {selectedChatbots.byConversations.map((chatbot, index) => (
                  <div
                    key={`chat-${chatbot.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-800 text-xs font-medium text-green-600 dark:text-green-400 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{chatbot.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">{chatbot.chatCount}</p>
                      <p className="text-xs text-gray-500">conversations</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <PerformanceEmptyState />
        )}
      </CardContent>
    </Card>
  );
};

export default ChatbotPerformance;
