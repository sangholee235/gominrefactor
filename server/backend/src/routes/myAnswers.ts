import { Request, Response, Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getMyAnswers, deleteMyAnswer, updateMyAnswer, searchMyAnswers  } from '../services/myAnswersService';

const router = Router();

// `page`와 `pageSize` 쿼리 파라미터를 파싱하고 기본값을 설정하는 함수
const parsePagination = (req: Request) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  return { page, pageSize };
};

router.get('/', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: '인증이 필요합니다.' } });
  }

  try {
    const userId = req.user.id;
    const myAnswers = await getMyAnswers(userId);
    return res.json({ success: true, data: myAnswers });
  } catch (err) {
    console.error('Error fetching my answers:', err);
    return res.status(500).json({ success: false, error: { message: '내 답변 목록 조회 중 오류가 발생했습니다.' } });
  }
});

// 답변 검색 API 추가
router.get('/search', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: '인증이 필요합니다.' } });
  }

  const query = req.query.q;
  if (typeof query !== 'string' || !query) {
    return res.status(400).json({ success: false, error: { message: '검색어(q)가 필요합니다.' } });
  }

  try {
    const { page, pageSize } = parsePagination(req);
    const result = await searchMyAnswers(req.user.id, query, page, pageSize);

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: '내 답변 검색 중 오류가 발생했습니다.' } });
  }
});

router.put('/:answerId', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: '인증이 필요합니다.' } });
  }

  try {
    const userId = req.user.id;
    const answerId = Number(req.params.answerId);
    const { content } = req.body;

    // 유효성 검사
    if (isNaN(answerId)) {
      return res.status(400).json({ success: false, error: { message: '유효하지 않은 답변 ID입니다.' } });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, error: { message: '수정할 내용을 입력해주세요.' } });
    }

    // 서비스 함수 호출
    const updatedAnswer = await updateMyAnswer(userId, answerId, content);

    return res.json({ 
      success: true, 
      data: updatedAnswer, // 수정된 객체 반환 (프론트엔드 UI 갱신용)
      message: '답변이 성공적으로 수정되었습니다.' 
    });
  } catch (err: any) {
    console.error('Error updating my answer:', err);

    // 에러 메시지에 따른 분기 처리
    if (err.message.includes('찾을 수 없')) {
      return res.status(404).json({ success: false, error: { message: err.message } });
    }
    if (err.message.includes('권한')) {
      return res.status(403).json({ success: false, error: { message: err.message } });
    }

    return res.status(500).json({ success: false, error: { message: '답변 수정 중 오류가 발생했습니다.' } });
  }
});


// 답변 삭제 API 추가
router.delete('/:answerId', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { message: '인증이 필요합니다.' } });
  }

  try {
    const userId = req.user.id;
    const answerId = Number(req.params.answerId);

    if (isNaN(answerId)) {
      return res.status(400).json({ success: false, error: { message: '유효하지 않은 답변 ID입니다.' } });
    }

    // 서비스 함수 호출
    await deleteMyAnswer(userId, answerId);

    return res.json({ success: true, data: { message: '답변이 성공적으로 삭제되었습니다.' } });
  } catch (err: any) {
    console.error('Error deleting my answer:', err);
    
    // 에러 메시지에 따른 처리 (권한 없음 등)
    if (err.message.includes('권한이 없') || err.message.includes('찾을 수 없')) {
      return res.status(403).json({ success: false, error: { message: err.message } });
    }

    return res.status(500).json({ success: false, error: { message: '답변 삭제 중 오류가 발생했습니다.' } });
  }
});

export default router;
