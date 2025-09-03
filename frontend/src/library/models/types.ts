export interface IDocument {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: 'pending' | 'embedding' | 'processed' | 'failed';
  isProcessed: boolean;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFolder {
  id: string;
  name: string;
  parentId?: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IDocumentStats {
  totalDocuments: number;
  processedDocuments: number;
  pendingDocuments: number;
  totalSize: number;
  recentUploads?: number;
}

export interface IDocumentsData {
  documents: IDocument[];
  folders: IFolder[];
  stats: IDocumentStats;
}
