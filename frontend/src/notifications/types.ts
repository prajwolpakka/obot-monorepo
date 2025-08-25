export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'document-embedding-started' | 'document-processed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  userId: string;
  createdAt: string;
  updatedAt: string;
  timestamp?: number;
  // Document-specific properties
  documentId?: string;
  success?: boolean;
}

export interface NotificationQuery {
  type?: 'info' | 'success' | 'warning' | 'error' | 'document-embedding-started' | 'document-processed';
  isRead?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'document-embedding-started' | 'document-processed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  userId: string;
}
