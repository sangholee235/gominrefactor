import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authRouter from '../src/routes/auth';

// 1. Mock Services
const userServiceMock = vi.hoisted(() => ({
  getUserById: vi.fn(),
  upsertKakaoUser: vi.fn(),
}));

const kakaoServiceMock = vi.hoisted(() => ({
  exchangeCodeForToken: vi.fn(),
  fetchKakaoProfile: vi.fn(),
}));

vi.mock('../src/services/userService', () => userServiceMock);
vi.mock('../src/services/kakao', () => kakaoServiceMock);

// 2. Mock JWT
const jwtMock = vi.hoisted(() => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
  verifyAccessToken: vi.fn(),
}));

vi.mock('../src/lib/jwt', () => jwtMock);

// 3. Mock Middleware
vi.mock('../src/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    // 테스트용 가짜 인증 처리
    // req.user 주입 여부는 테스트 케이스에서 제어하기 어렵으므로
    // 기본적으로 'user'가 있다고 가정하거나, 
    // 특정 테스트에서만 실패하도록 유도하기 위해 분기 처리가 필요할 수 있음.
    // 여기서는 간단히 user id:1 을 주입한다고 가정.
    // *미인증* 테스트를 위해서는 라우터 레벨에서 분리가 필요하거나, 
    // mockImplementation을 테스트 케이스 내부에서 재정의해야 함.
    req.user = { id: 1, provider: 'kakao' };
    next();
  },
}));

// Build App
const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api', authRouter);
  return app;
};

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/me', () => {
    it('returns user info when authenticated', async () => {
      const mockUser = { id: 1, provider: 'kakao', providerId: '123' };
      userServiceMock.getUserById.mockResolvedValue(mockUser);

      const res = await request(buildApp()).get('/api/me');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ user: mockUser });
      expect(userServiceMock.getUserById).toHaveBeenCalledWith(1);
    });

    it('returns 404 if user not found in DB', async () => {
      userServiceMock.getUserById.mockResolvedValue(null);

      const res = await request(buildApp()).get('/api/me');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('사용자를 찾을 수 없습니다.');
    });
  });

  describe('GET /api/auth/kakao/callback', () => {
    it('redirects to frontend with tokens on success', async () => {
      const code = 'valid-code';
      const mockKakaoToken = 'kakao-access-token';
      const mockProfile = { id: 12345 };
      const mockUser = { id: 1, provider: 'kakao' };
      const appAccessToken = 'app-access-token';

      kakaoServiceMock.exchangeCodeForToken.mockResolvedValue(mockKakaoToken);
      kakaoServiceMock.fetchKakaoProfile.mockResolvedValue(mockProfile);
      userServiceMock.upsertKakaoUser.mockResolvedValue(mockUser);
      jwtMock.signAccessToken.mockReturnValue(appAccessToken);

      const res = await request(buildApp()).get(`/api/auth/kakao/callback?code=${code}`);

      expect(res.status).toBe(302); // Redirect
      expect(res.header.location).toContain('/auth/finalize');
      expect(res.header.location).toContain(`accessToken=${appAccessToken}`);
      expect(kakaoServiceMock.exchangeCodeForToken).toHaveBeenCalledWith(code);
    });

    it('returns 400 if code is missing', async () => {
      const res = await request(buildApp()).get('/api/auth/kakao/callback');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns new tokens when refresh token is valid', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = { sub: 1, type: 'refresh' };
      const mockUser = { id: 1, provider: 'kakao' };
      
      jwtMock.verifyRefreshToken.mockReturnValue(mockPayload);
      userServiceMock.getUserById.mockResolvedValue(mockUser);
      jwtMock.signAccessToken.mockReturnValue('new-access');
      jwtMock.signRefreshToken.mockReturnValue('new-refresh');

      const res = await request(buildApp())
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        user: mockUser,
      });
    });

    it('returns 401 if refresh token is invalid', async () => {
      jwtMock.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await request(buildApp())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid' });

      expect(res.status).toBe(401);
    });

    it('returns 400 if refresh token is missing', async () => {
      const res = await request(buildApp())
        .post('/api/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
