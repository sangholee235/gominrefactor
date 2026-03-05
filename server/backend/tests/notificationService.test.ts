import { describe, expect, it, vi } from 'vitest';
import { getUnreadNotifications, markNotificationAsRead } from '../src/services/notificationService';
import { prisma } from '../src/lib/prisma';

// Mock Prisma Client
vi.mock('../src/lib/prisma', () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('NotificationService', () => {
  describe('getUnreadNotifications', () => {
    it('returns unread notifications for a user', async () => {
      const userId = 1;
      const mockNotifications = [
        {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId,
          sushiId: 1,
          notificationType: 'ANSWER',
          message: '새로운 답변이 도착했습니다.',
          isRead: false,
          redirectUrl: '/sushi/1',
          sushi: { title: '연어 스시' },
        },
      ];
      
      (prisma.notification.findMany as vi.Mock).mockResolvedValue(mockNotifications);

      const result = await getUnreadNotifications(userId);

      expect(result).toEqual(mockNotifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          isRead: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          sushi: {
            select: {
              title: true,
            },
          },
        },
      });
    });

    it('returns empty array when no unread notifications', async () => {
      const userId = 1;
      (prisma.notification.findMany as vi.Mock).mockResolvedValue([]);

      const result = await getUnreadNotifications(userId);

      expect(result).toEqual([]);
      expect(prisma.notification.findMany).toHaveBeenCalled();
    });
  });

  describe('markNotificationAsRead', () => {
    it('marks notification as read when exists and belongs to user', async () => {
      const notificationId = 1;
      const userId = 1;
      const mockNotification = {
        id: notificationId,
        userId,
        isRead: false,
      };
      const updatedNotification = {
        id: notificationId,
        userId,
        isRead: true,
      };
      
      (prisma.notification.findUnique as vi.Mock).mockResolvedValue(mockNotification);
      (prisma.notification.update as vi.Mock).mockResolvedValue(updatedNotification);

      const result = await markNotificationAsRead(notificationId, userId);

      expect(result).toEqual(updatedNotification);
      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: notificationId },
      });
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { isRead: true },
      });
    });

    it('throws error when notification not found', async () => {
      const notificationId = 999;
      const userId = 1;
      
      (prisma.notification.findUnique as vi.Mock).mockResolvedValue(null);

      await expect(markNotificationAsRead(notificationId, userId)).rejects.toThrow(
        '알림을 찾을 수 없거나 접근 권한이 없습니다.'
      );
    });

    it('throws error when notification belongs to another user', async () => {
      const notificationId = 1;
      const userId = 1;
      const otherUserId = 2;
      const mockNotification = {
        id: notificationId,
        userId: otherUserId,
        isRead: false,
      };
      
      (prisma.notification.findUnique as vi.Mock).mockResolvedValue(mockNotification);

      await expect(markNotificationAsRead(notificationId, userId)).rejects.toThrow(
        '알림을 찾을 수 없거나 접근 권한이 없습니다.'
      );
    });
  });
});
