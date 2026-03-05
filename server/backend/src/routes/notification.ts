import { Request, Response, Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getUnreadNotifications, markNotificationAsRead } from '../services/notificationService';

const router = Router();

/**
 * @openapi
 * /api/notifications/unread:
 *   get:
 *     summary: 읽지 않은 알림 목록 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 읽지 않은 알림 목록 반환
 *       401:
 *         description: 인증 실패
 */
router.get('/unread', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: '인증 정보가 없습니다.' });
  }

  try {
    const notifications = await getUnreadNotifications(req.user.id);
    return res.json({ notifications });
  } catch (err) {
    return res.status(500).json({ message: '알림 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: 알림 읽음 처리
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 알림 ID
 *     responses:
 *       200:
 *         description: 알림 읽음 처리 성공
 *       404:
 *         description: 알림을 찾을 수 없음
 */
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: '인증 정보가 없습니다.' });
  }

  const notificationId = Number(req.params.id);
  if (isNaN(notificationId)) {
    return res.status(400).json({ message: '잘못된 알림 ID입니다.' });
  }

  try {
    await markNotificationAsRead(notificationId, req.user.id);
    return res.json({ message: '알림을 읽음 처리했습니다.' });
  } catch (err) {
    return res.status(404).json({ message: '알림을 찾을 수 없거나 접근 권한이 없습니다.' });
  }
});

export default router;
