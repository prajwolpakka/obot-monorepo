import { IChatbot } from "@/chatbots/models/types";
import { IBaseEntity } from "@/common/models/types";

export interface IMessage extends IBaseEntity {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  createdAt: string;
  chatId: string;
}

export interface IChat extends IBaseEntity {
  id: string;
  sessionId: string;
  startedAt: string;
  chatbot: Pick<IChatbot, "id" | "name" | "iconUrl" | "color">;
  chatbotId: string;
  messages: IMessage[];
}
