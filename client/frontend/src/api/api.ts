import axios from "axios";
import type { AxiosInstance } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 로컬 스토리지에서 토큰을 가져와 모든 요청 헤더에 추가합니다.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const devUserId = localStorage.getItem("devUserId");
    if (devUserId) {
      config.headers["x-dev-user-id"] = devUserId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * 카카오 인가 코드를 백엔드에 보내고 JWT 토큰을 받습니다.
 * @param code 카카오 리다이렉션을 통해 얻은 인가 코드
 * @returns { accessToken: string, refreshToken: string, user: any }
 */
export const loginWithKakao = async (code: string) => {
  const response = await apiClient.post("/auth/kakao", { code });
  return response.data;
};

/**
 * 현재 로그인된 사용자 정보를 가져옵니다.
 * @returns { user: any }
 */
export const getMe = async () => {
  const response = await apiClient.get("/me");
  return response.data;
};

export default apiClient;
