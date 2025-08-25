
import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  chatbotId: z.string().min(1, "Chatbot ID is required"),
  conversationId: z.string().optional(), // For existing conversations
});

export const createChatSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  chatbotId: z.string().min(1, "Chatbot ID is required"),
});

export type ISendMessageSchema = z.infer<typeof sendMessageSchema>;
export type ICreateChatSessionSchema = z.infer<typeof createChatSessionSchema>;
