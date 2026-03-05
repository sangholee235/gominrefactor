import { prisma } from "../lib/prisma";

/**
 * 사용자의 초밥 노출 기록을 생성하거나 업데이트합니다.
 * @param userId 사용자 ID
 * @param sushiId 스시 ID
 */
export const recordSushiExposure = async (userId: number, sushiId: number) => {
  try {
    return await prisma.sushiExposure.upsert({
      where: { 
        userId_sushiId: { userId, sushiId } 
      },
      update: { timestamp: new Date() },
      create: { userId, sushiId, timestamp: new Date() }
    });
  } catch (error) {
    console.error("Sushi exposure recording failed:", error);
    // 노출 기록 실패해도 에러를 던지지 않고 무시 (비즈니스 로직에 치명적이지 않음)
  }
};

/**
 * 사용자가 이미 노출된 적 있는 초밥 ID 목록을 조회합니다.
 * @param userId 사용자 ID
 * @returns 이미 노출된 초밥 ID 배열
 */
export const getExposedSushiIds = async (userId: number): Promise<number[]> => {
  try {
    const exposures = await prisma.sushiExposure.findMany({
      where: { userId },
      select: { sushiId: true }
    });
    
    return exposures.map(exposure => exposure.sushiId);
  } catch (error) {
    console.error("Failed to get exposed sushi IDs:", error);
    return [];
  }
};

/**
 * 특정 사용자의 특정 초밥 노출 기록을 조회합니다.
 * @param userId 사용자 ID
 * @param sushiId 스시 ID
 * @returns 노출 기록 또는 null
 */
export const getSushiExposure = async (userId: number, sushiId: number) => {
  try {
    return await prisma.sushiExposure.findUnique({
      where: { userId_sushiId: { userId, sushiId } }
    });
  } catch (error) {
    console.error("Failed to get sushi exposure:", error);
    return null;
  }
};