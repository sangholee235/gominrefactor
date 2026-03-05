import apiClient from "../config/apiClient";
import type { ApiResponse } from "../types/api";

/**
 * 로그아웃
 * POST /api/auth/logout
 */
export const logout = async (): Promise<void> => {
  const response = await apiClient.post<ApiResponse<null>>("/auth/logout");

  if (!response.data.success) {
    throw new Error(response.data.error?.message || "로그아웃 실패");
  }
};

/**
 * 회원 탈퇴
 * DELETE /api/auth/withdraw
 */
export const withdraw = async (): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<null>>("/auth/withdraw");

  if (!response.data.success) {
    throw new Error(response.data.error?.message || "회원 탈퇴 실패");
  }
};

/**
 * 닉네임 변경
 * PUT /api/auth/nickname
 */
export const updateNickname = async (nickname: string) => {
  const response = await apiClient.put<ApiResponse<{ user: any }>>("/auth/nickname", { nickname });

  if (response.data.error) {
    throw new Error(response.data.error.message || "닉네임 변경 실패");
  }

  return response.data;
};
