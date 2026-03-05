import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getExposedSushiIds } from "./sushiExposureService";

// 레일에 올릴 수 있는 활성 스시만 필터링한다.
const baseWhere = () => ({
  isClosed: false,
  expireTime: { gt: new Date() },
  remainingAnswers: { gt: 0 },
});

// Fisher–Yates로 랜덤 순서를 만든다.
const shuffle = <T>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const getRandomSushiRail = async (size: number, userId?: number) => {
  const limit = Math.max(0, Math.floor(size));
  if (limit === 0) return [];

  // 사용자가 이미 노출된 적 있는 초밥 ID 목록 조회
  let exposedSushiIds: number[] = [];
  if (userId) {
    exposedSushiIds = await getExposedSushiIds(userId);
  }

  try {
    // 1) MySQL: DB 레벨에서 랜덤 샘플링 시도 (ORDER BY RAND()).
    const rows: Array<{
      id: number;
      category_id: number | null;
      sushi_type_id: number | null;
      remaining_answers: number;
      expire_time: Date;
    }> = await prisma.$queryRaw`
      SELECT id, category_id, sushi_type_id, remaining_answers, expire_time
      FROM sushi
      WHERE is_closed = false
        AND expire_time > DATE_ADD(NOW(), INTERVAL 10 MINUTE)
        AND remaining_answers > 0
        ${userId ? Prisma.sql`AND user_id != ${userId}` : Prisma.sql``}
        ${userId ? Prisma.sql`AND id NOT IN (SELECT sushi_id FROM answer WHERE user_id = ${userId})` : Prisma.sql``}
        ${userId && exposedSushiIds.length > 0 ? Prisma.sql`AND id NOT IN (${Prisma.join(exposedSushiIds)})` : Prisma.sql``}
      ORDER BY RAND()
      LIMIT ${limit};
    `;

    if (!rows || rows.length === 0) return [];

    return rows.map((r) => ({
      sushiId: r.id,
      category: r.category_id ?? null,
      sushiType: r.sushi_type_id ?? null,
      remainingAnswers: r.remaining_answers ?? 0,
      expirationTime: new Date(r.expire_time).toISOString(),
    }));
  } catch (e) {
    // 폴백: 기존 방식 (가벼운 id 조회 -> JS 셔플 -> 상세 조회)
    const where: any = baseWhere();
    where.expireTime = { gt: new Date(Date.now() + 10 * 60 * 1000) };

    if (userId) {
      where.userId = { not: userId };
      where.answer = { none: { userId: userId } };
      // 노출된 초밥 제외
      if (exposedSushiIds.length > 0) {
        where.id = { notIn: exposedSushiIds };
      }
    }

    const ids = await prisma.sushi.findMany({
      where,
      select: { id: true },
    });

    if (ids.length === 0) {
      return [];
    }

    const pickedIds = shuffle(ids.map(({ id }) => id)).slice(0, limit);
    const items = await prisma.sushi.findMany({
      where: { id: { in: pickedIds } },
      select: {
        id: true,
        categoryId: true,
        sushiTypeId: true,
        remainingAnswers: true,
        expireTime: true,
      },
    });

    const byId = new Map(items.map((item) => [item.id, item]));

    return pickedIds
      .map((id) => byId.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        sushiId: item.id,
        category: item.categoryId,
        sushiType: item.sushiTypeId,
        remainingAnswers: item.remainingAnswers,
        expirationTime: item.expireTime.toISOString(),
      }));
  }
};

export type CreateSushiInput = {
  title: string;
  content: string;
  expireTime: Date;
  maxAnswers: number;
  categoryId: number | null;
  sushiTypeId: number | null;
};

export const createSushi = async (userId: number, data: CreateSushiInput) => {
  const { title, content, expireTime, maxAnswers, categoryId, sushiTypeId } =
    data;

  const now = new Date();

  return prisma.sushi.create({
    data: {
      userId,
      title,
      content,
      expireTime,
      maxAnswers,
      remainingAnswers: maxAnswers,
      isClosed: false,
      createdAt: now,
      updatedAt: now,
      ...(categoryId !== null ? { categoryId } : {}),
      ...(sushiTypeId !== null ? { sushiTypeId } : {}),
    },
  });
};

export async function getRailSushi(userId: number | null, sushiId: number) {
  const sushi = await prisma.sushi.findUnique({ where: { id: sushiId } });
  if (!sushi) return null;
  return sushi; // 사용자 관련 플래그는 향후 필요시 별도 조회 추가
}
