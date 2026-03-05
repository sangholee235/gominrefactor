import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import notificationRouter from "../src/routes/notification";

// Mock Services
const notificationServiceMock = vi.hoisted(() => ({
  getUnreadNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
}));

vi.mock("../src/services/notificationService", () => notificationServiceMock);

// Mock Middleware
vi.mock("../src/middleware/auth", () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 1, provider: "kakao" };
    next();
  },
}));

// Build App
const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/notifications", notificationRouter);
  return app;
};

describe("Notification Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/notifications/unread", () => {
    it("returns unread notifications when authenticated", async () => {
      const mockNotifications = [
        {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1,
          sushiId: 1,
          notificationType: "ANSWER",
          message: "새로운 답변이 도착했습니다.",
          isRead: false,
          redirectUrl: "/sushi/1",
          sushi: { title: "연어 스시" },
        },
        {
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1,
          sushiId: 2,
          notificationType: "LIKE",
          message: "답변이 좋아요를 받았습니다.",
          isRead: false,
          redirectUrl: "/sushi/2",
          sushi: { title: "문어 스시" },
        },
      ];
      notificationServiceMock.getUnreadNotifications.mockResolvedValue(
        mockNotifications,
      );

      const res = await request(buildApp()).get("/api/notifications/unread");

      expect(res.status).toBe(200);
      expect(res.body.notifications).toHaveLength(2);
      expect(res.body.notifications[0]).toHaveProperty("id", 1);
      expect(res.body.notifications[0]).toHaveProperty(
        "message",
        "새로운 답변이 도착했습니다.",
      );
      expect(res.body.notifications[0]).toHaveProperty("isRead", false);
      expect(res.body.notifications[1]).toHaveProperty("id", 2);
      expect(res.body.notifications[1]).toHaveProperty(
        "message",
        "답변이 좋아요를 받았습니다.",
      );
      expect(
        notificationServiceMock.getUnreadNotifications,
      ).toHaveBeenCalledWith(1);
    });

    it("returns empty array when no unread notifications", async () => {
      notificationServiceMock.getUnreadNotifications.mockResolvedValue([]);

      const res = await request(buildApp()).get("/api/notifications/unread");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ notifications: [] });
      expect(
        notificationServiceMock.getUnreadNotifications,
      ).toHaveBeenCalledWith(1);
    });

    it("returns 500 on service error", async () => {
      notificationServiceMock.getUnreadNotifications.mockRejectedValue(
        new Error("Service Error"),
      );

      const res = await request(buildApp()).get("/api/notifications/unread");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("알림 조회 중 오류가 발생했습니다.");
    });
  });

  describe("PATCH /api/notifications/:id/read", () => {
    it("marks notification as read successfully", async () => {
      const notificationId = 1;
      notificationServiceMock.markNotificationAsRead.mockResolvedValue({
        id: notificationId,
        isRead: true,
      });

      const res = await request(buildApp()).patch(
        `/api/notifications/${notificationId}/read`,
      );

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("알림을 읽음 처리했습니다.");
      expect(
        notificationServiceMock.markNotificationAsRead,
      ).toHaveBeenCalledWith(notificationId, 1);
    });

    it("returns 400 for invalid notification id", async () => {
      const res = await request(buildApp()).patch(
        "/api/notifications/invalid-id/read",
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("잘못된 알림 ID입니다.");
    });

    it("returns 404 when notification not found", async () => {
      const notificationId = 999;
      notificationServiceMock.markNotificationAsRead.mockRejectedValue(
        new Error("Notification not found"),
      );

      const res = await request(buildApp()).patch(
        `/api/notifications/${notificationId}/read`,
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(
        "알림을 찾을 수 없거나 접근 권한이 없습니다.",
      );
    });
  });
});
