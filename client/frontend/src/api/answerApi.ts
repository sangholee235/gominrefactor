import apiClient from "../config/apiClient";
import type { ApiResponse, Answer, CreateAnswerRequest } from "../types/api";
import type { MyAnswer } from "../types/mySushi";

/**
 * 답변 저장
 * POST /sushi/rail/:sushiId/answer
 */
export const saveAnswer = async (
  sushiId: number,
  input: CreateAnswerRequest,
): Promise<Answer> => {
  try {
    const response = await apiClient.post<ApiResponse<{ answer: Answer }>>(
      `/sushi/rail/${sushiId}/answer`,
      input,
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || "답변 저장 실패");
    }

    if (!response.data.data?.answer) {
      throw new Error("저장된 답변 데이터를 찾을 수 없습니다");
    }

    return response.data.data.answer;
  } catch (error: any) {
    // 서버에서 보낸 에러 메시지가 있다면 그걸 사용
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
};

/**
 * 내 답변 검색
 * GET /my-answers/search?q=:query&page=:page&pageSize=:pageSize
 */
export const searchMyAnswers = async (
  query: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ answers: MyAnswer[], hasMore: boolean }> => {
  try {
    const response = await apiClient.get<ApiResponse<{ answers: MyAnswer[], hasMore: boolean }>>(
      `/my-answers/search`,
      {
        params: {
          q: query,
          page,
          pageSize
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || "답변 검색 실패");
    }

    if (!response.data.data) {
      return { answers: [], hasMore: false };
    }

    return response.data.data;
  } catch (error: any) {
    // 서버에서 보낸 에러 메시지가 있다면 그걸 사용
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
};

/**
 * 답변 수정
 * PUT /my-answers/:answerId
 */
export const updateAnswer = async (
  answerId: number,
  content: string,
): Promise<Answer> => {
  try {
    const response = await apiClient.put<ApiResponse<Answer>>(
      `/my-answers/${answerId}`,
      { content } // 서비스에서 { content }로 받기로 함
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || "답변 수정 실패");
    }

    if (!response.data.data) {
      throw new Error("수정된 답변 데이터를 찾을 수 없습니다");
    }

    return response.data.data;
  } catch (error: any) {
    // 서버에서 보낸 에러 메시지가 있다면 그걸 사용
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
};

/**
 * 답변 삭제
 * DELETE /my-answers/:answerId
 */
export const deleteAnswer = async (answerId: number): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/my-answers/${answerId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || "답변 삭제 실패");
    }

    if (!response.data.data) {
      throw new Error("삭제 결과 데이터를 찾을 수 없습니다");
    }

    return response.data.data;
  } catch (error: any) {
    // 서버에서 보낸 에러 메시지가 있다면 그걸 사용
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
};
