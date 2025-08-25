export interface IMetrics {
  totalChatbots: number;
  totalChats: number;
  totalMessages: number;
  totalDocuments: number;
}

export interface IChatbot {
  id: string;
  name: string;
  color: string;
  iconUrl?: string;
}

export interface ITimeRangeStats {
  byMessages: IChatbotStats[];
  byConversations: IChatbotStats[];
}

export interface IChatbotStats extends IChatbot {
  messageCount: number;
  chatCount: number;
}

export interface IMessageData {
  date: string;
  messages: number;
}
