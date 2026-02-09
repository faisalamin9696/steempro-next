import { supabase } from "./supabase";

export const getHeightsHighScores = async (
  season: number,
  limit: number = 100,
  offset: number = 0,
) => {
  const { data, error } = await supabase.rpc("get_heights_highest_score", {
    p_season: season,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error("getHeightsHighScores failed:", error);
    return [];
  }

  return data || [];
};

export const getHeightsSeasonalWinners = async () => {
  const { data } = await supabase
    .from("steempro_game_heights")
    .select("*")
    .eq("game", "steem-heights")
    .order("score", { ascending: false });

  if (!data) return [];

  // Map to store: Season -> { winner, totalClimbers, totalAscent, totalEntries }
  const seasonStats = new Map<
    number,
    {
      playerStats: Map<string, any>;
      totalAscent: number;
      totalEntries: number;
    }
  >();

  data.forEach((item: any) => {
    if (!seasonStats.has(item.season)) {
      seasonStats.set(item.season, {
        playerStats: new Map(),
        totalAscent: 0,
        totalEntries: 0,
      });
    }

    const stats = seasonStats.get(item.season)!;
    stats.totalEntries += 1;

    const playerMap = stats.playerStats;
    if (!playerMap.has(item.player)) {
      // First time seeing this player in this season.
      // Since data is sorted by score DESC, this is their best score.
      playerMap.set(item.player, { ...item, plays: 1 });
      stats.totalAscent += item.score || 0;
    } else {
      const pStats = playerMap.get(item.player);
      pStats.plays += 1;
      // Subsequent entries for the same player are <= max score, so we don't add them.
    }
  });

  const winners: any[] = [];
  seasonStats.forEach((stats, season) => {
    const sortedPlayers = Array.from(stats.playerStats.values()).sort(
      (a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.plays || 0) - (b.plays || 0);
      },
    );

    if (sortedPlayers.length > 0) {
      const totalClimbers = stats.playerStats.size;
      winners.push({
        ...sortedPlayers[0],
        totalClimbers,
        totalAscent: stats.totalAscent,
        totalEntries: stats.totalEntries,
        avgAltitude: totalClimbers > 0 ? stats.totalAscent / totalClimbers : 0,
      });
    }
  });

  return winners.sort((a, b) => b.season - a.season);
};

export const getHeightsUserHistory = async (username: string) => {
  const { data } = await supabase
    .from("steempro_game_heights")
    .select("*")
    .eq("player", username)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
};

export const getHeightsGameStats = async (season?: number) => {
  let query = supabase
    .from("steempro_game_heights")
    .select("player, created_at, score");

  if (season) {
    query = query.eq("season", season);
  }

  const { data: allPlays } = await query;

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
