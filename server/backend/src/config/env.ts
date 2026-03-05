import dotenv from 'dotenv';

dotenv.config();

const numberFromEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: numberFromEnv(process.env.PORT, 3000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? '',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  kakaoClientId: process.env.KAKAO_CLIENT_ID ?? '',
  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET ?? '',
  kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI ?? '',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  devAuthBypass: process.env.DEV_AUTH_BYPASS === 'true',
  devUserId: numberFromEnv(process.env.DEV_USER_ID, 1),
};

export const assertRequiredEnv = () => {
  const missing: string[] = [];
  if (!env.jwtSecret) missing.push('JWT_SECRET');
  if (!env.jwtRefreshSecret) missing.push('JWT_REFRESH_SECRET (or JWT_SECRET)');
  if (missing.length) {
    throw new Error(`필수 환경변수가 비어 있습니다: ${missing.join(', ')}`);
  }
};
