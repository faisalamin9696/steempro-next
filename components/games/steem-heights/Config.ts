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
    description: "Frozen tiles that dampen movement speed. (150 Energy)",
    price: 150,
    color: "#38bdf8",
    ability: "15% Slower Speed",
    perks: { slowFactor: 0.85 },
  },
  {
    id: "steel",
    name: "Steel Core",
    description:
      "Heavy-duty tiles that ignore high-altitude winds. (300 Energy)",
    price: 300,
    color: "#94a3b8",
    ability: "No Wind Drift",
    perks: { windResist: true },
  },
  {
    id: "phoenix",
    name: "Phoenix Wing",
    description:
      "Magical essence that saves you from one fatal fall. (500 Energy)",
    price: 500,
    color: "#f87171",
    ability: "1 Extra Life",
    perks: { extraLife: true },
  },
  {
    id: "gold",
    name: "Midas Touch",
    description:
      "Pure gold tiles that increase altitude on perfect drops. (1000 Energy)",
    price: 1000,
    color: "#fbbf24",
    ability: "+2m Perfect Bonus",
    perks: { bonusAltitude: 2 },
  },
];

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  type: "ascent" | "combos" | "plays";
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "daily_ascent",
    title: "Sky Walker",
    description: "Climb total of 500m today",
    target: 500,
    reward: 50,
    type: "ascent",
  },
  {
    id: "daily_ascent_pro",
    title: "Apex Predator",
    description: "Climb total of 1000m today",
    target: 1000,
    reward: 100,
    type: "ascent",
  },

  {
    id: "daily_combos",
    title: "Precision Master",
    description: "Land total 10 combos in a day",
    target: 10,
    reward: 75,
    type: "combos",
  },
  {
    id: "daily_plays",
    title: "Persistent Climber",
    description: "Complete 6 games today",
    target: 6,
    reward: 30,
    type: "plays",
  },
];

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: "wind_shield" | "slow_motion" | "extra_gear";
  perks: {
    windResist?: boolean;
    slowFactor?: number;
    extraLife?: boolean;
  };
  conflicts?: string[];
}

export const POWERUP_CONFLICT_MESSAGE = (skinName: string) =>
  `This ability is already active via your ${skinName} skin.`;

export const POWER_UPS: PowerUp[] = [
  {
    id: "wind_shield",
    name: "Wind Shield",
    description: "Ignore all wind drift for exactly one game.",
    cost: 40,
    type: "wind_shield",
    perks: { windResist: true },
    conflicts: ["steel"],
  },
  {
    id: "slow_motion",
    name: "Slow Motion",
    description: "Movement speed is reduced by 20% for one game.",
    cost: 50,
    type: "slow_motion",
    perks: { slowFactor: 0.8 },
    conflicts: ["glacier"],
  },
  {
    id: "extra_gear",
    name: "Extra Gear",
    description: "Start your next game with one additional life.",
    cost: 60,
    type: "extra_gear",
    perks: { extraLife: true },
    conflicts: ["phoenix"],
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
  tid?: string;
  timestamp: number;
  created_at?: string;
}

export interface GameStats {
  totalParticipants: number;
  activePlayers24h: number;
  totalPlays: number;
  totalAltitude: number;
}
