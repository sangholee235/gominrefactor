import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../config/queryClient";

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * React Query Provider를 설정하는 최상위 래퍼 컴포넌트
 * main.tsx에서 사용해야 합니다.
 */
function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default AppProvider;
