import { Request, Response, Router } from "express";
import { authenticate } from "../middleware/auth";
import { createShareToken, getSushiIdByToken } from "../services/shareTokenService";

const router = Router();

// 공유 토큰 생성 (로그인 필요)
router.post("/", authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { message: "인증이 필요합니다." },
    });
  }

  try {
    const { sushiId } = req.body;
    
    if (!sushiId) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { message: "sushiId가 필요합니다." },
      });
    }

    const shareToken = await createShareToken(Number(sushiId));

    return res.status(201).json({
      success: true,
      data: { token: shareToken.token },
      error: null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: "공유 토큰 생성 중 오류가 발생했습니다." },
    });
  }
});

// 공유 토큰으로 스시 조회 (인증 불필요 - 카카오톡 브라우저 접근 가능)
router.get("/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const sushi = await getSushiIdByToken(token);

    if (!sushi) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { message: "유효하지 않은 토큰이거나 해당 고민을 찾을 수 없습니다." },
      });
    }

    // 보안을 위해 필요한 정보만 선별하여 반환할 수도 있음
    return res.json({
      success: true,
      data: { sushi },
      error: null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: "공유 정보 조회 중 오류가 발생했습니다." },
    });
  }
});

export default router;
