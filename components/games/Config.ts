import { Game } from "./types";

export const OFFICIAL_GAMES: Game[] = [
  {
    id: "steem-heights",
    title: "Steem Heights",
    description:
      "Scale the skyline with unwavering focus. Align each block with surgical precision to reach record-breaking altitudes.",
    image: "/assets/games/steem-heights.png",
    category: "Precision",
    difficulty: "Medium",
    href: "/games/steem-heights",
    stats: {
      rewards: "Active",
    },
    featured: true,
    usesBlockchain: true,
  },
];

export const THIRD_PARTY_GAMES: Game[] = [
  {
    id: "steem-hop",
    title: "Steem Hop",
    description:
      "SteemHop is a thrilling, endless-runner game powered by the Steem Blockchain and built especially for the Steem community. In this game, you guide your character through busy roads, dodge speeding trains, and navigate unexpected obstacles. Every jump is a test of skill, timing, and courage. ",
    image:
      "https://steemitimages.com/640x0/https://cdn.steemitimages.com/DQmXt32CRjE3UBEw48QJtu17UkqryEGPKQ6HPXtqVuedCzd/STEEMHOP%20FINAL%20LOGO.png",
    category: "Arcade",
    difficulty: "Medium",
    href: "https://steemhop.org",
    stats: {
      rewards: "External",
    },
    usesBlockchain: false,
    developer: {
      name: "stmpak.wit",
      website: "https://steempro.com/@stmpak.wit",
    },
  },
];

export const CATEGORIES = [
  "All Games",
  "Precision",
  "Prediction",
  "Knowledge",
  "Strategy",
  "Arcade",
];
