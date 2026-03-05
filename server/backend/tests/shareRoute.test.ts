import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import shareRouter from '../src/routes/share';

// Mock Service
const shareTokenServiceMock = vi.hoisted(() => ({
  createShareToken: vi.fn(),
  getSushiIdByToken: vi.fn(),
}));

vi.mock('../src/services/shareTokenService', () => shareTokenServiceMock);

// Mock Auth Middleware
// Share 생성(POST)은 인증이 필요하지만, 조회(GET)는 인증이 필요 없음.
vi.mock('../src/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    // POST 요청 시에는 인증된 사용자로 가정
    if (req.method === 'POST') {
        req.user = { id: 1 };
    }
    next();
  },
}));

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/share', shareRouter);
  return app;
};

describe('Share Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/share', () => {
    it('creates a token for valid sushiId', async () => {
      const sushiId = 100;
      const mockToken = { token: 'new-token' };
      shareTokenServiceMock.createShareToken.mockResolvedValue(mockToken);

      const res = await request(buildApp())
        .post('/api/share')
        .send({ sushiId });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        success: true,
        data: { token: 'new-token' },
        error: null,
      });
      expect(shareTokenServiceMock.createShareToken).toHaveBeenCalledWith(100);
    });

    it('returns 400 if sushiId is missing', async () => {
      const res = await request(buildApp())
        .post('/api/share')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('sushiId가 필요합니다.');
    });
  });

  describe('GET /api/share/:token', () => {
    it('returns sushi details for valid token', async () => {
      const token = 'valid-token';
      const mockSushi = { id: 100, title: 'Shared' };
      shareTokenServiceMock.getSushiIdByToken.mockResolvedValue(mockSushi);

      const res = await request(buildApp()).get(`/api/share/${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: { sushi: mockSushi },
        error: null,
      });
      expect(shareTokenServiceMock.getSushiIdByToken).toHaveBeenCalledWith(token);
    });

    it('returns 404 for invalid token', async () => {
      shareTokenServiceMock.getSushiIdByToken.mockResolvedValue(null);

      const res = await request(buildApp()).get('/api/share/invalid');

      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain('유효하지 않은 토큰');
    });
  });
});
