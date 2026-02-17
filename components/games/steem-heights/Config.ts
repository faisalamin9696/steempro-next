export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;
export const INITIAL_WIDTH = 150;
export const BLOCK_HEIGHT = 20;
export const INITIAL_SPEED = 2;
export const MAX_SPEED = 10;
export const SPEED_INCREMENT_PERFECT = 0.02;
export const SPEED_INCREMENT_NORMAL = 0.05;
export const TIME_LIMIT = 10;
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

export interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  color: string;
  ability: string;
  perks: {
    slowFactor?: number;
    windResist?: boolean;
    extraLife?: boolean;
    bonusAltitude?: number;
  };
}

export const SKINS: Skin[] = [
  {
    id: "default",
    name: "Classic Climber",
    description: "The standard equipment for every mountaineer.",
    price: 0,
    color: "#f59e0b",
    ability: "None",
    perks: {},
  },
  {
    id: "glacier",
    name: "Glacier Plate",
    description: "Frozen tiles that dampen movement speed.",
    price: 10,
    color: "#38bdf8",
    ability: "15% Slower Speed",
    perks: { slowFactor: 0.85 },
  },
  {
    id: "steel",
    name: "Steel Core",
    description: "Heavy-duty tiles that ignore high-altitude winds.",
    price: 25,
    color: "#94a3b8",
    ability: "No Wind Drift",
    perks: { windResist: true },
  },
  {
    id: "phoenix",
    name: "Phoenix Wing",
    description: "Magical essence that saves you from one fatal fall.",
    price: 50,
    color: "#f87171",
    ability: "1 Extra Life",
    perks: { extraLife: true },
  },
  {
    id: "gold",
    name: "Midas Touch",
    description: "Pure gold tiles that increase altitude on perfect drops.",
    price: 100,
    color: "#fbbf24",
    ability: "+2m Perfect Bonus",
    perks: { bonusAltitude: 2 },
  },
];

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
