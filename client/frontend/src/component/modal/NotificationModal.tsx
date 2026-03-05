import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotification";
import { type Notification } from "../../api/notificationApi";
import "../../styles/NotificationModal.css";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
  const navigate = useNavigate();
  const { notifications, markAsRead, isLoading } =
    useNotifications();

  if (!isOpen) return null;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.redirectUrl) {
      navigate(notification.redirectUrl);
    }
    onClose();
  };

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h3>알림</h3>
        </div>

        <div className="notification-list">
          {isLoading ? (
            <div className="notification-empty">로딩 중...</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">새로운 알림이 없습니다.</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-content">
                  {notification.sushi?.title && `[${notification.sushi.title}] `}
                  {notification.message}
                </div>
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        <button className="notification-close-btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
