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

// Reward System Configuration
export const REWARD_MIN_ALTITUDE = 20;
export const REWARD_MIN_PLAYS = 5;
export const REWARD_RANK_CUTOFF = 50;
export const PODIUM_POOL_PERCENT = 0.4;
export const PERFORMANCE_POOL_PERCENT = 0.4;
export const AVERAGE_POOL_PERCENT = 0.2;

// Community Global Goal (Co-op) Configuration
export const COOP_BASE_REWARD = 50;
export const COOP_BASE_ALTITUDE = 500;
export const COOP_REWARD_STEP = 1000;
export const COOP_REWARD_INCREASE_PERCENT = 1.5;
export const COOP_MAX_REWARD = 500;

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
