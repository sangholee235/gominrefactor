import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSushiByUserId, getSushiDetail, searchMySushiByTitle } from '../src/services/mySushiService';

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  sushi: {
    count: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
}));

vi.mock('../src/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('mySushiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSushiByUserId', () => {
    it('should return paginated sushi list', async () => {
      const userId = 1;
      const page = 1;
      const pageSize = 10;
      const mockTotal = 20;
      const mockSushiList = [{ id: 1, title: 'Sushi 1' }, { id: 2, title: 'Sushi 2' }];

      prismaMock.$transaction.mockResolvedValue([mockTotal, mockSushiList]);

      const result = await getSushiByUserId(userId, page, pageSize);

      expect(prismaMock.sushi.count).toHaveBeenCalledWith({ where: { userId } });
      expect(prismaMock.sushi.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        totalCount: mockTotal,
        sushi: mockSushiList,
        totalPages: 2,
        currentPage: 1,
      });
    });
  });

  describe('getSushiDetail', () => {
    it('should return sushi with answers if found', async () => {
      const userId = 1;
      const sushiId = 100;
      const mockSushi = {
        id: sushiId,
        userId,
        title: 'My Sushi',
        answer: [{ id: 1, content: 'Answer 1' }],
      };

      prismaMock.sushi.findFirst.mockResolvedValue(mockSushi);

      const result = await getSushiDetail(userId, sushiId);

      expect(prismaMock.sushi.findFirst).toHaveBeenCalledWith({
        where: { id: sushiId, userId },
        include: { answer: true },
      });
      expect(result).toEqual({
        ...mockSushi,
        answers: mockSushi.answer,
      });
    });

    it('should return null if sushi not found', async () => {
      prismaMock.sushi.findFirst.mockResolvedValue(null);

      const result = await getSushiDetail(1, 999);

      expect(result).toBeNull();
    });
  });

  describe('searchMySushiByTitle', () => {
    it('should return filtered sushi list', async () => {
      const userId = 1;
      const query = 'test';
      const mockTotal = 5;
      const mockSushiList = [{ id: 1, title: 'test sushi' }];

      prismaMock.$transaction.mockResolvedValue([mockTotal, mockSushiList]);

      const result = await searchMySushiByTitle(userId, query, 1, 10);

      const expectedWhere = {
        userId,
        title: { contains: query },
      };

      expect(prismaMock.sushi.count).toHaveBeenCalledWith({ where: expectedWhere });
      expect(prismaMock.sushi.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        totalCount: mockTotal,
        sushi: mockSushiList,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });
});
