import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import mySushiRouter from '../src/routes/mySushi';

// Mock Service
const mySushiServiceMock = vi.hoisted(() => ({
  getSushiByUserId: vi.fn(),
  searchMySushiByTitle: vi.fn(),
  getSushiDetail: vi.fn(),
}));

vi.mock('../src/services/mySushiService', () => mySushiServiceMock);

// Mock Auth Middleware
vi.mock('../src/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 1 }; // Authenticated user
    next();
  },
}));

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api', mySushiRouter);
  return app;
};

describe('MySushi Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/sushi/my', () => {
    it('returns sushi list with pagination', async () => {
      const mockResult = {
        totalCount: 1,
        sushi: [{ id: 1, title: 'Test' }],
        totalPages: 1,
        currentPage: 1,
      };
      mySushiServiceMock.getSushiByUserId.mockResolvedValue(mockResult);

      const res = await request(buildApp()).get('/api/sushi/my?page=1&pageSize=10');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockResult });
      expect(mySushiServiceMock.getSushiByUserId).toHaveBeenCalledWith(1, 1, 10);
    });

    it('uses default pagination values', async () => {
      mySushiServiceMock.getSushiByUserId.mockResolvedValue({});
      await request(buildApp()).get('/api/sushi/my');
      expect(mySushiServiceMock.getSushiByUserId).toHaveBeenCalledWith(1, 1, 10);
    });
  });

  describe('GET /api/sushi/my/search', () => {
    it('returns search results', async () => {
      const mockResult = { totalCount: 1, sushi: [] };
      mySushiServiceMock.searchMySushiByTitle.mockResolvedValue(mockResult);

      const res = await request(buildApp()).get('/api/sushi/my/search?q=test');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockResult });
      expect(mySushiServiceMock.searchMySushiByTitle).toHaveBeenCalledWith(1, 'test', 1, 10);
    });

    it('returns 400 if q parameter is missing', async () => {
      const res = await request(buildApp()).get('/api/sushi/my/search');
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('검색어');
    });
  });

  describe('GET /api/sushi/my/:sushiId', () => {
    it('returns sushi detail if found', async () => {
      const mockSushi = { id: 1, title: 'Detail' };
      mySushiServiceMock.getSushiDetail.mockResolvedValue(mockSushi);

      const res = await request(buildApp()).get('/api/sushi/my/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: { sushi: mockSushi } });
      expect(mySushiServiceMock.getSushiDetail).toHaveBeenCalledWith(1, 1);
    });

    it('returns 404 if sushi not found', async () => {
      mySushiServiceMock.getSushiDetail.mockResolvedValue(null);

      const res = await request(buildApp()).get('/api/sushi/my/999');

      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid sushiId', async () => {
      const res = await request(buildApp()).get('/api/sushi/my/abc');
      expect(res.status).toBe(400);
    });
  });
});
