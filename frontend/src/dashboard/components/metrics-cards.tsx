import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Bot, FileText, MessageCircle, MessageSquare } from "lucide-react";
import { IMetrics } from "../models/types";

interface MetricsCardsProps {
  metrics: IMetrics;
}

const MetricsCards = ({ metrics }: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Chatbots</CardTitle>
          <Bot className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalChatbots}</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Conversations</CardTitle>
          <MessageCircle className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalChats}</div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
          <MessageSquare className="h-5 w-5 text-purple-500" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.totalMessages.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Documents</CardTitle>
          <FileText className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalDocuments}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCards;
