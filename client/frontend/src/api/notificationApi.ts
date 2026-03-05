import apiClient from "../config/apiClient";

export interface Notification {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  sushiId: number | null;
  notificationType: "ANSWER_CREATED" | "ANSWER_LIKED" | "SYSTEM";
  message: string;
  isRead: boolean;
  redirectUrl: string;
  sushi: {
    title: string;
  } | null;
}

/**
 * 내 알림 목록 조회
 * GET /notifications
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get<{ notifications: Notification[] }>(
    "/notifications/unread",
  );
  return response.data.notifications || [];
};

/**
 * 알림 읽음 처리
 * PATCH /notifications/:id/read
 */
export const markNotificationAsRead = async (id: number): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`);
};

/**
 * 모든 알림 읽음 처리
 * PATCH /notifications/read-all
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  // 백엔드에 전체 읽음 API가 없는 경우 개별 읽음으로 대체하거나, 추후 백엔드 구현 필요
  // 현재는 제공해주신 API 명세에는 없으므로 주석 처리하거나 필요시 구현
  console.warn("Mark all as read is not implemented in backend yet.");
};
