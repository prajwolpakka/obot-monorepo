import { IMessageData } from "../models/types";

export const getChartData = (messagesPerDay?: IMessageData[], timeRange: string = "7days") => {
  const now = new Date();
  let daysCount: number;
  let cutoffDate: Date;

  switch (timeRange) {
    case "7days":
      daysCount = 7;
      cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      break;
    case "30days":
      daysCount = 30;
      cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      break;
    case "90days":
      daysCount = 90;
      cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      break;
    case "365days":
      daysCount = 365;
      cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - 365);
      break;
    default:
      daysCount = 7;
      cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - 7);
  }

  // Create a complete range of dates
  const dateRange = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dateRange.push(date.toISOString().split("T")[0]);
  }

  // If no data, return zeros for all dates
  if (!messagesPerDay || messagesPerDay.length === 0) {
    return dateRange.map(date => ({
      date,
      messages: 0,
    }));
  }

  // Filter existing data and create a map for quick lookup
  const filteredData = messagesPerDay.filter((item) => new Date(item.date) >= cutoffDate);
  const dataMap = new Map(filteredData.map(item => [item.date, item.messages]));

  // Fill in the complete date range with actual data or zeros
  return dateRange.map(date => ({
    date,
    messages: dataMap.get(date) || 0,
  }));
};
