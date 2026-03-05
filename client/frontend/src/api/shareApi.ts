import apiClient from "../config/apiClient";
import type { ApiResponse, Sushi } from "../types/api";

type CreateShareTokenResponse = {
  token: string;
};

type GetSushiByShareTokenResponse = {
  sushi: Sushi;
};

/**
 * 공유 토큰 생성
 * POST /api/share
 */
export const createShareToken = async (
  sushiId: number,
): Promise<CreateShareTokenResponse> => {
  const response = await apiClient.post<ApiResponse<CreateShareTokenResponse>>(
    "/share",
    { sushiId },
  );

  if (!response.data.success) {
    throw new Error(response.data.error?.message || "공유 토큰 생성 실패");
  }

  if (!response.data.data) {
    throw new Error("데이터가 없습니다.");
  }

  return response.data.data;
};

/**
 * 공유 토큰으로 스시 조회
 * GET /api/share/:token
 */
export const getSushiByShareToken = async (token: string): Promise<Sushi> => {
  const response = await apiClient.get<ApiResponse<GetSushiByShareTokenResponse>>(
    `/share/${token}`,
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error?.message || "공유 정보를 불러오는데 실패했습니다.",
    );
  }

  if (!response.data.data?.sushi) {
    throw new Error("스시 데이터를 찾을 수 없습니다.");
  }

  return response.data.data.sushi;
};
