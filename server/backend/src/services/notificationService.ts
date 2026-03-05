import { prisma } from '../lib/prisma';

export const getUnreadNotifications = async (userId: number) => {
  return prisma.notification.findMany({
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
};

export const markNotificationAsRead = async (notificationId: number, userId: number) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new Error('알림을 찾을 수 없거나 접근 권한이 없습니다.');
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};
