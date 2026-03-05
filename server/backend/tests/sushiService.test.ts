import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRandomSushiRail } from "../src/services/sushiService";

const prismaMock = vi.hoisted(() => ({
  sushi: {
    findMany: vi.fn(),
  },
}));

vi.mock("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("getRandomSushiRail", () => {
  beforeEach(() => {
    prismaMock.sushi.findMany.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty array when no available sushi", async () => {
    prismaMock.sushi.findMany.mockResolvedValueOnce([]);

    const result = await getRandomSushiRail(15);

    expect(result).toEqual([]);
    expect(prismaMock.sushi.findMany).toHaveBeenCalledTimes(1);
  });

  it("maps selected sushi to response shape", async () => {
    prismaMock.sushi.findMany
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }])
      .mockResolvedValueOnce([
        {
          id: 3,
          categoryId: 30,
          sushiTypeId: 300,
          remainingAnswers: 4,
          expireTime: new Date("2024-01-01T00:00:00Z"),
        },
        {
          id: 2,
          categoryId: 20,
          sushiTypeId: 200,
          remainingAnswers: 2,
          expireTime: new Date("2024-02-01T00:00:00Z"),
        },
      ]);

    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = await getRandomSushiRail(2);

    expect(result).toEqual([
      {
        sushiId: 2,
        category: 20,
        sushiType: 200,
        remainingAnswers: 2,
        expirationTime: "2024-02-01T00:00:00.000Z",
      },
      {
        sushiId: 3,
        category: 30,
        sushiType: 300,
        remainingAnswers: 4,
        expirationTime: "2024-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("filters out sushi created by the user and answered by the user", async () => {
    prismaMock.sushi.findMany.mockResolvedValueOnce([{ id: 10 }, { id: 20 }]);
    prismaMock.sushi.findMany.mockResolvedValueOnce([
      {
        id: 10,
        categoryId: 1,
        sushiTypeId: 1,
        remainingAnswers: 5,
        expireTime: new Date("2025-12-31"),
      },
    ]);

    const userId = 123;
    await getRandomSushiRail(10, userId);

    // Verify the first findMany call (the ID fetching one) has correct filters
    expect(prismaMock.sushi.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        isClosed: false,
        expireTime: { gt: expect.any(Date) },
        remainingAnswers: { gt: 0 },
        userId: { not: userId },
        answer: { none: { userId: userId } },
      },
      select: { id: true },
    });
  });

  it("excludes sushi expiring within 10 minutes", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-26T00:00:00Z"));

    prismaMock.sushi.findMany.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    prismaMock.sushi.findMany.mockResolvedValueOnce([
      {
        id: 1,
        categoryId: 10,
        sushiTypeId: 100,
        remainingAnswers: 1,
        expireTime: new Date("2026-01-26T00:05:00Z"),
      },
      {
        id: 2,
        categoryId: 20,
        sushiTypeId: 200,
        remainingAnswers: 1,
        expireTime: new Date("2026-01-26T00:30:00Z"),
      },
    ]);

    await getRandomSushiRail(2);

    expect(prismaMock.sushi.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        isClosed: false,
        expireTime: { gt: new Date("2026-01-26T00:10:00Z") },
        remainingAnswers: { gt: 0 },
      },
      select: { id: true },
    });
    vi.useRealTimers();
  });
});
