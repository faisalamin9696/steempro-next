import { supabase } from "./supabase";

export const getUserGameStats = async (
  username: string,
  season: number = 1,
) => {
  const { data } = await supabase
    .from("steempro_game_heights_shop")
    .select("*")
    .eq("player", username)
    .eq("season", season)
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    energy: data.energy || 0,
    skins:
      typeof data.skins === "string"
        ? JSON.parse(data.skins)
        : data.skins || [],
    powerup:
      typeof data.powerup === "string"
        ? JSON.parse(data.powerup)
        : data.powerup || "",
    equipedSkin: data.equiped || "default",
  };
};

export const getHeightsUserDailyClaims = async (username: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("steempro_game_heights_shop")
    .select("action")
    .eq("player", username)
    .gte("timestamp", today.toISOString())
    .ilike("action", "Claimed challenge:%");

  if (!data) return [];
  return data.map((item: any) => item.action);
};
