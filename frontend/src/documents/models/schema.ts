
import { z } from "zod";

export const uploadDocumentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  type: z.enum(['pdf', 'txt', 'docx', 'csv']),
  size: z.number().positive("File size must be positive"),
  folderId: z.string().optional(),
  file: z.any(), // File object for upload
  chatbotId: z.string().optional(), // For chatbot-specific uploads
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1, "Document name is required").optional(),
  folderId: z.string().optional(),
});

export const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  parentId: z.string().optional(),
});

export type IUploadDocumentSchema = z.infer<typeof uploadDocumentSchema>;
export type IUpdateDocumentSchema = z.infer<typeof updateDocumentSchema>;
export type ICreateFolderSchema = z.infer<typeof createFolderSchema>;
