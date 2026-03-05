import { Request, Response, Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getSushiByUserId, getSushiDetail, searchMySushiByTitle, deleteSushi, updateSushi } from '../services/mySushiService';

const router = Router();

// `page`와 `pageSize` 쿼리 파라미터를 파싱하고 기본값을 설정하는 함수
const parsePagination = (req: Request) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  return { page, pageSize };
};

router.get('/sushi/my', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: '인증이 필요합니다.' } });
  }

  try {
    const { page, pageSize } = parsePagination(req);
    const result = await getSushiByUserId(req.user.id, page, pageSize);

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: '내 고민 목록 조회 중 오류가 발생했습니다.' } });
  }
});

router.get('/sushi/my/search', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: '인증이 필요합니다.' } });
  }

  const query = req.query.q;
  if (typeof query !== 'string' || !query) {
    return res.status(400).json({ success: false, error: { message: '검색어(q)가 필요합니다.' } });
  }

  try {
    const { page, pageSize } = parsePagination(req);
    const result = await searchMySushiByTitle(req.user.id, query, page, pageSize);

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: '내 고민 검색 중 오류가 발생했습니다.' } });
  }
});

router.get('/sushi/my/:sushiId', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: '인증이 필요합니다.' } });
  }

  try {
    const sushiId = Number(req.params.sushiId);
    if (isNaN(sushiId)) {
      return res.status(400).json({ success: false, error: { message: '유효하지 않은 스시 ID입니다.' } });
    }

    const sushi = await getSushiDetail(req.user.id, sushiId);

    if (!sushi) {
      return res.status(404).json({ success: false, error: { message: '해당 고민을 찾을 수 없거나 접근 권한이 없습니다.' } });
    }

    return res.json({ success: true, data: { sushi } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: '고민 상세 정보 조회 중 오류가 발생했습니다.' } });
  }
});

router.delete('/sushi/my/:sushiId', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: '인증이 필요합니다.' } });
  }

  try {
    const sushiId = Number(req.params.sushiId);
    if (isNaN(sushiId)) {
      return res.status(400).json({ success: false, error: { message: '유효하지 않은 스시 ID입니다.' } });
    }

    await deleteSushi(req.user.id, sushiId);

    return res.json({ success: true, data: { message: '고민이 성공적으로 삭제되었습니다.' } });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '고민 삭제 중 오류가 발생했습니다.';
    
    if (errorMessage.includes('찾을 수 없') || errorMessage.includes('권한이 없')) {
      return res.status(404).json({ success: false, error: { message: errorMessage } });
    }

    return res.status(500).json({ success: false, error: { message: errorMessage } });
  }
});

// 내 고민 수정 API
router.patch('/sushi/my/:sushiId', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: '인증이 필요합니다.' } });
  }

  try {
    const sushiId = Number(req.params.sushiId);
    const { title, content } = req.body; // 수정할 필드들을 body에서 가져옴

    if (isNaN(sushiId)) {
      return res.status(400).json({ success: false, error: { message: '유효하지 않은 스시 ID입니다.' } });
    } 

    // 최소한 하나의 필드는 수정되어야 함
    if (!title && !content) {
      return res.status(400).json({ success: false, error: { message: '수정할 제목이나 내용을 입력해주세요.' } });
    }

    const updatedSushi = await updateSushi(req.user.id, sushiId, { title, content });

    return res.json({ 
      success: true, 
      data: { 
        message: '고민이 성공적으로 수정되었습니다.',
        sushi: updatedSushi 
      } 
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '고민 수정 중 오류가 발생했습니다.';
    
    if (errorMessage.includes('찾을 수 없') || errorMessage.includes('권한')) {
      return res.status(403).json({ success: false, error: { message: errorMessage } });
    }

    return res.status(500).json({ success: false, error: { message: errorMessage } });
  }
});

export default router;
