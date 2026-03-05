import { useMutation } from "@tanstack/react-query";
import { logout, withdraw, updateNickname } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * 로그아웃 Hook
 */
export const useLogout = () => {
  const { logout: authLogout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      authLogout(); // Context 상태 초기화 및 토큰 제거
      navigate("/login"); // 로그인 페이지로 이동
    },
    onError: (error: Error) => {
      console.error("로그아웃 오류:", error.message);
      // 서버 에러와 상관없이 클라이언트 상태는 로그아웃 처리하는 것이 사용자 경험에 좋을 수 있음
      authLogout();
      navigate("/login");
    },
  });
};

/**
 * 회원 탈퇴 Hook
 */
export const useWithdraw = () => {
  const { logout: authLogout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: withdraw,
    onSuccess: () => {
      alert("회원 탈퇴가 완료되었습니다.");
      authLogout();
      navigate("/login");
    },
    onError: (error: Error) => {
      console.error("회원 탈퇴 오류:", error.message);
      alert(error.message || "회원 탈퇴 처리 중 오류가 발생했습니다.");
    },
  });
};

/**
 * 닉네임 변경 Hook
 */
export const useUpdateNickname = () => {
  const { updateNicknameInContext } = useAuth(); // AuthContext에 보강된 함수 사용

  return useMutation({
    mutationFn: (nickname: string) => updateNickname(nickname),
    onSuccess: (response: any) => {
      // API 응답 구조에 따라 user data 파싱
      const user = response?.data?.user || response?.user;
      if (user && user.nickname) {
        updateNicknameInContext(user.nickname);
      }
      alert("닉네임 변경 성공!");
    },
    onError: (error: Error) => {
      console.error("닉네임 변경 오류:", error.message);
      alert(error.message || "닉네임 변경 중 오류가 발생했습니다.");
    },
  });
};
