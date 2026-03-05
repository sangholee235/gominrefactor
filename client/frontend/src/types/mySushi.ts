// 내 스시(My Sushi) 관련 타입 정의

export interface MySushi {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  expireTime: string;
  maxAnswers: number;
  remainingAnswers: number;
  isClosed: boolean;
  categoryId: number | null;
  sushiTypeId: number | null;
}

export interface AnswerDetail {
  id: number;
  content: string;
  createdAt: string;
}

export interface MySushiDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  expireTime: string;
  isClosed: boolean;
  category: number;
  answers: AnswerDetail[];
}

export interface MyAnswer {
  id: number;
  content: string;
  createdAt: string;
  sushiId: number;
  sushi: {
    title: string;
    categoryId: number | null;
    sushiTypeId: number | null;
  };
}
