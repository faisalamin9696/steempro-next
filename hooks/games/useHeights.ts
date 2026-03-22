"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/libs/supabase/supabase";

import { SKINS, PowerUp } from "@/components/games/steem-heights/Config";
import { useHeightsShop } from "./useHeightsShop";
import { useHeightsSeason } from "./useHeightsSeason";
import { useHeightsData } from "./useHeightsData";
import { useHeightsGame } from "./useHeightsGame";

export const useHeights = () => {
  const { data: session } = useSession();
  const [energy, setEnergy] = useState(0);
  const [purchasedSkins, setPurchasedSkins] = useState<string[]>([]);
  const [activePowerUp, setActivePowerUp] = useState<PowerUp | null>(null);
  const [selectedSkinId, setSelectedSkinId] = useState<string>("default");
  const [dailyProgress, setDailyProgress] = useState({
    ascent: 0,
    combos: 0,
    plays: 0,
    lastReset: new Date().toDateString(),
    claimed: [] as string[],
  });
  const [isMuted, setIsMuted] = useState(false);
  const [perfectStreak, setPerfectStreak] = useState(0);

  const { currentSeason, activeSeasonPost, seasonalHistory, isSeasonActive } =
    useHeightsSeason();

  const {
    claimChallenge,
    purchasePowerUp,
    purchaseSkin,
    equipSkin,
    syncShopState,
    syncingChallengeId,
    syncingPowerUpId,
    syncingSkinId,
  } = useHeightsShop({
    session,
    energy,
    setEnergy,
    purchasedSkins,
    setPurchasedSkins,
    activePowerUp,
    setActivePowerUp,
    dailyProgress,
    setDailyProgress,
    currentSeason,
    gameState: "idle",
    selectedSkinId,
    setSelectedSkinId,
  });

  const selectedSkin = useMemo(
    () => SKINS.find((s) => s.id === selectedSkinId) || SKINS[0],
    [selectedSkinId],
  );

  const {
    highScores,
    seasonalWinners,
    userStats,
    userHistory,
    globalStats,
    personalBest,
    topScore,
    fetchHeightsUserData,
    fetchShopData,
    fetchDailyData,
    fetchPlayerStats,
    fetchUserHistory,
    fetchHighScores,
    fetchGameStats,
    fetchSeasonalWinners,
    eligibilityMap,
  } = useHeightsData({
    currentSeason,
    setEnergy,
    setPurchasedSkins,
    setActivePowerUp,
    setSelectedSkinId,
    setDailyProgress,
  });

  const {
    gameState,
    setGameState,
    score,
    blocks,
    debris,
    currentBlock,
    speed,
    isSavingScore,
    showPerfect,
    lastImpactTime,
    lastImpactPos,
    timeLeft,
    isPaused,
    setIsPaused,
    combos,
    totalBonusScore,
    showBonus,
    lastBonus,
    lives,
    setLives,
    windDrift,
    handleAction,
    startGame,
    isGeneratingSession,
  } = useHeightsGame({
    session,
    selectedSkin,
    activePowerUp,
    currentSeason,
    activeSeasonPost,
    energy,
    purchasedSkins,
    selectedSkinId,
    syncShopState,
    fetchData: useCallback(() => {
      fetchHighScores(currentSeason);
      fetchGameStats();
      fetchHeightsUserData();
      fetchUserHistory();
      fetchSeasonalWinners();
    }, [
      currentSeason,
      fetchHighScores,
      fetchGameStats,
      fetchHeightsUserData,
      fetchUserHistory,
      fetchSeasonalWinners,
    ]),
    isMuted,
    perfectStreak,
    setPerfectStreak,
  });

  // Sync shop and game results realtime
  useEffect(() => {
    if (!session?.user?.name) return;

    // Channel for shop changes (claimed, energy, skins)
    const shopChannel = supabase
      .channel(`user_shop_realtime_${session.user.name}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "steempro_game_heights_shop",
          filter: `player=eq.${session.user.name}`,
        },
        () => fetchShopData(),
      )
      .subscribe();

    // Channel for game results (plays, combos, climb)
    const gameChannel = supabase
      .channel(`user_game_realtime_${session.user.name}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "steempro_game_heights",
          filter: `player=eq.${session.user.name}`,
        },
        () => {
          fetchDailyData();
          fetchPlayerStats();
          fetchHighScores(currentSeason);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(shopChannel);
      supabase.removeChannel(gameChannel);
    };
  }, [
    session?.user?.name,
    fetchShopData,
    fetchDailyData,
    fetchPlayerStats,
    fetchHighScores,
    currentSeason,
  ]);

  // Sync lives preview
  useEffect(() => {
    if (gameState !== "playing") {
      const skinLives = selectedSkin.perks.extraLife ? 1 : 0;
      const powerUpLives = activePowerUp?.perks.extraLife ? 1 : 0;
      setLives(1 + skinLives + powerUpLives);
    }
  }, [selectedSkin, activePowerUp, gameState, setLives]);

  return {
    gameState,
    score,
    blocks,
    debris,
    currentBlock,
    speed,
    highScores,
    seasonalWinners,
    currentSeason: currentSeason || 0,
    seasonPost: activeSeasonPost,
    seasonalHistory,
    userStats,
    userHistory,
    globalStats,
    isSavingScore,
    fetchHeightsUserData,
    fetchUserHistory,
    isLoggedIn: !!session?.user?.name,
    isSeasonActive,
    isMuted,
    setIsMuted,
    showPerfect,
    lastImpactTime,
    lastImpactPos,
    timeLeft,
    isPaused,
    setIsPaused,
    handleAction,
    startGame,
    setGameState,
    perfectStreak,
    combos,
    totalBonusScore,
    showBonus,
    lastBonus,
    username: session?.user?.name || "",
    selectedSkin,
    setSelectedSkinId,
    lives,
    windDrift,
    personalBest,
    topScore,
    energy,
    dailyProgress,
    activePowerUp,
    claimChallenge,
    purchasePowerUp,
    purchasedSkins,
    purchaseSkin,
    equipSkin,
    syncingChallengeId,
    syncingPowerUpId,
    syncingSkinId,
    isGeneratingSession,
    eligibilityMap,
  };
};
