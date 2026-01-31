export interface GameStats {
  rewards?: string;
  players?: string;
  [key: string]: any;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  href: string;
  stats: GameStats;
  featured?: boolean;
  usesBlockchain?: boolean;
  developer?: {
    name: string;
    username?: string;
    website?: string;
  };
}
