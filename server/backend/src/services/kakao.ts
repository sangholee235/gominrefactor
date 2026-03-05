import axios from 'axios';
import { env } from '../config/env';

interface KakaoTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface KakaoProfile {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  if (!env.kakaoClientId || !env.kakaoRedirectUri) {
    throw new Error('카카오 설정이 누락되었습니다.');
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: env.kakaoClientId,
    redirect_uri: env.kakaoRedirectUri,
    code,
  });

  if (env.kakaoClientSecret) {
    params.append('client_secret', env.kakaoClientSecret);
  }

  const tokenResponse = await axios.post<KakaoTokenResponse>(
    'https://kauth.kakao.com/oauth/token',
    params.toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  return tokenResponse.data.access_token;
};

export const fetchKakaoProfile = async (
  accessToken: string
): Promise<KakaoProfile> => {
  const profileResponse = await axios.get<KakaoProfile>(
    'https://kapi.kakao.com/v2/user/me',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return profileResponse.data;
};
