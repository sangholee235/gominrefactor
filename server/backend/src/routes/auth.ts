import { Request, Response, Router } from "express";
import { env } from "../config/env";
import { authenticate } from "../middleware/auth";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt";
import { exchangeCodeForToken, fetchKakaoProfile } from "../services/kakao";
import {
  getUserById,
  upsertKakaoUser,
  withdrawUser,
  updateUserNickname,
  upsertDevUser,
} from "../services/userService";

const router = Router();

/**
 * @openapi
 * /api/me:
 *   get:
 *     summary: 현재 사용자 정보 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 반환
 *       401:
 *         description: 인증 실패
 */
router.get("/me", authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "인증 정보가 없습니다." });
  }

  try {
    let user = await getUserById(req.user.id);
    if (!user && env.devAuthBypass && env.nodeEnv !== "production") {
      user = await upsertDevUser(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    return res.json({ user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "사용자 조회 중 오류가 발생했습니다." });
  }
});

router.get("/auth/kakao/callback", async (req: Request, res: Response) => {
  const { code } = req.query as { code?: string };

  if (!code) {
    // 카카오 인증 실패 시 에러 쿼리와 함께 프론트엔드로 리디렉션 할 수도 있습니다.
    return res.status(400).send("인가 코드가 없습니다.");
  }

  try {
    const kakaoAccessToken = await exchangeCodeForToken(code);
    const profile = await fetchKakaoProfile(kakaoAccessToken);
    const kakaoId = profile.id?.toString();

    if (!kakaoId) {
      return res
        .status(500)
        .json({ message: "카카오 사용자 정보를 가져올 수 없습니다." });
    }

    const user = await upsertKakaoUser(kakaoId);
    const accessToken = signAccessToken(user);

    // 로그인 성공 후, 자체 토큰과 사용자 정보를 쿼리에 담아 프론트엔드로 리디렉션
    const frontendRedirectUrl = new URL(`${env.clientUrl}/auth/finalize`);
    frontendRedirectUrl.searchParams.append("accessToken", accessToken);
    frontendRedirectUrl.searchParams.append(
      "user",
      JSON.stringify({ id: user.id, provider: user.provider }),
    );

    res.redirect(frontendRedirectUrl.toString());
  } catch (err) {
    console.error(err);
    // 에러 발생 시 프론트엔드의 에러 페이지나 로그인 페이지로 리디렉션 할 수 있습니다.
    res.status(500).send("카카오 로그인 처리 중 서버에서 오류가 발생했습니다.");
  }
});

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: 리프레시 토큰으로 액세스 토큰 재발급
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 새 액세스/리프레시 토큰
 *       400:
 *         description: 리프레시 토큰 누락
 *       401:
 *         description: 리프레시 토큰 검증 실패
 */
router.post("/auth/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    return res.status(400).json({ message: "리프레시 토큰이 필요합니다." });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.type !== "refresh") {
      return res.status(401).json({ message: "잘못된 토큰 유형입니다." });
    }

    const user = await getUserById(payload.sub);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: { id: user.id, provider: user.provider },
    });
  } catch (err) {
    return res
      .status(401)
      .json({ message: "리프레시 토큰이 유효하지 않습니다." });
  }
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 */
router.post("/auth/logout", authenticate, (req: Request, res: Response) => {
  // 실제 로그아웃 처리: 클라이언트에서 토큰을 삭제하면 됨
  // 백엔드에서는 특별한 작업이 필요없지만 성공 응답을 보냄
  return res.json({ 
    success: true,
    data: null,
    error: null,
    message: "로그아웃 되었습니다." 
  });
});

/**
 * @openapi
 * /api/auth/withdraw:
 *   delete:
 *     summary: 회원 탈퇴
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 */
router.delete(
  "/auth/withdraw",
  authenticate,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증 정보가 없습니다." });
    }

    try {
      await withdrawUser(req.user.id);
      return res.json({ message: "회원 탈퇴가 완료되었습니다." });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "회원 탈퇴 처리 중 오류가 발생했습니다." });
    }
  },
);

/**
 * @openapi
 * /api/auth/nickname:
 *   put:
 *     summary: 닉네임 변경
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 maxLength: 16
 *     responses:
 *       200:
 *         description: 닉네임 변경 성공
 *       400:
 *         description: 닉네임 누락 혹은 형식 오류
 *       401:
 *         description: 인증 실패
 */
router.put(
  "/auth/nickname",
  authenticate,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증 정보가 없습니다." });
    }

    const { nickname } = req.body as { nickname?: string };

    if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0) {
      return res.status(400).json({ message: "유효한 닉네임을 입력해주세요." });
    }
    if (nickname.length > 16) {
      return res.status(400).json({ message: "닉네임은 16자 이하로 입력해주세요." });
    }

    try {
      // 1. 변경 전 정보 가져오기 (이전 닉네임)
      const userBefore = await getUserById(req.user.id);
      const oldNickname = userBefore?.nickname;

      // 2. 닉네임 업데이트
      const updatedUser = await updateUserNickname(req.user.id, nickname.trim());

      // 3. 실시간 알림 브로드캐스트 (WebSocket)
      const io = req.app.get("io");
      if (io) {
        io.to("global").emit("nickname_changed", {
          userId: req.user.id,
          oldNickname: oldNickname,
          newNickname: updatedUser.nickname,
        });
      }

      return res.json({ message: "닉네임이 성공적으로 변경되었습니다.", user: updatedUser });
    } catch (err) {
      console.error("[Nickname Update Error]", err);
      return res.status(500).json({ message: "닉네임 변경 처리 중 오류가 발생했습니다." });
    }
  }
);

export default router;
