import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import sushiRouter from '../src/routes/sushi';

const serviceMock = vi.hoisted(() => ({
  getRandomSushiRail: vi.fn(),
}));

vi.mock('../src/services/sushiService', async () => {
  const actual = await vi.importActual<typeof import('../src/services/sushiService')>('../src/services/sushiService');
  return {
    ...actual,
    getRandomSushiRail: serviceMock.getRandomSushiRail,
  };
});

vi.mock('../src/middleware/auth', () => ({
  authenticate: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api', sushiRouter);
  return app;
};

describe('GET /api/sushi/rail', () => {
  beforeEach(() => {
    serviceMock.getRandomSushiRail.mockReset();
  });

  it('returns formatted response and passes size', async () => {
    const payload = [
      {
        sushiId: 1,
        category: 2,
        sushiType: 3,
        remainingAnswers: 4,
        expirationTime: '2024-02-01T00:00:00.000Z',
      },
    ];

    serviceMock.getRandomSushiRail.mockResolvedValueOnce(payload);

    const res = await request(buildApp()).get('/api/sushi/rail?size=1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { sushi: payload }, error: null });
    
    // Check that it's called with size and undefined (since no user in this mock setup, though auth is bypassed)
    // Actually authenticate middleware mock just calls next(), so req.user is undefined.
    expect(serviceMock.getRandomSushiRail).toHaveBeenCalledWith(1, undefined);
  });

  it('defaults size when invalid', async () => {
    serviceMock.getRandomSushiRail.mockResolvedValueOnce([]);

    const res = await request(buildApp()).get('/api/sushi/rail?size=abc');

    expect(res.status).toBe(200);
    expect(serviceMock.getRandomSushiRail).toHaveBeenCalledWith(15, undefined);
  });
});
