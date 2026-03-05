import { prisma } from '../lib/prisma';

/**
 * 글로벌 채팅방의 최근 메시지를 가져옵니다.
 * @param limit 가져올 메시지 수 (기본값 50)
 */
export const getRecentMessages = async (limit = 50) => {
  const messages = await prisma.chatMessage.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, provider: true, nickname: true, deletedAt: true },
      },
      sushi: {
        select: { id: true, title: true, content: true },
      },
    },
  });
  return messages;
};

/**
 * 채팅 메시지를 DB에 저장합니다.
 */
export const saveMessage = async (userId: number, content: string, type = 'TEXT', sushiId?: number) => {
  const message = await prisma.chatMessage.create({
    data: { userId, content, type, sushiId },
    include: {
      user: {
        select: { id: true, provider: true, nickname: true, deletedAt: true },
      },
      sushi: {
        select: { id: true, title: true, content: true },
      },
    },
  });
  return message;
};

/**
 * 채팅 메시지를 수정합니다.
 */
export const editMessage = async (messageId: number, userId: number, content: string) => {
  // 본인 메시지인지 확인 추가 가능
  const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!message || message.userId !== userId || message.deletedAt) {
    throw new Error('메시지를 수정할 권한이 없거나 삭제된 메시지입니다.');
  }

  return prisma.chatMessage.update({
    where: { id: messageId },
    data: { content },
    include: {
      user: {
        select: { id: true, provider: true, nickname: true },
      },
    },
  });
};

/**
 * 채팅 메시지를 삭제(소프트 딜리트)합니다.
 */
export const deleteMessage = async (messageId: number, userId: number) => {
  const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!message || message.userId !== userId) {
    throw new Error('메시지를 삭제할 권한이 없습니다.');
  }

  return prisma.chatMessage.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
    include: {
      user: {
        select: { id: true, provider: true, nickname: true },
      },
    },
  });
};
