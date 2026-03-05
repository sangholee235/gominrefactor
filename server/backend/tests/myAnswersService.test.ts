import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getMyAnswers } from '../src/services/myAnswersService';

const prismaMock = vi.hoisted(() => ({
  answer: {
    findMany: vi.fn(),
  },
}));

vi.mock('../src/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('myAnswersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyAnswers', () => {
    it('should return mapped answers', async () => {
      const userId = 1;
      const mockAnswers = [
        {
          id: 10,
          content: 'Answer Content',
          createdAt: new Date(),
          sushiId: 100,
          sushi: {
            title: 'Sushi Title',
            categoryId: 1,
            sushiTypeId: 2,
          },
        },
      ];

      prismaMock.answer.findMany.mockResolvedValue(mockAnswers);

      const result = await getMyAnswers(userId);

      expect(prismaMock.answer.findMany).toHaveBeenCalledWith({
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
      });
      expect(result).toEqual(mockAnswers);
    });

    it('should return empty array if no answers found', async () => {
      prismaMock.answer.findMany.mockResolvedValue([]);
      const result = await getMyAnswers(1);
      expect(result).toEqual([]);
    });
  });
});
