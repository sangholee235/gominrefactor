import { prisma } from "../lib/prisma";
import { randomUUID } from "crypto";

export const createShareToken = async (sushiId: number) => {
  // UUID를 사용하여 고유한 토큰 생성
  const token = randomUUID();

  const shareToken = await prisma.shareToken.create({
    data: {
      sushiId,
      token,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return shareToken;
};

export const getSushiIdByToken = async (token: string) => {
  const shareToken = await prisma.shareToken.findFirst({
    where: { token },
    include: {
      sushi: {
        include: {
          sushiType: true,
          category: true
        }
      }
    }
  });

  if (!shareToken) {
    return null;
  }

  return shareToken.sushi;
};
