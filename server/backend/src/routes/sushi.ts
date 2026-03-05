import { Request, Response, Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createSushi,
  CreateSushiInput,
  getRailSushi,
  getRandomSushiRail,
} from "../services/sushiService";
import { saveAnswer, CreateAnswerRequest } from "../services/answerService";
import { recordSushiExposure } from "../services/sushiExposureService";

const router = Router();

// size 쿼리는 문자열로만 받도록 제한하고 기본값을 준다.
const parseSize = (value: unknown) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") {
    return 15;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 15;
  }
  const size = Math.floor(parsed);
  // 상한 추가: 최대 100으로 제한
  return Math.min(size, 100);
};

router.get("/sushi/rail", authenticate, async (req: Request, res: Response) => {
  try {
    const size = parseSize(req.query.size);
    // 랜덤 레일 데이터 생성
    const sushi = await getRandomSushiRail(size, req.user?.id);

    // 명세에 맞춘 응답 포맷
    return res.json({
      success: true,
      data: { sushi },
      error: null,
    });
  } catch (err) {
    // 서버 오류 시 공통 에러 포맷
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: "스시 레일 조회 중 오류가 발생했습니다." },
    });
  }
});

// 레일 특정 스시 상세 조회
router.get(
  "/sushi/rail/:sushiId",
  authenticate,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { message: "인증이 필요합니다." },
      });
    }

    try {
      const sushiId = Number(req.params.sushiId);
      if (!Number.isFinite(sushiId) || sushiId <= 0) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { message: "잘못된 sushiId입니다." },
        });
      }

      const sushi = await getRailSushi(req.user.id, sushiId);
      if (!sushi) {
        return res.status(404).json({
          success: false,
          data: null,
          error: { message: "스시를 찾을 수 없습니다." },
        });
      }

      // 사용자가 스시를 조회했으므로 노출 기록
      await recordSushiExposure(req.user.id, sushiId);

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
        error: { message: "스시 레일 상세 조회 중 오류가 발생했습니다." },
      });
    }
  },
);

router.post("/sushi", authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { message: "인증이 필요합니다." },
    });
  }

  try {
    const {
      title,
      content,
      expireTime: expireTimeStr,
      maxAnswers,
      categoryId,
      sushiTypeId,
    } = req.body;

    // Basic validation
    if (!title || !content || !expireTimeStr || !maxAnswers) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          message:
            "필수 필드가 누락되었습니다: title, content, expireTime, maxAnswers",
        },
      });
    }

    const expireTime = new Date(expireTimeStr);
    if (isNaN(expireTime.getTime()) || expireTime <= new Date()) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { message: "expireTime은 미래의 유효한 날짜여야 합니다." },
      });
    }

    const sushiData: CreateSushiInput = {
      title,
      content,
      expireTime,
      maxAnswers: Number(maxAnswers),
      categoryId: categoryId ? Number(categoryId) : null,
      sushiTypeId: sushiTypeId ? Number(sushiTypeId) : null,
    };

    const newSushi = await createSushi(req.user.id, sushiData);

    return res.status(201).json({
      success: true,
      data: { sushi: newSushi },
      error: null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: "고민(스시) 작성 중 오류가 발생했습니다." },
    });
  }
});

router.post(
  "/sushi/rail/:sushiId/answer",
  authenticate,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { message: "인증이 필요합니다." },
      });
    }

    try {
      const sushiId = Number(req.params.sushiId);
      if (!Number.isFinite(sushiId) || sushiId <= 0) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { message: "잘못된 sushiId입니다." },
        });
      }

      const answerRequest: CreateAnswerRequest = req.body;

      const answer = await saveAnswer(answerRequest, req.user.id, sushiId);

      return res.status(201).json({
        success: true,
        data: { answer },
        error: null,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "답변 저장 중 오류가 발생했습니다.";

      if (
        errorMessage.includes("찾을 수 없습니다") ||
        errorMessage.includes("마감") ||
        errorMessage.includes("만료") ||
        errorMessage.includes("받을 수 없습니다") ||
        errorMessage.includes("이미") ||
        errorMessage.includes("비어있을 수 없습니다")
      ) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { message: errorMessage },
        });
      }

      console.error(err);
      return res.status(500).json({
        success: false,
        data: null,
        error: { message: "답변 저장 중 오류가 발생했습니다." },
      });
    }
  },
);


export default router;
