import { IDocument } from "@/library/models/types";

export interface IChatbot {
  id: string;
  name: string;
  color: string;
  welcomeMessage: string;
  placeholder: string;
  tone: string;
  shouldFollowUp: boolean;
  triggers: { id: string; value: string }[];
  allowedDomains: { id: string; value: string }[];
  iconUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  documents: IDocument[];
}
