export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;
export const INITIAL_WIDTH = 150;
export const BLOCK_HEIGHT = 20;
export const INITIAL_SPEED = 2;
export const MAX_SPEED = 10;
export const SPEED_INCREMENT_PERFECT = 0.01;
export const SPEED_INCREMENT_NORMAL = 0.05;
export const TIME_LIMIT = 5;
export const SCORE_PER_BLOCK = 1;

export interface Block {
  x: number;
  y: number;
  width: number;
  color: string;
}

export interface HighScore {
  player: string;
  score: number;
  plays?: number;
  timestamp: number;
  created_at?: string;
}
