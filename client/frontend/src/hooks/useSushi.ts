import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  fetchRandomSushiRail,
  fetchRailSushiDetail,
  createSushi,
} from "../api/sushiApi";
import { updateMySushi, deleteMySushi } from "../api/mySushiApi"; 
import type { Sushi, CreateSushiRequest } from "../types/api";

export const sushiQueryKeys = {
  all: ["sushi"] as const,
  rail: () => [...sushiQueryKeys.all, "rail"] as const,
  detail: (sushiId: number) =>
    [...sushiQueryKeys.all, "detail", sushiId] as const,
  my: () => [...sushiQueryKeys.all, "my"] as const,
};

/**
 * 랜덤 스시 레일 조회
 */
export const useFetchRandomSushiRail = (
  size: number = 15,
  enabled: boolean = true,
): UseQueryResult<Sushi[], Error> => {
  return useQuery({
    queryKey: [...sushiQueryKeys.rail(), size],
    queryFn: () => fetchRandomSushiRail(size),
    enabled,
    staleTime: 1000 * 60 * 2, // 2분
  });
};

/**
 * 특정 스시 상세 조회
 */
export const useFetchRailSushiDetail = (
  sushiId: number | null,
  enabled: boolean = true,
): UseQueryResult<Sushi, Error> => {
  return useQuery({
    queryKey: sushiQueryKeys.detail(sushiId || 0),
    queryFn: () => fetchRailSushiDetail(sushiId!),
    enabled: enabled && sushiId !== null,
  });
};

/**
 * 스시(고민) 생성
 */
export const useCreateSushi = (): UseMutationResult<
  Sushi,
  Error,
  CreateSushiRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSushi,
    onSuccess: (newSushi) => {
      queryClient.invalidateQueries({ queryKey: sushiQueryKeys.rail() });
      queryClient.invalidateQueries({ queryKey: sushiQueryKeys.my() });

      if (newSushi.id != null) {
        queryClient.setQueryData(sushiQueryKeys.detail(newSushi.id), newSushi);
      }
    },
  });
};

/**
 * 스시(고민) 수정 훅
 */
export const useUpdateSushi = (): UseMutationResult<
  Sushi,
  Error,
  { sushiId: number; title?: string; content?: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sushiId, ...updateData }) => updateMySushi(sushiId, updateData),
    onSuccess: (updatedSushi) => {
      queryClient.setQueryData(sushiQueryKeys.detail(updatedSushi.id), updatedSushi);
      queryClient.invalidateQueries({ queryKey: sushiQueryKeys.my() });
      queryClient.invalidateQueries({ queryKey: sushiQueryKeys.rail() });
    },
  });
};

/**
 * 스시(고민) 삭제 훅
 * 리턴 타입을 any로 조정하여 API 응답(message 등)과의 충돌을 방지했습니다.
 */
export const useDeleteSushi = (): UseMutationResult<
  any, 
  Error,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sushiId: number) => deleteMySushi(sushiId),
    onSuccess: (_, sushiId) => {
      // 해당 스시의 상세 정보 캐시 삭제
      queryClient.removeQueries({ queryKey: sushiQueryKeys.detail(sushiId) });
      // 리스트 갱신
      queryClient.invalidateQueries({ queryKey: sushiQueryKeys.my() });
      queryClient.invalidateQueries({ queryKey: sushiQueryKeys.rail() });
    },
  });
};