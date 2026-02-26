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

export const getHeightsSeasonalWinners = async (player?: string) => {
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
      userBest: number;
    }
  >();

  data.forEach((item: any) => {
    if (!seasonStats.has(item.season)) {
      seasonStats.set(item.season, {
        playerStats: new Map(),
        totalAscent: 0,
        totalEntries: 0,
        userBest: 0,
      });
    }

    const stats = seasonStats.get(item.season)!;
    stats.totalEntries += 1;

    const playerMap = stats.playerStats;
    const pStats = playerMap.get(item.player);
    if (!pStats) {
      // First time seeing this player in this season.
      // Since data is sorted by score DESC, this is their best score.
      playerMap.set(item.player, { ...item, plays: 1 });
      stats.totalAscent += item.score || 0;
    } else {
      pStats.plays += 1;
      // Subsequent entries for the same player are <= max score, so we don't add them.
    }

    if (player && item.player === player) {
      stats.userBest = Math.max(stats.userBest, item.score || 0);
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
        userBest: stats.userBest,
      });
    }
  });

  return winners.sort((a, b) => b.season - a.season);
};

export const getHeightsShopStats = async (player: string, season: number) => {
  const { data, error } = await supabase.rpc("get_heights_shop_stats", {
    p_player: player,
    p_season: season,
  });

  if (error || !data?.[0]) {
    if (error) console.error("getHeightsShopStats failed:", error);
    return null;
  }

  const raw = data[0];

  // Robustly handle powerup data (JSON object, stringified JSON, or plain name string)
  let powerup: any = null;
  if (raw.powerup) {
    if (typeof raw.powerup === "string") {
      try {
        powerup = JSON.parse(raw.powerup);
      } catch (e) {
        powerup = { name: raw.powerup };
      }
    } else {
      powerup = raw.powerup;
    }
  }

  // Robustly handle skins data (array or string)
  let skins = [];
  if (raw.skins) {
    if (typeof raw.skins === "string") {
      try {
        skins = JSON.parse(raw.skins);
      } catch (e) {
        skins = raw.skins.split(",").filter(Boolean);
      }
    } else {
      skins = Array.isArray(raw.skins) ? raw.skins : [];
    }
  }

  // Robustly handle current_day_actions (string array or JSON string)
  let actions = [];
  if (raw.current_day_actions) {
    if (typeof raw.current_day_actions === "string") {
      try {
        actions = JSON.parse(raw.current_day_actions);
      } catch (e) {
        actions = raw.current_day_actions.split(",").filter(Boolean);
      }
    } else {
      actions = Array.isArray(raw.current_day_actions)
        ? raw.current_day_actions
        : [];
    }
  }

  return {
    ...raw,
    powerup,
    skins,
    current_day_actions: actions,
  };
};

export const getHeightsDailyStats = async (player: string, season: number) => {
  const { data, error } = await supabase.rpc("get_heights_daily_stats", {
    p_player: player,
    p_season: season,
  });

  if (error || !data?.[0]) {
    if (error) console.error("getHeightsDailyStats failed:", error);
    return null;
  }

  return data[0];
};

export const getHeightsPlayerStats = async (player: string, season: number) => {
  const { data, error } = await supabase.rpc("get_heights_player_stats", {
    p_player: player,
    p_season: season,
  });

  if (error || !data?.[0]) {
    if (error) console.error("getHeightsPlayerStats failed:", error);
    return null;
  }

  return data[0];
};

export const getHeightsGameStats = async (season: number) => {
  if (!season) {
    return {
      totalParticipants: 0,
      activePlayers24h: 0,
      totalPlays: 0,
      totalAltitude: 0,
    };
  }

  const { data, error } = await supabase
    .from("steempro_game_heights")
    .select("player, score, created_at")
    .eq("game", "steem-heights")
    .eq("season", season);

  if (error || !data) {
    return {
      totalParticipants: 0,
      activePlayers24h: 0,
      totalPlays: 0,
      totalAltitude: 0,
    };
  }

  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  const stats = data.reduce(
    (acc, cur) => {
      acc.totalPlays += 1;
      acc.totalAltitude += cur.score || 0;
      acc.participants.add(cur.player);
      if (new Date(cur.created_at || "") > yesterday) {
        acc.active24h.add(cur.player);
      }
      return acc;
    },
    {
      totalPlays: 0,
      totalAltitude: 0,
      participants: new Set<string>(),
      active24h: new Set<string>(),
    },
  );

  return {
    totalParticipants: stats.participants.size,
    activePlayers24h: stats.active24h.size,
    totalPlays: stats.totalPlays,
    totalAltitude: stats.totalAltitude,
  };
};

export const getHeightsUserHistory = async (
  player: string,
  season: number,
  limit: number = 100,
) => {
  const { data, error } = await supabase
    .from("steempro_game_heights")
    .select("*")
    .eq("player", player)
    .eq("season", season)
    .eq("game", "steem-heights")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getHeightsUserHistory failed:", error);
    return [];
  }

  return data || [];
};

export const checkActionDuplicate = async (
  player: string,
  action: string,
  season: number,
  supabaseClient = supabase,
) => {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabaseClient
    .from("steempro_game_heights_shop")
    .select("id")
    .eq("player", player)
    .eq("action", action)
    .eq("season", season)
    .gte("created_at", startOfDay.toISOString())
    .limit(1);

  if (error) return false;
  return (data || []).length > 0;
};
