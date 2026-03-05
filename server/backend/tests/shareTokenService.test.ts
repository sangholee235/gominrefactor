import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createShareToken, getSushiIdByToken } from '../src/services/shareTokenService';

const prismaMock = vi.hoisted(() => ({
  shareToken: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
}));

vi.mock('../src/lib/prisma', () => ({
  prisma: prismaMock,
}));

// UUID 생성을 Mocking하여 예측 가능한 토큰 값을 사용
vi.mock('crypto', () => ({
  randomUUID: () => 'mock-uuid-token',
}));

describe('shareTokenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createShareToken', () => {
    it('should create and return a share token', async () => {
      const sushiId = 100;
      const mockToken = 'mock-uuid-token';
      const mockResult = {
        id: 1,
        sushiId,
        token: mockToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.shareToken.create.mockResolvedValue(mockResult);

      const result = await createShareToken(sushiId);

      expect(prismaMock.shareToken.create).toHaveBeenCalledWith({
        data: {
          sushiId,
          token: mockToken,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getSushiIdByToken', () => {
    it('should return sushi details if token is valid', async () => {
      const token = 'valid-token';
      const mockSushi = {
        id: 100,
        title: 'Shared Sushi',
        sushiType: { id: 1, name: 'Type' },
        category: { id: 1, name: 'Category' },
      };
      
      prismaMock.shareToken.findFirst.mockResolvedValue({
        id: 1,
        token,
        sushi: mockSushi,
      });

      const result = await getSushiIdByToken(token);

      expect(prismaMock.shareToken.findFirst).toHaveBeenCalledWith({
        where: { token },
        include: {
          sushi: {
            include: {
              sushiType: true,
              category: true,
            },
          },
        },
      });
      expect(result).toEqual(mockSushi);
    });

    it('should return null if token is invalid', async () => {
      prismaMock.shareToken.findFirst.mockResolvedValue(null);

      const result = await getSushiIdByToken('invalid');

      expect(result).toBeNull();
    });
  });
});
