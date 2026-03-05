import apiClient from '../config/apiClient';
import type { MySushi, MySushiDetail, MyAnswer } from '../types/mySushi';
import type { ApiResponse } from '../types/api';

/**
 * 내 스시 목록 조회 및 검색
 */
export const fetchMySushiList = async (searchTerm?: string, page: number = 1, pageSize: number = 20): Promise<{sushi: MySushi[], hasMore: boolean}> => {
  let response;
  if (searchTerm && searchTerm.trim()) {
    response = await apiClient.get<ApiResponse<{ sushi: MySushi[], content?: MySushi[], hasMore?: boolean }>>(`/sushi/my/search`, {
      params: {
        q: searchTerm,
        page,
        pageSize
      }
    });
  } else {
    response = await apiClient.get<ApiResponse<{ sushi: MySushi[], content?: MySushi[], hasMore?: boolean }>>('/sushi/my', {
      params: {
        page,
        pageSize
      }
    });
  } 

  // 서버 응답 구조 대응: response.data.data.sushi 또는 response.data.data.content
  const data = response.data.data;
  if (!data) return {sushi: [], hasMore: false};
  
  const sushiList = data.sushi || data.content || [];
  const hasMore = data.hasMore ?? sushiList.length === pageSize;
  
  return {sushi: sushiList, hasMore};
};

/**
 * 내 스시 상세 조회
 */
export const fetchMySushiDetail = async (sushiId: number): Promise<MySushiDetail> => {
  const response = await apiClient.get<ApiResponse<{ sushi: MySushiDetail }>>(`/sushi/my/${sushiId}`);
  
  if (!response.data.success || !response.data.data?.sushi) {
      throw new Error("고민 정보를 불러오는 데 실패했습니다.");
  }
  
  return response.data.data.sushi;
};

/**
 * 내가 쓴 답변 목록 조회
 */
export const fetchMyAnswerList = async (): Promise<MyAnswer[]> => {
  const response = await apiClient.get<ApiResponse<MyAnswer[]>>("/my-answers");
  
  if (!response.data.success || !response.data.data) {
    throw new Error("답변 목록을 불러오는 데 실패했습니다.");
  }

  return response.data.data;
};

/**
 * 내 답변 검색
 */
export const searchMyAnswers = async (searchTerm?: string, page: number = 1, pageSize: number = 20): Promise<{answers: MyAnswer[], hasMore: boolean}> => {
  let response;
  if (searchTerm && searchTerm.trim()) {
    response = await apiClient.get<ApiResponse<{ answers: MyAnswer[], hasMore?: boolean }>>(`/my-answers/search`, {
      params: {
        q: searchTerm,
        page,
        pageSize
      }
    });
  } else {
    response = await apiClient.get<ApiResponse<{ answers: MyAnswer[], hasMore?: boolean }>>('/my-answers', {
      params: {
        page,
        pageSize
      }
    });
  } 

  const data = response.data.data;
  if (!data) return {answers: [], hasMore: false};
  
  const answerList = data.answers || [];
  const hasMore = data.hasMore ?? answerList.length === pageSize;
  
  return {answers: answerList, hasMore};
};

/**
 * 내 스시 삭제
 */
export const deleteMySushi = async (sushiId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/sushi/my/${sushiId}`);
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || "스시 삭제 중 오류가 발생했습니다.");
  }

  return response.data.data;
};

/**
 * 내 고민 수정 API
 * PATCH /sushi/my/:sushiId
 */
export const updateMySushi = async (
  sushiId: number,
  updateData: { title?: string; content?: string }
): Promise<any> => {
  try {
    const response = await apiClient.patch<ApiResponse<{ sushi: any }>>(
      `/sushi/my/${sushiId}`,
      updateData
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || "고민 수정 실패");
    }

    return response.data.data?.sushi;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
};
