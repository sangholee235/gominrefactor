// ============ API 응답 형식 ============
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { message: string } | null;
}

// ============ Sushi (고민) ============
export interface Sushi {
  // 기존 상세 조회 / CRUD 용
  id?: number;

  // 레일 API 용 (추가)
  sushiId?: number;

  userId?: number;
  title?: string;
  content?: string;

  categoryId?: number | null;
  sushiTypeId?: number | null;

  // 레일에서 직접 쓰는 값
  category?: number;
  sushiType?: number;

  maxAnswers?: number;
  remainingAnswers?: number;

  isClosed?: boolean;

  expireTime?: string;
  expirationTime?: string;

  createdAt?: string;
  updatedAt?: string;

  delay?: number;

  answer?: Answer[];
}

export interface CreateSushiRequest {
  title: string;
  content: string;
  expireTime: string; // ISO 8601 형식
  maxAnswers: number;
  categoryId?: number | null;
  sushiTypeId?: number | null;
}

// ============ Answer (답변) ============
export interface Answer {
  id: number;
  sushiId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnswerRequest {
  content: string;
}

// ============ 페이지네이션 ============
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ============ 사용자 정보 ============
export interface User {
  id: number;
  email: string;
  nickname: string;
  createdAt: string;
}
