export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;
export const INITIAL_WIDTH = 150;
export const BLOCK_HEIGHT = 20;
export const INITIAL_SPEED = 2;
export const MAX_SPEED = 10;
export const SPEED_INCREMENT_PERFECT = 0.02;
export const SPEED_INCREMENT_NORMAL = 0.05;
export const TIME_LIMIT = 5;
export const SCORE_PER_BLOCK = 1;
export const BONUS_SCORE = 5;
export const BONUS_HEIGHT_INCREMENT = 10;

export interface Block {
  x: number;
  y: number;
  width: number;
  color: string;
  grow?: boolean;
}

export interface Debris {
  x: number;
  y: number;
  width: number;
  color: string;
  velocity: number;
  rotation: number;
}

export interface HighScore {
  player: string;
  score: number;
  plays?: number;
  combos?: number;
  timestamp: number;
  created_at?: string;
}

export interface GameStats {
  totalParticipants: number;
  activePlayers24h: number;
  totalPlays: number;
  totalAltitude: number;
}
