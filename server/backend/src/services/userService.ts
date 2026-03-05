import { prisma } from "../lib/prisma";

export const getUserById = (id: number) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      provider: true,
      providerId: true,
      nickname: true,
      createdAt: true,
      updatedAt: true,
    },
  });

export const upsertKakaoUser = async (kakaoId: string) => {
  const now = new Date();

  const existing = await prisma.user.findFirst({
    where: { provider: "kakao", providerId: kakaoId },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { updatedAt: now, deletedAt: null },
    });
  }

  return prisma.user.create({
    data: {
      provider: "kakao",
      providerId: kakaoId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  });
};

export const upsertDevUser = async (devId: number) => {
  const now = new Date();

  const existing = await prisma.user.findUnique({
    where: { id: devId },
  });

  if (existing) return existing;

  return prisma.user.create({
    data: {
      id: devId,
      provider: "dev",
      providerId: `dev_${devId}`,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  });
};

export const withdrawUser = async (userId: number) => {
  return prisma.user.delete({
    where: { id: userId },
  });
};

export const updateUserNickname = async (userId: number, nickname: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { nickname, updatedAt: new Date() },
    select: {
      id: true,
      provider: true,
      nickname: true,
    },
  });
};
