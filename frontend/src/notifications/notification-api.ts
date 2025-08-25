import api from "../common/services/api";
import { Notification, NotificationQuery } from "./types";

export const notificationApi = {
  // Get all notifications for current user
  getNotifications: async (query?: NotificationQuery): Promise<Notification[]> => {
    const response = await api.get("/notifications", { params: query });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  // Get single notification
  getNotification: async (id: string): Promise<Notification> => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/mark-all-read");
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  // Delete all notifications
  deleteAllNotifications: async (): Promise<void> => {
    await api.delete("/notifications");
  },
};
