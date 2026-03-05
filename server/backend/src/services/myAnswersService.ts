import { prisma } from '../lib/prisma';

/**
 * 사용자가 작성한 답변 목록의 반환 타입 정의
 */
export interface MyAnswerResponse {
  id: number;
  content: string;
  createdAt: Date;
  sushiId: number;
  sushi: {
    title: string;
    categoryId: number | null;
    sushiTypeId: number | null;
  };
}

/**
 * 사용자가 작성한 답변 목록을 조회합니다.
 * @param userId 사용자 ID
 */
export const getMyAnswers = async (userId: number): Promise<MyAnswerResponse[]> => {
  return prisma.answer.findMany({
    where: { userId },
    select: { 
      id: true,
      content: true,
      createdAt: true,
      sushiId: true,
      sushi: { 
        select: {
          title: true,
          categoryId: true,
          sushiTypeId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  }) as Promise<MyAnswerResponse[]>;
};

/**
 * 사용자가 작성한 답변을 수정합니다.
 * @param userId 사용자 ID (권한 확인용)
 * @param answerId 수정할 답변 ID
 * @param content 새로운 답변 내용
 */
export const updateMyAnswer = async (userId: number, answerId: number, content: string) => {
  // 1. 해당 답변이 존재하는지 + 내 것인지 확인
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
  });

  if (!answer) {
    throw new Error('수정할 답변을 찾을 수 없습니다.');
  }

  if (answer.userId !== userId) {
    throw new Error('본인이 작성한 답변만 수정할 수 있는 권한이 있습니다.');
  }

  // 2. 내용이 비어있는지 체크 (선택 사항)
  if (!content || content.trim() === '') {
    throw new Error('답변 내용을 입력해주세요.');
  }

  // 3. 수정 실행
  return await prisma.answer.update({
    where: { id: answerId },
    data: {
      content: content,
      // 수정 시간을 기록하고 싶다면 updatedAt: new Date() 등을 추가 (Prisma 모델에 필드가 있는 경우)
    },
    // 수정 후 결과와 함께 스시 정보도 함께 반환받고 싶다면 select 추가
    select: {
      id: true,
      content: true,
      createdAt: true,
      sushiId: true,
      sushi: {
        select: {
          title: true,
          categoryId: true,
          sushiTypeId: true,
        },
      },
    },
  });
};

export const deleteMyAnswer = async (userId: number, answerId: number) => {
  // 1. 해당 답변이 존재하는지 + 내 것인지 먼저 확인
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
  });

  if (!answer) {
    throw new Error('삭제할 답변을 찾을 수 없습니다.');
  }

  if (answer.userId !== userId) {
    throw new Error('본인이 작성한 답변만 삭제할 수 있는 권한이 있습니다.');
  }

  // 2. 삭제 실행
  // 만약 답변 삭제 시 Sushi의 remainingAnswers를 다시 늘려줘야 한다면 트랜잭션 사용
  return await prisma.$transaction(async (tx) => {
    const deleted = await tx.answer.delete({
      where: { id: answerId },
    });

    // 선택 사항: 답변이 삭제되었으므로 스시의 남은 답변 수(remainingAnswers)를 1 증가시킴
    await tx.sushi.update({
      where: { id: deleted.sushiId },
      data: { remainingAnswers: { increment: 1 } }
    });

    return deleted;
  });
};

/**
 * 사용자가 작성한 답변 목록을 검색하고 페이지네이션하여 조회합니다.
 * @param userId 사용자 ID
 * @param query 검색어
 * @param page 페이지 번호
 * @param pageSize 페이지 당 항목 수
 */
export const searchMyAnswers = async (userId: number, query: string, page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  const where = {
    userId,
    content: {
      contains: query,
    },
  };

  const [totalCount, answers] = await prisma.$transaction([
    prisma.answer.count({ where }),
    prisma.answer.findMany({
      where,
      select: { 
        id: true,
        content: true,
        createdAt: true,
        sushiId: true,
        sushi: { 
          select: {
            title: true,
            categoryId: true,
            sushiTypeId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ]);

  return {
    totalCount,
    answers,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
};