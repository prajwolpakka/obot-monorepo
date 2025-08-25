import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationType, NotificationPriority } from './notification.entity';

@Injectable()
export class NotificationHelper {
  constructor(
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
  ) {}

  async sendWelcomeNotification(userId: string) {
    const notification = await this.notificationService.create({
      userId,
      title: 'Welcome to Obot!',
      message: 'Thank you for joining us. Get started by exploring your dashboard.',
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.MEDIUM,
      actionUrl: '/dashboard',
      actionLabel: 'Go to Dashboard',
    });

    this.notificationGateway.sendNotificationToUser(userId, notification);
    this.notificationGateway.sendUnreadCountUpdate(
      userId,
      await this.notificationService.getUnreadCount(userId)
    );

    return notification;
  }

  async sendChatbotCreatedNotification(userId: string, chatbotName: string) {
    const notification = await this.notificationService.create({
      userId,
      title: 'Chatbot Created Successfully',
      message: `Your chatbot "${chatbotName}" has been created and is ready to use.`,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.MEDIUM,
      actionUrl: '/chatbots',
      actionLabel: 'View Chatbots',
    });

    this.notificationGateway.sendNotificationToUser(userId, notification);
    this.notificationGateway.sendUnreadCountUpdate(
      userId,
      await this.notificationService.getUnreadCount(userId)
    );

    return notification;
  }

  async sendDocumentUploadNotification(userId: string, documentName: string, success: boolean) {
    const notification = await this.notificationService.create({
      userId,
      title: success ? 'Document Uploaded' : 'Document Upload Failed',
      message: success 
        ? `Document "${documentName}" has been uploaded successfully.`
        : `Failed to upload document "${documentName}". Please try again.`,
      type: success ? NotificationType.SUCCESS : NotificationType.ERROR,
      priority: success ? NotificationPriority.LOW : NotificationPriority.HIGH,
      actionUrl: '/documents',
      actionLabel: 'View Documents',
    });

    this.notificationGateway.sendNotificationToUser(userId, notification);
    this.notificationGateway.sendUnreadCountUpdate(
      userId,
      await this.notificationService.getUnreadCount(userId)
    );

    return notification;
  }

  async sendSystemMaintenanceNotification(userId: string) {
    const notification = await this.notificationService.create({
      userId,
      title: 'Scheduled Maintenance',
      message: 'System maintenance is scheduled for tonight at 2 AM UTC. Expected downtime: 1 hour.',
      type: NotificationType.WARNING,
      priority: NotificationPriority.HIGH,
    });

    this.notificationGateway.sendNotificationToUser(userId, notification);
    this.notificationGateway.sendUnreadCountUpdate(
      userId,
      await this.notificationService.getUnreadCount(userId)
    );

    return notification;
  }

  async sendSubscriptionExpiryNotification(userId: string, daysLeft: number) {
    const notification = await this.notificationService.create({
      userId,
      title: 'Subscription Expiring Soon',
      message: `Your subscription expires in ${daysLeft} days. Renew now to continue using all features.`,
      type: NotificationType.WARNING,
      priority: daysLeft <= 3 ? NotificationPriority.URGENT : NotificationPriority.HIGH,
      actionUrl: '/subscription',
      actionLabel: 'Manage Subscription',
    });

    this.notificationGateway.sendNotificationToUser(userId, notification);
    this.notificationGateway.sendUnreadCountUpdate(
      userId,
      await this.notificationService.getUnreadCount(userId)
    );

    return notification;
  }
}
