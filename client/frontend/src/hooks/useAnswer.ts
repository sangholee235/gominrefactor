import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { saveAnswer } from "../api/answerApi";
import type { Answer, CreateAnswerRequest } from "../types/api";
import { sushiQueryKeys } from "./useSushi";

// Query Keys
export const answerQueryKeys = {
  all: ["answer"] as const,
  bySushi: (sushiId: number) =>
    [...answerQueryKeys.all, "sushi", sushiId] as const,
};

/**
 * 답변 저장
 */
export const useSaveAnswer = (
  sushiId: number,
): UseMutationResult<Answer, Error, CreateAnswerRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAnswerRequest) => saveAnswer(sushiId, input),
    onSuccess: () => {
      // 해당 스시 상세 정보 무효화
      queryClient.invalidateQueries({
        queryKey: sushiQueryKeys.detail(sushiId),
      });
      // 답변 목록 무효화
      queryClient.invalidateQueries({
        queryKey: answerQueryKeys.bySushi(sushiId),
      });
      // 레일 데이터 무효화 (서버 데이터로 동기화)
      queryClient.invalidateQueries({
        queryKey: sushiQueryKeys.rail(),
      });
    },
    onError: (error) => {
      console.error("답변 저장 오류:", error);
    },
  });
};
