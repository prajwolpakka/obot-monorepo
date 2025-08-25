import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { BarChart3 } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getChartData } from "../utils/chart-utils";
import { IMessageData } from "../models/types";

interface MessagesTrendsChartProps {
  messagesPerDay?: IMessageData[];
  timeRange: string;
  setTimeRange: (value: string) => void;
}

const MessagesTrendsChart = ({ messagesPerDay, timeRange, setTimeRange }: MessagesTrendsChartProps) => {
  const chartData = getChartData(messagesPerDay, timeRange);

  const getXAxisInterval = () => {
    const dataRange = chartData.length;
    if (timeRange === "7days" || dataRange <= 7) {
      return 0;
    } else if (timeRange === "30days" || dataRange <= 30) {
      return 4;
    } else if (timeRange === "90days" || dataRange <= 90) {
      return 14;
    } else {
      return 60;
    }
  };

  const formatXAxisTick = (value: string) => {
    const date = new Date(value);

    if (timeRange === "7days") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else if (timeRange === "30days") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (timeRange === "90days") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <BarChart3 className="h-5 w-5" />
            Messages Over Time
          </CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
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
      </CardHeader>
      <CardContent className="pt-0">
        <div style={{ width: "100%", height: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" interval={getXAxisInterval()} tickFormatter={formatXAxisTick} />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, "Messages"]}
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#3B82F6", strokeWidth: 2, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesTrendsChart;
