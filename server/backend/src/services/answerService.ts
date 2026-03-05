import { prisma } from "../lib/prisma";

export interface CreateAnswerRequest {
  content: string;
}

export const saveAnswer = async (
  request: CreateAnswerRequest,
  userId: number,
  sushiId: number
) => {
  const { content } = request;

  if (!content || typeof content !== "string" || content.trim() === "") {
    throw new Error("답변 내용이 비어있을 수 없습니다.");
  }

  const sushi = await prisma.sushi.findUnique({
    where: { id: sushiId },
  });

  if (!sushi) {
    throw new Error("해당 스시를 찾을 수 없습니다.");
  }

  if (sushi.isClosed) {
    throw new Error("이미 마감된 스시입니다.");
  }

  if (sushi.expireTime < new Date()) {
    throw new Error("만료된 스시입니다.");
  }

  if (sushi.remainingAnswers <= 0) {
    throw new Error("더 이상 답변을 받을 수 없습니다.");
  }

  const existingAnswer = await prisma.answer.findUnique({
    where: { userId_sushiId: { userId, sushiId } },
  });

  if (existingAnswer) {
    throw new Error("이미 이 스시에 답변한 사용자입니다.");
  }

  const now = new Date();

  const answer = await prisma.answer.create({
    data: {
      userId,
      sushiId,
      content,
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.sushi.update({
    where: { id: sushiId },
    data: { remainingAnswers: sushi.remainingAnswers - 1 },
  });

  return answer;
};
