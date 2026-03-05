import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

type TokenType = 'access' | 'refresh';

export interface AuthPayload {
  sub: number;
  provider: string;
  type: TokenType;
  iat?: number;
  exp?: number;
}

const buildPayload = (user: { id: number; provider: string }, type: TokenType) => ({
  sub: user.id,
  provider: user.provider,
  type,
});

const accessSecret: Secret = env.jwtSecret;
const refreshSecret: Secret = env.jwtRefreshSecret || env.jwtSecret;
const accessExpiresIn: SignOptions['expiresIn'] =
  env.jwtExpiresIn as unknown as SignOptions['expiresIn'];
const refreshExpiresIn: SignOptions['expiresIn'] =
  env.jwtRefreshExpiresIn as unknown as SignOptions['expiresIn'];

export const signAccessToken = (user: { id: number; provider: string }) =>
  jwt.sign(buildPayload(user, 'access'), accessSecret, {
    expiresIn: accessExpiresIn,
  });

export const signRefreshToken = (user: { id: number; provider: string }) =>
  jwt.sign(buildPayload(user, 'refresh'), refreshSecret, {
    expiresIn: refreshExpiresIn,
  });

const ensureAuthPayload = (decoded: string | JwtPayload): AuthPayload => {
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('잘못된 토큰 payload입니다.');
  }

  const { sub, provider, type, iat, exp } = decoded as Record<string, unknown>;
  const subValue =
    typeof sub === 'string' ? Number(sub) : typeof sub === 'number' ? sub : NaN;

  if (!Number.isFinite(subValue)) {
    throw new Error('토큰에 사용자 정보가 없습니다.');
  }

  if (type !== 'access' && type !== 'refresh') {
    throw new Error('잘못된 토큰 유형입니다.');
  }

  if (typeof provider !== 'string') {
    throw new Error('잘못된 제공자 정보입니다.');
  }

  return { sub: subValue, provider, type, iat: iat as number | undefined, exp: exp as number | undefined };
};

export const verifyAccessToken = (token: string): AuthPayload =>
  ensureAuthPayload(jwt.verify(token, accessSecret));

export const verifyRefreshToken = (token: string): AuthPayload =>
  ensureAuthPayload(jwt.verify(token, refreshSecret));
