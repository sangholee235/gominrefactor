import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getMe } from "../api/api";

interface AuthContextType {
  isLoggedIn: boolean;
  user: any | null; // 사용자 정보 상태
  login: (data: { accessToken: string; user: any }) => void;
  logout: () => void;
  updateNicknameInContext: (nickname: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      // 토큰이 있으면 사용자 정보를 가져와서 로그인 상태를 복원합니다.
      getMe()
        .then((data) => {
          setUser(data.user);
          setIsLoggedIn(true);
        })
        .catch(() => {
          // 토큰이 유효하지 않은 경우 로그아웃 처리
          localStorage.removeItem("userToken");
        });
    }
  }, []);

  const login = (data: { accessToken: string; user: any }) => {
    localStorage.setItem("userToken", data.accessToken);
    setUser(data.user);
    setIsLoggedIn(true);
  };

  const logout = () => {
    // 모든 로컬스토리지 데이터 정리
    localStorage.removeItem("userToken");
    localStorage.removeItem("devUserId");
    sessionStorage.removeItem("redirectUrl");
    
    // 상태 초기화
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateNicknameInContext = (nickname: string) => {
    if (user) {
      setUser({ ...user, nickname });
    }
  };

  // userToken은 이제 내부적으로만 관리되므로 value에서 제외합니다.
  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateNicknameInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
