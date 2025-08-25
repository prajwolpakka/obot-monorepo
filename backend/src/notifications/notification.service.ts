import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from './notification.entity';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from './notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async findAllByUser(userId: string, query: NotificationQueryDto): Promise<Notification[]> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (query.type) {
      queryBuilder.andWhere('notification.type = :type', { type: query.type });
    }

    if (query.isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: query.isRead });
    }

    if (query.priority) {
      queryBuilder.andWhere('notification.priority = :priority', { priority: query.priority });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Notification | null> {
    return this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification | null> {
    await this.notificationRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async delete(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async deleteAllByUser(userId: string): Promise<void> {
    await this.notificationRepository.delete({ userId });
  }

  // Helper methods for common notification types
  async createSystemNotification(userId: string, title: string, message: string): Promise<Notification> {
    return this.create({
      userId,
      title,
      message,
      type: NotificationType.INFO,
      priority: NotificationPriority.LOW,
    });
  }

  async createSuccessNotification(userId: string, title: string, message: string): Promise<Notification> {
    return this.create({
      userId,
      title,
      message,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.MEDIUM,
    });
  }

  async createWarningNotification(userId: string, title: string, message: string): Promise<Notification> {
    return this.create({
      userId,
      title,
      message,
      type: NotificationType.WARNING,
      priority: NotificationPriority.HIGH,
    });
  }

  async createErrorNotification(userId: string, title: string, message: string): Promise<Notification> {
    return this.create({
      userId,
      title,
      message,
      type: NotificationType.ERROR,
      priority: NotificationPriority.URGENT,
    });
  }
}
