export type SushiItem = {
  sushiId?: number;
  category?: number;
  sushiType?: number;
  remainingAnswers: number;
  expirationTime?: string;
  delay: number;
};

export interface SushiClickPayload {
  sushiId?: number;
  category?: number;
  sushiType?: number;
  remainingAnswers?: number;
  expirationTime?: string;
}
