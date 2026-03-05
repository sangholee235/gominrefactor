import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getUserById, upsertKakaoUser } from "../src/services/userService";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user if exists", async () => {
      const mockUser = {
        id: 1,
        provider: "kakao",
        providerId: "12345",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserById(1);

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          provider: true,
          providerId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it("should return null if user does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await getUserById(999);

      expect(result).toBeNull();
    });
  });

  describe("upsertKakaoUser", () => {
    const kakaoId = "kakao-12345";
    const now = new Date("2026-01-01T00:00:00Z");

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should create new user if not exists", async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      const createdUser = {
        id: 1,
        provider: "kakao",
        providerId: kakaoId,
        createdAt: now,
        updatedAt: now,
      };
      prismaMock.user.create.mockResolvedValue(createdUser);

      const result = await upsertKakaoUser(kakaoId);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { provider: "kakao", providerId: kakaoId },
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          provider: "kakao",
          providerId: kakaoId,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      });
      expect(result).toEqual(createdUser);
    });

    it("should update existing user if exists", async () => {
      const existingUser = {
        id: 1,
        provider: "kakao",
        providerId: kakaoId,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };
      prismaMock.user.findFirst.mockResolvedValue(existingUser);

      const updatedUser = { ...existingUser, updatedAt: now };
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await upsertKakaoUser(kakaoId);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { provider: "kakao", providerId: kakaoId },
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: { updatedAt: now, deletedAt: null },
      });
      expect(result).toEqual(updatedUser);
    });
  });
});
