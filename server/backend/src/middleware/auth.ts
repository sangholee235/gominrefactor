import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { verifyAccessToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  if (!token) {
    if (env.devAuthBypass && env.nodeEnv !== 'production') {
      const devUserIdHeader = req.headers['x-dev-user-id'];
      const devId = devUserIdHeader ? parseInt(devUserIdHeader as string, 10) : env.devUserId;
      req.user = { id: isNaN(devId) ? env.devUserId : devId, provider: 'dev' };
      return next();
    }
    return res.status(401).json({ message: '토큰이 필요합니다.' });
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') {
      return res.status(401).json({ message: '잘못된 토큰 유형입니다.' });
    }

    // 탈퇴 여부 확인을 위해 DB 조회
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, deletedAt: true }
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({ message: '탈퇴한 사용자이거나 존재하지 않는 사용자입니다.' });
    }

    req.user = { id: payload.sub, provider: payload.provider };
    return next();
  } catch (err) {
    if (env.devAuthBypass && env.nodeEnv !== 'production') {
      const devUserIdHeader = req.headers['x-dev-user-id'];
      const devId = devUserIdHeader ? parseInt(devUserIdHeader as string, 10) : env.devUserId;
      req.user = { id: isNaN(devId) ? env.devUserId : devId, provider: 'dev' };
      return next();
    }
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
