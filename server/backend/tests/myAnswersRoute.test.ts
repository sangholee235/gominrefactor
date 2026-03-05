import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import myAnswersRouter from '../src/routes/myAnswers';

// Mock Service
const myAnswersServiceMock = vi.hoisted(() => ({
  getMyAnswers: vi.fn(),
}));

vi.mock('../src/services/myAnswersService', () => myAnswersServiceMock);

// Mock Auth Middleware
vi.mock('../src/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 1 };
    next();
  },
}));

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/my-answers', myAnswersRouter);
  return app;
};

describe('MyAnswers Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/my-answers', () => {
    it('returns list of answers', async () => {
      const mockAnswers = [{ id: 1, content: 'Test' }];
      myAnswersServiceMock.getMyAnswers.mockResolvedValue(mockAnswers);

      const res = await request(buildApp()).get('/api/my-answers');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockAnswers });
      expect(myAnswersServiceMock.getMyAnswers).toHaveBeenCalledWith(1);
    });

    it('handles service errors gracefully', async () => {
      myAnswersServiceMock.getMyAnswers.mockRejectedValue(new Error('DB Error'));

      const res = await request(buildApp()).get('/api/my-answers');

      expect(res.status).toBe(500);
      expect(res.body.error.message).toBe('내 답변 목록 조회 중 오류가 발생했습니다.');
    });
  });
});
