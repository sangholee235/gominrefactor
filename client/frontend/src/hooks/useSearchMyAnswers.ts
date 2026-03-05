import {
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { searchMyAnswers } from "../api/answerApi";
import type { MyAnswer } from "../types/mySushi";

// Query Keys
export const searchMyAnswersQueryKeys = {
  all: ["searchMyAnswers"] as const,
  byQuery: (query: string, page: number, pageSize: number) =>
    [...searchMyAnswersQueryKeys.all, query, page, pageSize] as const,
};

interface SearchMyAnswersResult {
  answers: MyAnswer[];
  hasMore: boolean;
}

/**
 * 내 답변 검색
 */
export const useSearchMyAnswers = (
  query: string,
  page: number = 1,
  pageSize: number = 10
): UseQueryResult<SearchMyAnswersResult, Error> => {
  return useQuery({
    queryKey: searchMyAnswersQueryKeys.byQuery(query, page, pageSize),
    queryFn: () => searchMyAnswers(query, page, pageSize),
    enabled: !!query && query.trim().length > 0, // 검색어가 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분 동안 fresh 상태 유지
  });
};