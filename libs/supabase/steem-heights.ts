import { supabase } from "./supabase";

export const getHighScores = async (season: number, game: Games) => {
  const { data } = await supabase
    .from("steempro_game_leaderboard")
    .select("*")
    .eq("game", game)
    .eq("season", season)
    .order("score", { ascending: false });

  if (!data) return [];

  // Group by player, get the highest score and count plays
  const playerStats = new Map();
  data.forEach((item: any) => {
    if (!playerStats.has(item.player)) {
      playerStats.set(item.player, { ...item, plays: 1 });
    } else {
      const stats = playerStats.get(item.player);
      stats.plays += 1;
      // Since data is ordered by score descending, the first one we saw is the highest.
      // But we can double check just in case.
      if (item.score > stats.score) {
        stats.score = item.score;
      }
    }
  });

  return Array.from(playerStats.values()).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (a.plays || 0) - (b.plays || 0);
  });
};

export const getSeasonalWinners = async (game: Games) => {
  const { data } = await supabase
    .from("steempro_game_leaderboard")
    .select("*")
    .eq("game", game)
    .order("score", { ascending: false });

  if (!data) return [];

  // Map to store: Season -> Map(Player -> { maxScore, plays, ...item })
  const seasonalPlayerStats = new Map<number, Map<string, any>>();

  data.forEach((item: any) => {
    if (!seasonalPlayerStats.has(item.season)) {
      seasonalPlayerStats.set(item.season, new Map());
    }

    const playerMap = seasonalPlayerStats.get(item.season)!;
    if (!playerMap.has(item.player)) {
      playerMap.set(item.player, { ...item, plays: 1 });
    } else {
      const stats = playerMap.get(item.player);
      stats.plays += 1;
      if (item.score > stats.score) {
        stats.score = item.score;
      }
    }
  });

  // Now for each season, pick the best player based on score (desc) then plays (asc)
  const winners: any[] = [];
  seasonalPlayerStats.forEach((playerMap, season) => {
    const sortedPlayers = Array.from(playerMap.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.plays || 0) - (b.plays || 0);
    });
    if (sortedPlayers.length > 0) {
      winners.push(sortedPlayers[0]);
    }
  });

  return winners.sort((a, b) => b.season - a.season);
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

export const getGameStats = async (game: Games) => {
  const { data: allPlays } = await supabase
    .from("steempro_game_leaderboard")
    .select("player, created_at, score")
    .eq("game", game);

  if (!allPlays)
    return {
      totalParticipants: 0,
      activePlayers24h: 0,
      totalPlays: 0,
      totalAltitude: 0,
    };

  const uniquePlayers = new Set(allPlays.map((p) => p.player));
  const yesterday = Date.now() - 24 * 60 * 60 * 1000;
  const active24h = new Set(
    allPlays
      .filter((p) => new Date(p.created_at).getTime() > yesterday)
      .map((p) => p.player),
  );

  const totalAltitude = allPlays.reduce(
    (acc, curr) => acc + (curr.score || 0),
    0,
  );

  return {
    totalParticipants: uniquePlayers.size,
    activePlayers24h: active24h.size,
    totalPlays: allPlays.length,
    totalAltitude,
  };
};
