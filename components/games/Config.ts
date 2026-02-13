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

  {
    id: "cur8-games",
    title: "Cur8 Games",
    description:
      "Cur8 Games is a gaming platform built on Steem where players can enjoy arcade, card and casual games while earning rewards. Play, complete quests, level up your profile and compete in the weekly leaderboard to win STEEM prizes!",
    image:
      "https://steemitimages.com/640x0/https://cdn.steemitimages.com/DQmfE69wWrabJQwBXZ75RR8pZqzPt9h8M75GJ98MoSNNJjA/image.png",
    category: "Platform",
    difficulty: "Medium",
    href: "https://games.cur8.fun",
    stats: {
      rewards: "External",
    },
    usesBlockchain: false,
    developer: {
      name: "cur8",
      website: "https://steempro.com/@cur8",
    },
  },

  {
    id: "steem-hari-raid",
    title: "Steem HARI-RAID",
    description:
      "Summon elemental battle cards, raid weekly boss monsters with other players, and earn real STEEM rewards in this Tap2Earn crypto game.",
    image:
      "https://steemitimages.com/640x0/https://cdn.steemitimages.com/DQmPCwz9KvoHNnUsA3KSkA2cpMzQqJrrU3nAoypQp35QNsQ/main_4000.jpg",
    category: "Strategy",
    difficulty: "Easy",
    href: "https://hari-raid.h4lab.com",
    usesBlockchain: true,
    stats: { rewards: "External" },
    developer: {
      name: "H4LAB",
      website: "http://h4lab.com/",
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
