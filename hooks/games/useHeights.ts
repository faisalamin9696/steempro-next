"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/libs/supabase/supabase";
import * as heightsDb from "@/libs/supabase/steem-heights";
import * as heightsShopDb from "@/libs/supabase/steem-heights-shop";
import { sdsApi } from "@/libs/sds";

import { toast } from "sonner";
import {
  Block,
  Debris,
  INITIAL_SPEED,
  HighScore,
  TIME_LIMIT,
  CANVAS_WIDTH,
  INITIAL_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_HEIGHT,
  SPEED_INCREMENT_PERFECT,
  SPEED_INCREMENT_NORMAL,
  MAX_SPEED,
  SCORE_PER_BLOCK,
  GameStats,
  SKINS,
  Skin,
  DAILY_CHALLENGES,
  POWER_UPS,
  PowerUp,
} from "@/components/games/steem-heights/Config";
import { useDeviceInfo } from "../redux/useDeviceInfo";
import { useHeightsShop } from "./useHeightsShop";
import { useHeightsSound } from "./useHeightsSound";
import { empty_comment } from "@/constants/templates";

export const getSeasonFromTitle = (title: string) => {
  const match = title.match(/SEASON-(\d+)/i);
  return match ? parseInt(match[1]) : null;
};
export const useHeights = () => {
  const { data: session } = useSession();
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle",
  );
  const [score, setScore] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [debris, setDebris] = useState<Debris[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [seasonalWinners, setSeasonalWinners] = useState<any[]>([]);
  const [userHistory, setUserHistory] = useState<HighScore[]>([]);
  const [currentSeason, setCurrentSeason] = useState<number>(0);
  const [activeSeasonPost, setActiveSeasonPost] = useState<Feed | null>(null);
  const [seasonalHistory, setSeasonalHistory] = useState<Feed[]>([]);
  const [globalStats, setGlobalStats] = useState<GameStats>({
    totalParticipants: 0,
    activePlayers24h: 0,
    totalPlays: 0,
    totalAltitude: 0,
  });
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const [lastImpactTime, setLastImpactTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isPaused, setIsPaused] = useState(false);
  const { isMobile } = useDeviceInfo();

  const [energy, setEnergy] = useState(0);
  const [dailyProgress, setDailyProgress] = useState({
    ascent: 0,
    combos: 0,
    plays: 0,
    lastReset: new Date().toDateString(),
    claimed: [] as string[],
  });
  const [activePowerUp, setActivePowerUp] = useState<PowerUp | null>(null);
  const [purchasedSkins, setPurchasedSkins] = useState<string[]>([]);

  const personalBest = useMemo(() => {
    if (userHistory.length === 0) return 0;
    return Math.max(...userHistory.map((h) => h.score));
  }, [userHistory]);

  const topScore = useMemo(() => {
    if (highScores.length === 0) return 0;
    return highScores[0].score;
  }, [highScores]);
  const requestRef = useRef<number | null>(null);
  const directionRef = useRef<number>(1);
  const currentBlockRef = useRef<Block | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [combos, setCombos] = useState(0);
  const [totalBonusScore, setTotalBonusScore] = useState(0);
  const [showBonus, setShowBonus] = useState(false);
  const [lastBonus, setLastBonus] = useState(0);
  const [selectedSkinId, setSelectedSkinId] = useState<string>("default");
  const [lives, setLives] = useState(1);
  const [windDrift, setWindDrift] = useState(0);

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
    gameState,
    selectedSkinId,
    setSelectedSkinId,
  });

  const selectedSkin = useMemo(
    () => SKINS.find((s) => s.id === selectedSkinId) || SKINS[0],
    [selectedSkinId],
  );

  // Update lives preview when skin or powerup changes
  useEffect(() => {
    if (gameState !== "playing") {
      const skinLives = selectedSkin.perks.extraLife ? 1 : 0;
      const powerUpLives = activePowerUp?.perks.extraLife ? 1 : 0;
      setLives(1 + skinLives + powerUpLives);
    }
  }, [selectedSkin, activePowerUp, gameState]);

  const { playSound } = useHeightsSound(isMuted, perfectStreak);

  const fetchUserStats = useCallback(async () => {
    if (!session?.user?.name || !currentSeason) return;
    try {
      const stats = await heightsShopDb.getUserGameStats(
        session.user.name,
        currentSeason,
      );
      if (stats) {
        setEnergy(stats.energy || 0);
        setPurchasedSkins(stats.skins || []);
        if (stats.powerup?.name) {
          const powerUp = POWER_UPS.find((p) => p.name === stats.powerup.name);
          if (powerUp) setActivePowerUp(powerUp);
          else setActivePowerUp(null);
        } else {
          setActivePowerUp(null);
        }
        if (stats.equipedSkin) {
          setSelectedSkinId(stats.equipedSkin);
        } else {
          setSelectedSkinId("default");
        }
      } else {
        setEnergy(0);
        setPurchasedSkins([]);
        setActivePowerUp(null);
        setSelectedSkinId("default");
      }
    } catch (error) {
      console.error("Failed to fetch user game stats:", error);
    }
  }, [session?.user?.name, currentSeason]);

  const fetchDailyProgress = useCallback(async () => {
    if (!session?.user?.name || !currentSeason) return;
    try {
      const [stats, claims] = await Promise.all([
        heightsDb.getHeightsUserDailyStats(session.user.name, currentSeason),
        heightsShopDb.getHeightsUserDailyClaims(
          session.user.name,
          currentSeason,
        ),
      ]);

      const claimedIds = DAILY_CHALLENGES.filter((c) =>
        claims.includes(`Claimed challenge: ${c.title}`),
      ).map((c) => c.id);

      setDailyProgress((prev) => ({
        ...prev,
        ascent: stats.ascent,
        combos: stats.combos,
        plays: stats.plays,
        claimed: claimedIds,
      }));
    } catch (error) {
      console.error("Failed to fetch daily progress:", error);
    }
  }, [session?.user?.name, currentSeason]);

  const fetchHighScores = useCallback(async (season: number) => {
    const topScores = await heightsDb.getHeightsHighScores(season);
    setHighScores(topScores);
  }, []);

  const fetchSeasonalWinners = useCallback(async () => {
    const winners = await heightsDb.getHeightsSeasonalWinners();
    setSeasonalWinners(winners);
  }, []);

  const fetchUserHistory = useCallback(async () => {
    if (!session?.user?.name) return;
    const data = await heightsDb.getHeightsUserHistory(session.user.name);
    setUserHistory(data);
  }, [session?.user?.name]);

  const fetchCurrentSeason = useCallback(async () => {
    try {
      const feeds = await sdsApi.getGameSeasons("steem-heights");

      if (feeds && feeds.length > 0) {
        setSeasonalHistory(
          feeds.filter((item: Feed) => item.cashout_time === 0),
        );
        // An active season has a future cashout_time (> 0), while ended seasons have it as 0
        const activeFeed = feeds.find((item: any) => item.cashout_time > 0);

        // test case
        //         const activeFeed = {...empty_comment(
        //           "",
        //           "",
        //           `Prize Pool: 500 STEEM

        // | Parameter | Value |
        // | --- | --- |
        // |  **Season Duration** | 7 Days |
        // | ️ **Base Altitude Goal** | 500m |
        // |  **Initial Base Reward** | 100 STEEM |
        // |  **Max Potential Pool** | 500 STEEM |
        // |  **Reward Step Size** | 3000m |
        // |  **Reward Increase %** | 0.5% |`,
        //         ), title:`🏆 SEASON-3: "Steem Heights"`};
        if (activeFeed) {
          setActiveSeasonPost(activeFeed);
          const seasonNum = getSeasonFromTitle(activeFeed.title);
          if (seasonNum) {
            setCurrentSeason(seasonNum);
            fetchHighScores(seasonNum);
            fetchGameStats(seasonNum);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch current season:", error);
    }
  }, [fetchHighScores]);

  const fetchGameStats = useCallback(async (season?: number) => {
    if (!season) return;
    try {
      const stats = await heightsDb.getHeightsGameStats(season);
      setGlobalStats(stats);
    } catch (error) {
      console.error("Failed to fetch game stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchCurrentSeason();
    fetchSeasonalWinners();
  }, [fetchCurrentSeason, fetchSeasonalWinners]);

  useEffect(() => {
    fetchUserHistory();
  }, [fetchUserHistory]);

  useEffect(() => {
    const channel = supabase
      .channel("leaderboard_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "steempro_game_heights",
          filter: "game=eq.steem-heights",
        },
        () => {
          // We don't bother with currentSeason here since it's hard to sync
          // The fetchCurrentSeason call in the other effect will handle it
          // or we can just fetch the latest for the current season state
          if (currentSeason) {
            fetchHighScores(currentSeason);
            fetchGameStats(currentSeason);
          }
          fetchUserHistory();
          fetchSeasonalWinners();
          fetchDailyProgress();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    currentSeason,
    fetchHighScores,
    fetchUserHistory,
    fetchSeasonalWinners,
    fetchGameStats,
    fetchDailyProgress,
    fetchUserStats,
  ]);

  useEffect(() => {
    fetchDailyProgress();
    fetchUserStats();
  }, [fetchDailyProgress, fetchUserStats]);

  useEffect(() => {
    if (!session?.user?.name) return;

    const channel = supabase
      .channel(`user_shop_${session.user.name}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "steempro_game_heights_shop",
          filter: `player=eq.${session.user.name}`,
        },
        (payload) => {
          console.log("Shop Update Received:", payload);
          const newData = payload.new as any;
          if (newData) {
            setEnergy(newData.energy || 0);

            // Parse skins and powerup if they are strings
            const skins =
              typeof newData.skins === "string"
                ? JSON.parse(newData.skins)
                : newData.skins || [];
            const powerup =
              typeof newData.powerup === "string"
                ? JSON.parse(newData.powerup)
                : newData.powerup;

            setPurchasedSkins(skins);
            if (newData.equiped) {
              setSelectedSkinId(newData.equiped);
            }

            // Handle powerup which could be an object {name, updated_at} or just the name string
            const puName =
              typeof powerup === "object" ? powerup?.name : powerup;

            // Only update powerup state if not playing, to avoid mid-game consumption issues
            if (gameState !== "playing") {
              if (puName && puName !== "") {
                const powerUp = POWER_UPS.find((p) => p.name === puName);
                if (powerUp) setActivePowerUp(powerUp);
                else setActivePowerUp(null);
              } else {
                setActivePowerUp(null);
              }
            }

            // Handle daily challenge claims
            if (
              newData.action &&
              newData.action.startsWith("Claimed challenge: ")
            ) {
              const title = newData.action.replace("Claimed challenge: ", "");
              const challenge = DAILY_CHALLENGES.find((c) => c.title === title);
              if (challenge) {
                setDailyProgress((prev) => ({
                  ...prev,
                  claimed: Array.from(new Set([...prev.claimed, challenge.id])),
                }));
              }
            }
          }
        },
      )
      .subscribe((status) => {
        console.log(`Shop Channel Status (${session?.user?.name}):`, status);
        if (status === "SUBSCRIBED") {
          // Fetch once on successful subscription to ensure we have latest
          fetchUserStats();
          fetchDailyProgress();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.name, fetchUserStats]);

  const triggerGameOver = useCallback(async () => {
    setGameState("gameover");
    playSound("gameover");
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    if (session?.user?.name && score > 0) {
      if (!activeSeasonPost) {
        console.log("No active season, skipping score recording");
        return;
      }
      // Broadcast to Steem blockchain
      try {
        // Consume active power-up in DB and local state
        if (activePowerUp) {
          try {
            await syncShopState(
              `Power-up consumed: ${activePowerUp.name}`,
              currentSeason,
              energy,
              purchasedSkins,
              null, // Clear power-up in DB
              selectedSkinId,
            );
          } catch (error) {
            console.error("Failed to consume power-up:", error);
          }
        }

        setActivePowerUp(null);

        setIsSavingScore(true);
        const response = await fetch("/api/game/steem-heights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score, season: currentSeason, combos }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Score recorded on blockchain:", data);
          toast.success("Score recorded on blockchain");
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to broadcast score to blockchain");
        }
      } catch (error) {
        console.error("Failed to broadcast score to blockchain:", error);
        toast.error("Failed to broadcast score to blockchain");
      } finally {
        setIsSavingScore(false);
      }

      fetchHighScores(currentSeason);
      fetchGameStats(currentSeason);
      fetchUserHistory();
      fetchSeasonalWinners();
      fetchDailyProgress();
    }
  }, [
    session,
    score,
    playSound,
    fetchHighScores,
    fetchGameStats,
    fetchUserHistory,
    fetchSeasonalWinners,
    currentSeason,
    combos,
    activeSeasonPost,
    activePowerUp,
    syncShopState,
    energy,
    purchasedSkins,
    selectedSkinId,
  ]);
  const startGame = useCallback(async () => {
    const firstBlock = {
      x: (CANVAS_WIDTH - INITIAL_WIDTH) / 2,
      y: CANVAS_HEIGHT - BLOCK_HEIGHT,
      width: INITIAL_WIDTH,
      color: "#f59e0b",
    };
    setBlocks([firstBlock]);
    setDebris([]);
    const startBlock = {
      x: 0,
      y: CANVAS_HEIGHT - BLOCK_HEIGHT * 2,
      width: INITIAL_WIDTH,
      color: selectedSkin.color,
    };
    setCurrentBlock(startBlock);
    currentBlockRef.current = startBlock;
    setScore(0);
    setSpeed(INITIAL_SPEED);

    setWindDrift(0);
    setGameState("playing");
    directionRef.current = 1;
    setShowPerfect(false);
    setTimeLeft(TIME_LIMIT);
    setIsPaused(false);
    setPerfectStreak(0);
    setCombos(0);
    setTotalBonusScore(0);
    setShowBonus(false);
    setLastBonus(0);
    lastFrameTimeRef.current = performance.now();
  }, [selectedSkin]);

  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timer);
          triggerGameOver();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [gameState, triggerGameOver, isPaused]);

  const update = useCallback(
    (timestamp: number) => {
      if (gameState !== "playing" || isPaused) {
        lastFrameTimeRef.current = timestamp;
        return;
      }

      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const dt = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      // Scale movement based on a 60FPS baseline (16.67ms per frame)
      const dtScale = dt / (1000 / 60);

      const current = currentBlockRef.current;
      if (!current) return;

      // Calculate localized speed with Glacier perk, mobile adjustment, and power-ups
      const mobileFactor = isMobile ? 0.85 : 1;
      const powerUpSlow = activePowerUp?.perks.slowFactor || 1;
      const effectiveSpeed =
        speed *
        (selectedSkin.perks.slowFactor || 1) *
        mobileFactor *
        powerUpSlow;

      // Update Wind Drift (increase with altitude) - Check for Skin or PowerUp wind resistance
      if (
        !selectedSkin.perks.windResist &&
        !activePowerUp?.perks.windResist &&
        gameState === "playing"
      ) {
        const windIntensity = (score / 100) * 0.2;
        const drift = Math.sin(timestamp / 2000) * windIntensity;
        setWindDrift(drift);
      } else {
        setWindDrift(0);
      }

      let newX =
        current.x +
        (effectiveSpeed * directionRef.current + windDrift) * dtScale;
      if (newX + current.width > CANVAS_WIDTH) {
        newX = CANVAS_WIDTH - current.width;
        directionRef.current = -1;
      } else if (newX < 0) {
        newX = 0;
        directionRef.current = 1;
      }

      const updatedBlock = { ...current, x: newX };
      currentBlockRef.current = updatedBlock;
      setCurrentBlock(updatedBlock);

      // Animate debris
      setDebris((prevDebris) =>
        prevDebris
          .map((d) => ({
            ...d,
            y: d.y + 1 * dtScale,
            rotation: d.rotation + d.velocity * 2 * dtScale,
          }))
          .filter((d) => d.y < CANVAS_HEIGHT + 100),
      );

      requestRef.current = requestAnimationFrame(update);
    },
    [gameState, speed, isPaused, selectedSkin, windDrift, score],
  );

  useEffect(() => {
    if (gameState === "playing" && !isPaused) {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, update, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "p" && gameState === "playing") {
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  const handleAction = async () => {
    if (isPaused || isSavingScore) return;
    if (gameState === "idle" || (gameState === "gameover" && !isSavingScore)) {
      startGame();
      return;
    }
    const current = currentBlockRef.current;
    if (!current) return;

    const lastBlock = blocks[blocks.length - 1];
    const perfectThreshold = isMobile ? 6 : 4;
    const isPerfect = Math.abs(current.x - lastBlock.x) < perfectThreshold;
    let leftEdge, rightEdge, newWidth;
    let bonusAltitude = 0;
    let isBonus = false;

    if (isPerfect) {
      leftEdge = lastBlock.x;
      newWidth = lastBlock.width;
      const newStreak = perfectStreak + 1;
      setPerfectStreak(newStreak);
      playSound("perfect");

      // Bonus every 3 perfects
      if (newStreak > 0 && newStreak % 3 === 0) {
        isBonus = true;
        // Dynamic bonus based on speed: 1-5m + Midas Perk
        const dynamicBonus =
          Math.max(1, Math.min(5, Math.ceil(speed / 2))) +
          (selectedSkin.perks.bonusAltitude || 0);
        bonusAltitude = dynamicBonus;
        setLastBonus(dynamicBonus);
        setTotalBonusScore((t) => t + bonusAltitude);
        setCombos((c) => c + 1);
        setShowBonus(true);
        playSound("combo");
        setTimeout(() => setShowBonus(false), 600);
      } else {
        setShowPerfect(true);
        setTimeout(() => setShowPerfect(false), 500);
      }
    } else {
      leftEdge = Math.max(current.x, lastBlock.x);
      rightEdge = Math.min(
        current.x + current.width,
        lastBlock.x + lastBlock.width,
      );
      newWidth = rightEdge - leftEdge;
      setPerfectStreak(0);
      playSound("stack");

      // Calculate debris
      const isLeft = current.x < lastBlock.x;
      const debrisWidth = current.width - newWidth;

      if (debrisWidth > 0) {
        const debrisX = isLeft ? current.x : rightEdge;
        setDebris((prev) => [
          ...prev,
          {
            x: debrisX,
            y: current.y,
            width: debrisWidth,
            color: current.color,
            velocity: isLeft ? -2 : 2,
            rotation: 0,
          },
        ]);
      }
    }

    if (newWidth <= 0) {
      if (lives > 1) {
        setLives((l) => l - 1);
        toast.info("PHOENIX SAVE! Extra life used.");
        // Reset current block to start of the row to give another chance
        const resetBlock = {
          ...current,
          x: directionRef.current === 1 ? 0 : CANVAS_WIDTH - current.width,
        };
        setCurrentBlock(resetBlock);
        currentBlockRef.current = resetBlock;
        playSound("stack");
        return;
      }
      triggerGameOver();
      return;
    }

    const placedBlock = {
      ...current,
      x: leftEdge,
      width: newWidth,
      grow: isBonus,
    };
    const newBlocks = [...blocks, placedBlock];
    setBlocks(newBlocks);
    setScore((s) => s + SCORE_PER_BLOCK + bonusAltitude);
    setLastImpactTime(Date.now());
    setTimeLeft(TIME_LIMIT);
    setSpeed((s) =>
      Math.min(
        s + (isPerfect ? SPEED_INCREMENT_PERFECT : SPEED_INCREMENT_NORMAL),
        MAX_SPEED,
      ),
    );

    const nextBlock = {
      x: directionRef.current === 1 ? 0 : CANVAS_WIDTH - newWidth,
      y: CANVAS_HEIGHT - BLOCK_HEIGHT * (newBlocks.length + 1),
      width: newWidth,
      color:
        selectedSkin.id === "default"
          ? `hsl(${(newBlocks.length * 20) % 360}, 70%, 50%)`
          : selectedSkin.color,
    };
    setCurrentBlock(nextBlock);
    currentBlockRef.current = nextBlock;
  };

  return {
    gameState,
    score,
    blocks,
    debris,
    currentBlock,
    speed,
    highScores,
    seasonalWinners,
    userHistory,
    currentSeason,
    seasonPost: activeSeasonPost,
    seasonalHistory,
    isSavingScore,
    isLoggedIn: !!session?.user?.name,
    isSeasonActive: !!activeSeasonPost,
    isMuted,
    setIsMuted,
    showPerfect,
    lastImpactTime,
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
    globalStats,
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
  };
};
