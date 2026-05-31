"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/libs/supabase/supabase";
import * as heightsDb from "@/libs/supabase/steem-heights";

import { SKINS, PowerUp } from "@/components/games/steem-heights/Config";
import { useHeightsShop } from "./useHeightsShop";
import { useHeightsSeason } from "./useHeightsSeason";
import { useHeightsData } from "./useHeightsData";
import { useHeightsGame } from "./useHeightsGame";
import { CheerEvent } from "@/components/games/steem-heights/elements/LiveCheer";

export const useHeights = () => {
  const { data: session } = useSession();
  const { currentSeason, activeSeasonPost, seasonalHistory, isSeasonActive } =
    useHeightsSeason();
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
  const [lastCheer, setLastCheer] = useState<CheerEvent | null>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [hasMoreChat, setHasMoreChat] = useState(true);
  const [isLoadingChatHistory, setIsLoadingChatHistory] = useState(false);
  const lastSentTimeRef = useRef<number>(0);

  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!session?.user?.name || !currentSeason) return;
      const now = Date.now();
      if (now - lastSentTimeRef.current < 2500) {
        console.warn("Chat message ignored due to cooldown.");
        return;
      }
      lastSentTimeRef.current = now;

      await heightsDb.insertGameChatMessage(
        "steem-heights",
        session.user.name,
        currentSeason,
        text,
      );
    },
    [session, currentSeason],
  );

  const loadMoreChatHistory = useCallback(async () => {
    if (
      chatMessages.length === 0 ||
      isLoadingChatHistory ||
      !hasMoreChat ||
      !currentSeason
    )
      return;
    setIsLoadingChatHistory(true);
    const oldestId = chatMessages[0].id;
    const olderMessages = await heightsDb.getGameChatMessages(
      "steem-heights",
      currentSeason,
      25,
      oldestId,
    );
    if (olderMessages.length < 25) {
      setHasMoreChat(false);
    }
    if (olderMessages.length > 0) {
      const reversed = [...olderMessages].reverse();
      setChatMessages((prev) => [...reversed, ...prev]);
    }
    setIsLoadingChatHistory(false);
  }, [chatMessages, currentSeason, isLoadingChatHistory, hasMoreChat]);

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
    isLoadingSeasonalWinners,
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
    sendCheer: useCallback(
      (type: CheerEvent["type"], value?: number | string) => {
        if (!session?.user?.name) return;
        supabase.channel("global_game_events").send({
          type: "broadcast",
          event: "cheer",
          payload: {
            id: Math.random().toString(36).substring(7),
            username: session.user.name,
            type,
            value,
          },
        });
      },
      [session],
    ),

    sendChatMessage,
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

  // Sync global cheers and Presence
  useEffect(() => {
    const channel = supabase.channel("global_game_events");

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        // Count total unique presence keys
        setOnlineCount(Object.keys(state).length);
      })
      .on("broadcast", { event: "cheer" }, ({ payload }) => {
        setLastCheer(payload);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user:
              session?.user?.name ||
              "anon-" + Math.random().toString(36).substring(7),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.name]);

  // Load and sync database chat history
  useEffect(() => {
    if (!currentSeason) return;

    const loadInitialChat = async () => {
      const history = await heightsDb.getGameChatMessages(
        "steem-heights",
        currentSeason,
        25,
      );
      const reversed = [...history].reverse();
      setChatMessages(reversed);
      setHasMoreChat(history.length === 25);
    };
    loadInitialChat();

    const chatChannel = supabase
      .channel("game_chat_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "steempro_game_chat",
          filter: "game=eq.steem-heights",
        },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg && newMsg.season === currentSeason) {
            setChatMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [currentSeason]);

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
    isLoadingSeasonalWinners,
    lastCheer,
    onlineCount,
    chatMessages,
    sendChatMessage,
    hasMoreChat,
    isLoadingChatHistory,
    loadMoreChatHistory,
    fetchSeasonalWinners,
  };
};
