import api from "@/common/services/api";
import { IUploadDocumentSchema } from "../models/schema";
import { IDocument } from "../models/types";

export const documentsApi = {
  getAll: async () => {
    const response = await api.get<IDocument[]>("/documents");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<IDocument>(`/documents/${id}`);
    return response.data;
  },

  upload: ({
    file,
    data,
    onUploadProgress,
  }: {
    file: File;
    data: IUploadDocumentSchema;
    onUploadProgress?: (progressEvent: any) => void;
  }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", data.name);

    return api.post<IDocument>("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  },

  uploadMultiple: (files: File[], onProgress?: (file: File, progress: number) => void) => {
    const promises = files.map((file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);

      return api.post<IDocument>("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(file, progress);
          }
        },
      });
    });

    return Promise.all(promises);
  },

  delete: async (id: string) => {
    await api.delete(`/documents/${id}`);
  },

  getFileUrl: (id: string) => {
    return `${api.defaults.baseURL}/documents/${id}/file`;
  },

  downloadFile: (id: string) => {
    return `${api.defaults.baseURL}/documents/${id}/download`;
  },

  getEmbeddingStatus: async (id: string) => {
    const response = await api.get(`/documents/${id}/embedding-status`);
    return response.data;
  },
};
