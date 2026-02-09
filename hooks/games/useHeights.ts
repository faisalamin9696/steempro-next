"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/libs/supabase/supabase";
import * as heightsDb from "@/libs/supabase/steem-heights";
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
} from "@/components/games/steem-heights/Config";

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
  const [activeSeasonPost, setActiveSeasonPost] = useState<any | null>(null);
  const [seasonalHistory, setSeasonalHistory] = useState<any[]>([]);
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
  const requestRef = useRef<number | null>(null);
  const directionRef = useRef<number>(1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentBlockRef = useRef<Block | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [combos, setCombos] = useState(0);
  const [totalBonusScore, setTotalBonusScore] = useState(0);
  const [showBonus, setShowBonus] = useState(false);
  const [lastBonus, setLastBonus] = useState(0);

  const playSound = useCallback(
    (type: "stack" | "perfect" | "gameover" | "combo") => {
      if (isMuted) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === "stack") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "perfect") {
        osc.type = "sine";
        // Base frequency 880Hz, increase by semitone for each streak count
        const frequency = 880 * Math.pow(1.059463, Math.min(perfectStreak, 12));
        osc.frequency.setValueAtTime(frequency, now);
        osc.frequency.exponentialRampToValueAtTime(frequency * 2, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "gameover") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === "combo") {
        // Sparkly rising arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = i === notes.length - 1 ? "sine" : "triangle";
          o.frequency.setValueAtTime(freq, now + i * 0.06);
          o.frequency.exponentialRampToValueAtTime(
            freq * 1.05,
            now + i * 0.06 + 0.1,
          );

          o.connect(g);
          g.connect(ctx.destination);

          const volume = i === notes.length - 1 ? 0.15 : 0.1;
          g.gain.setValueAtTime(volume, now + i * 0.06);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.2);

          o.start(now + i * 0.06);
          o.stop(now + i * 0.06 + 0.25);
        });
      }
    },
    [isMuted, perfectStreak],
  );

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
          feeds.filter((item: any) => item.cashout_time === 0),
        );

        // An active season has a future cashout_time (> 0), while ended seasons have it as 0
        const activeFeed = feeds.find((item: any) => item.cashout_time > 0);
        if (activeFeed) {
          setActiveSeasonPost(activeFeed);
          const match = activeFeed.title.match(/SEASON-(\d+)/i);
          if (match && match[1]) {
            const seasonNum = parseInt(match[1]);
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
  ]);

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
  ]);
  const startGame = () => {
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
      color: "#fbbf24",
    };
    setCurrentBlock(startBlock);
    currentBlockRef.current = startBlock;
    setScore(0);
    setSpeed(INITIAL_SPEED);
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
  };

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

      let newX = current.x + speed * directionRef.current * dtScale;
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
    [gameState, speed, isPaused],
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
    const isPerfect = Math.abs(current.x - lastBlock.x) < 4;
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
        // Dynamic bonus based on speed: 1-5m
        const dynamicBonus = Math.max(1, Math.min(5, Math.ceil(speed / 2)));
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
      color: `hsl(${(newBlocks.length * 20) % 360}, 70%, 50%)`,
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
  };
};
