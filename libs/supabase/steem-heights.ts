import { supabase } from "./supabase";

export const getHighScores = async (season: number, game: Games) => {
  const { data } = await supabase
    .from("steempro_game_leaderboard")
    .select("*")
    .eq("game", game)
    .eq("season", season)
    .order("score", { ascending: false });

  if (!data) return [];

  // Group by player and get the highest score
  const seen = new Set();
  return data
    .filter((item: any) => {
      if (!seen.has(item.player)) {
        seen.add(item.player);
        return true;
      }
      return false;
    })
    .slice(0, 10);
};

export const getSeasonalWinners = async (game: Games) => {
  const { data } = await supabase
    .from("steempro_game_leaderboard")
    .select("*")
    .eq("game", game)
    .order("score", { ascending: false });

  if (!data) return [];

  const winnersMap = new Map();
  data.forEach((item: any) => {
    if (!winnersMap.has(item.season)) {
      winnersMap.set(item.season, item);
    } else {
      const currentWinner = winnersMap.get(item.season);
      if (item.score > currentWinner.score) {
        winnersMap.set(item.season, item);
      }
    }
  });

  return Array.from(winnersMap.values()).sort((a, b) => b.season - a.season);
};

export const getUserHistory = async (username: string, game: Games) => {
  const { data } = await supabase
    .from("steempro_game_leaderboard")
    .select("*")
    .eq("game", game)
    .eq("player", username)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
};
