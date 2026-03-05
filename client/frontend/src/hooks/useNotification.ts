import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notificationApi";
import { useAuth } from "../context/AuthContext";

export const notificationKeys = {
  all: ["notifications"] as const,
};

/**
 * 알림 목록 조회 및 관리 Hook
 */
export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const DEMO_MODE =
    (import.meta as any).env?.VITE_DISABLE_AUTH === "true" ||
    (import.meta as any).env?.VITE_DEMO_MODE === "true";

  // 알림 목록 조회
  const query = useQuery({
    queryKey: notificationKeys.all,
    queryFn: fetchNotifications,
    enabled: isLoggedIn || DEMO_MODE, // 로그인 또는 데모 모드에서 조회
    refetchInterval: 60000, // 1분마다 폴링
    staleTime: 30000, // 30초 동안은 캐시된 데이터 사용
  });

  // 단일 알림 읽음 처리
  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // 전체 알림 읽음 처리
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // 읽지 않은 알림 여부
  const hasUnread = query.data?.some((n) => !n.isRead) ?? false;

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    hasUnread,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    refetch: query.refetch,
  };
};
