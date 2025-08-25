import { z } from "zod";

export const createChatbotSchema = z.object({
  name: z.string().min(1, "* Required"),
  color: z.string().min(1, "* Required"),
  welcomeMessage: z.string().min(1, "* Required"),
  placeholder: z.string().optional(),
  tone: z.enum(["professional", "friendly", "casual"]).optional(),
  shouldFollowUp: z.boolean().optional().default(false),
  triggers: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .default([]),
  allowedDomains: z
    .array(
      z.object({
        id: z.string(),
        value: z.string().min(1, "* Required"),
      })
    )
    .optional()
    .default([]),
  icon: z.instanceof(File).optional(),
  selectedDocuments: z.array(z.string()).optional().default([]),
  uploadedFiles: z.array(z.instanceof(File)).optional().default([]),
});

export const updateChatbotSchema = z.object({
  name: z.string().min(1, "* Required"),
  color: z.string().min(1, "* Required"),
  welcomeMessage: z.string().min(1, "* Required"),
  placeholder: z.string(),
  tone: z.string(),
  shouldFollowUp: z.boolean(),
  isActive: z.boolean(),
  triggers: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .default([]),
  allowedDomains: z
    .array(
      z.object({
        id: z.string(),
        value: z.string().min(1, "* Required"),
      })
    )
    .optional()
    .default([]),
  icon: z.instanceof(File).optional(),
});

export type ICreateChatbotSchema = z.infer<typeof createChatbotSchema>;
export type IUpdateChatbotSchema = z.infer<typeof updateChatbotSchema>;
