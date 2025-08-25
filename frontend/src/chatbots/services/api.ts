import api from "@/common/services/api";
import { ICreateChatbotSchema, IUpdateChatbotSchema } from "../models/schema";
import { IChatbot } from "../models/types";

export const chatbotsApi = {
  getAll: async () => {
    const response = await api.get<IChatbot[]>("/chatbots");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<IChatbot>(`/chatbots/${id}`);
    return response.data;
  },

  create: async (data: ICreateChatbotSchema) => {
    console.log("API create called with data:", data);
    const formData = new FormData();
    
    // Append all fields to FormData
    formData.append('name', data.name);
    formData.append('color', data.color);
    formData.append('welcomeMessage', data.welcomeMessage);
    
    if (data.placeholder) formData.append('placeholder', data.placeholder);
    if (data.tone) formData.append('tone', data.tone);
    if (data.shouldFollowUp !== undefined) formData.append('shouldFollowUp', data.shouldFollowUp.toString());
    if (data.triggers) formData.append('triggers', JSON.stringify(data.triggers));
    if (data.allowedDomains) {
      console.log("Adding allowedDomains to FormData:", data.allowedDomains);
      formData.append('allowedDomains', JSON.stringify(data.allowedDomains));
    }
    if (data.icon) formData.append('icon', data.icon);
    
    // Append selected document IDs
    if (data.selectedDocuments && data.selectedDocuments.length > 0) {
      formData.append('selectedDocuments', JSON.stringify(data.selectedDocuments));
    }
    
    // Append uploaded files
    if (data.uploadedFiles && data.uploadedFiles.length > 0) {
      data.uploadedFiles.forEach((file, index) => {
        formData.append('files', file);
      });
    }

    const response = await api.post<IChatbot>("/chatbots", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async ({ id, data }: { id: string; data: IUpdateChatbotSchema }) => {
    console.log("API update called with data:", data);
    const formData = new FormData();
    
    // Append all fields to FormData
    formData.append('name', data.name);
    formData.append('color', data.color);
    formData.append('welcomeMessage', data.welcomeMessage);
    formData.append('placeholder', data.placeholder);
    formData.append('tone', data.tone);
    formData.append('shouldFollowUp', data.shouldFollowUp.toString());
    formData.append('isActive', data.isActive.toString());
    
    if (data.triggers) {
      formData.append('triggers', JSON.stringify(data.triggers));
    }
    
    if (data.allowedDomains) {
      console.log("Adding allowedDomains to FormData for update:", data.allowedDomains);
      formData.append('allowedDomains', JSON.stringify(data.allowedDomains));
    }
    
    if (data.icon) {
      formData.append('icon', data.icon);
    }

    const response = await api.patch<IChatbot>(`/chatbots/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/chatbots/${id}`);
    return response.data;
  },

  addDocuments: async (chatbotId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<IChatbot>(`/chatbots/${chatbotId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  linkDocuments: async (chatbotId: string, documentIds: string[]) => {
    const response = await api.post<IChatbot>(`/chatbots/${chatbotId}/documents/link`, {
      documentIds,
    });
    return response.data;
  },

  removeDocument: async (chatbotId: string, documentId: string) => {
    const response = await api.delete<IChatbot>(`/chatbots/${chatbotId}/documents/${documentId}`);
    return response.data;
  },
};
