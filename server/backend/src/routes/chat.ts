import { Request, Response, Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getRecentMessages } from '../services/chatService';

const router = Router();

/**
 * @openapi
 * /api/chat/history:
 *   get:
 *     summary: 글로벌 채팅방 최근 메시지 목록 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 가져올 메시지 수 (최대 100)
 *     responses:
 *       200:
 *         description: 메시지 목록 반환
 *       401:
 *         description: 인증 실패
 */
router.get('/history', authenticate, async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    try {
        const messages = await getRecentMessages(limit);
        return res.json({ messages });
    } catch (err) {
        console.error('[Chat] 메시지 히스토리 조회 실패:', err);
        return res
            .status(500)
            .json({ message: '채팅 히스토리를 가져오는 중 오류가 발생했습니다.' });
    }
});

export default router;
