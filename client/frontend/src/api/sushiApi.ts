import apiClient from "../config/apiClient";
import type { ApiResponse, Sushi, CreateSushiRequest } from "../types/api";

/**
 * 랜덤 스시 레일 조회
 * GET /sushi/rail?size=N
 */
export const fetchRandomSushiRail = async (
  size: number = 15,
): Promise<Sushi[]> => {
  const response = await apiClient.get<ApiResponse<{ sushi: Sushi[] }>>(
    "/sushi/rail",
    {
      params: { size },
    },
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || "스시 레일 조회 실패");
  }

  return response.data.data?.sushi || [];
};

/**
 * 특정 스시 상세 조회
 * GET /sushi/rail/:sushiId
 */
export const fetchRailSushiDetail = async (sushiId: number): Promise<Sushi> => {
  const response = await apiClient.get<ApiResponse<{ sushi: Sushi }>>(
    `/sushi/rail/${sushiId}`,
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || "스시 상세 조회 실패");
  }

  if (!response.data.data?.sushi) {
    throw new Error("스시 데이터를 찾을 수 없습니다");
  }

  return response.data.data.sushi;
};

/**
 * 스시(고민) 생성
 * POST /sushi
 */
export const createSushi = async (
  input: CreateSushiRequest,
): Promise<Sushi> => {
  const response = await apiClient.post<ApiResponse<{ sushi: Sushi }>>(
    "/sushi",
    input,
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || "스시 생성 실패");
  }

  if (!response.data.data?.sushi) {
    throw new Error("생성된 스시 데이터를 찾을 수 없습니다");
  }

  return response.data.data.sushi;
};
