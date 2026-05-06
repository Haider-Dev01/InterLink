import { prisma } from '../../shared/config/prismaClient';

export class NotificationRepository {
  async createNotification(userId: string, type: string, title: string, payload: any) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        payload,
        isRead: false
      }
    });
  }

  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { isRead: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true }
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  }
}

export const notificationRepository = new NotificationRepository();
