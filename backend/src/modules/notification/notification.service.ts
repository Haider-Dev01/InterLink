import { io } from '../../server';
import { notificationRepository } from './notification.repository';

export class NotificationService {
  async notify(userId: string, type: string, title: string, payload: any) {
    // 1. Persister en DB TOUJOURS (même si offline)
    const notification = await notificationRepository.createNotification(
      userId, type, title, payload
    );

    // 2. Push WebSocket si user connecté
    io.to(`user:${userId}`).emit('notification', {
      id: notification.id,
      type,
      title,
      payload,
      isRead: false,
      createdAt: notification.createdAt
    });

    return notification;
  }

  async getNotifications(userId: string) {
    return notificationRepository.getNotifications(userId);
  }

  async markAsRead(notificationId: string, userId: string) {
    return notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string) {
    return notificationRepository.getUnreadCount(userId);
  }
}

export const notificationService = new NotificationService();
