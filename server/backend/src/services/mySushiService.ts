import { prisma } from '../lib/prisma';

/**
 * 사용자가 작성한 스시 목록을 페이지네이션하여 조회합니다.
 * @param userId 사용자 ID
 * @param page 페이지 번호
 * @param pageSize 페이지 당 항목 수
 */
export const getSushiByUserId = async (userId: number, page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [totalCount, sushi] = await prisma.$transaction([
    prisma.sushi.count({ where: { userId } }),
    prisma.sushi.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ]);

  return {
    totalCount,
    sushi,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
};

/**
 * 사용자가 작성한 스시를 삭제합니다.
 * @param userId 사용자 ID
 * @param sushiId 스시 ID
 */
export const deleteSushi = async (userId: number, sushiId: number) => {
  try {
    // 먼저 사용자가 소유한 스시인지 확인
    const sushi = await prisma.sushi.findFirst({
      where: {
        id: sushiId,
        userId: userId,
      },
    });

    if (!sushi) {
      throw new Error('해당 스시를 찾을 수 없거나 삭제 권한이 없습니다.');
    }

    console.log(`Deleting sushi ${sushiId} for user ${userId}`);

    // 트랜잭션으로 관련 데이터 모두 삭제
    return await prisma.$transaction(async (tx) => {
      // 노출 기록 삭제 (먼저 삭제)
      await tx.sushiExposure.deleteMany({
        where: { sushiId }
      });

      // 답변 삭제
      await tx.answer.deleteMany({
        where: { sushiId }
      });

      // 스시 삭제
      return await tx.sushi.delete({
        where: { id: sushiId }
      });
    });
  } catch (error) {
    console.error('Sushi deletion error:', error);
    throw new Error('스시 삭제 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

/**
 * 사용자가 작성한 특정 스시의 상세 정보를 조회합니다.
 * @param userId 사용자 ID
 * @param sushiId 스시 ID
 */
export const getSushiDetail = async (userId: number, sushiId: number) => {
  const sushi = await prisma.sushi.findFirst({
    where: {
      id: sushiId,
      userId: userId,
    },
    include: {
      answer: true,
    },
  });

  if (!sushi) {
    return null;
  }

  return {
    ...sushi,
    answers: sushi.answer,
  };
};

/**
 * 사용자가 작성한 스시 목록을 제목으로 검색하고 페이지네이션하여 조회합니다.
 * @param userId 사용자 ID
 * @param query 검색어
 * @param page 페이지 번호
 * @param pageSize 페이지 당 항목 수
 */
export const searchMySushiByTitle = async (userId: number, query: string, page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  const where = {
    userId,
    title: {
      contains: query,
    },
  };

  const [totalCount, sushi] = await prisma.$transaction([
    prisma.sushi.count({ where }),
    prisma.sushi.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ]);

  return {
    totalCount,
    sushi,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
};

export const updateSushi = async (
  userId: number, 
  sushiId: number, 
  updateData: { title?: string; content?: string }
) => {
  // 1. 해당 고민이 존재하는지 + 내 것인지 확인
  const sushi = await prisma.sushi.findUnique({
    where: { id: sushiId },
  });

  if (!sushi) {
    throw new Error('수정할 고민을 찾을 수 없습니다.');
  }

  if (sushi.userId !== userId) {
    throw new Error('본인의 고민만 수정할 수 있는 권한이 있습니다.');
  }

  // 2. 업데이트 실행 (입력된 데이터만 반영)
  return await prisma.sushi.update({
    where: { id: sushiId },
    data: {
      ...(updateData.title && { title: updateData.title }),
      ...(updateData.content && { content: updateData.content }),
    },
  });
};
