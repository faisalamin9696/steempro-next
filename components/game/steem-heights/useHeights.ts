"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/libs/supabase/supabase";
import * as heightsDb from "@/libs/supabase/steem-heights";
import { sdsApi } from "@/libs/sds";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INITIAL_WIDTH,
  BLOCK_HEIGHT,
  INITIAL_SPEED,
  TIME_LIMIT,
  Block,
  HighScore,
} from "./constants";
import { toast } from "sonner";

export const useHeights = () => {
  const { data: session } = useSession();
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle",
  );
  const [score, setScore] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [seasonalWinners, setSeasonalWinners] = useState<any[]>([]);
  const [userHistory, setUserHistory] = useState<HighScore[]>([]);
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [seasonPost, setSeasonPost] = useState<any | null>(null);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const [lastImpactTime, setLastImpactTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isPaused, setIsPaused] = useState(false);

  const requestRef = useRef<number | null>(null);
  const directionRef = useRef<number>(1);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(
    (type: "stack" | "perfect" | "gameover") => {
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
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
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
      }
    },
    [isMuted],
  );

  const fetchHighScores = useCallback(async (season: number) => {
    const topScores = await heightsDb.getHighScores(season, "steem-heights");
    setHighScores(topScores);
  }, []);

  const fetchSeasonalWinners = useCallback(async () => {
    const winners = await heightsDb.getSeasonalWinners("steem-heights");
    setSeasonalWinners(winners);
  }, []);

  const fetchUserHistory = useCallback(async () => {
    if (!session?.user?.name) return;
    const data = await heightsDb.getUserHistory(
      session.user.name,
      "steem-heights",
    );
    setUserHistory(data);
  }, [session]);

  const fetchCurrentSeason = useCallback(async () => {
    try {
      const feeds = await sdsApi.getGameSeason("steem-heights");
      if (feeds && feeds.length > 0) {
        const latestPost = feeds[0];
        setSeasonPost(latestPost);
        const match = latestPost.title.match(/SEASON-(\d+)/i);
        if (match && match[1]) {
          const seasonNum = parseInt(match[1]);
          setCurrentSeason(seasonNum);
          fetchHighScores(seasonNum);
        }
      }
    } catch (error) {
      console.error("Failed to fetch current season:", error);
    }
  }, [fetchHighScores]);

  useEffect(() => {
    fetchUserHistory();
    fetchCurrentSeason();
    fetchSeasonalWinners();

    const channel = supabase
      .channel("leaderboard_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "steempro_game_leaderboard",
          filter: "game=eq.steem-heights",
        },
        () => {
          fetchHighScores(currentSeason);
          fetchUserHistory();
          fetchSeasonalWinners();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHighScores, fetchUserHistory]);

  const triggerGameOver = useCallback(async () => {
    setGameState("gameover");
    playSound("gameover");
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    if (session?.user?.name && score > 0) {
      // Broadcast to Steem blockchain
      try {
        setIsSavingScore(true);
        const response = await fetch("/api/game/steem-heights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score, season: currentSeason }),
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
      fetchUserHistory();
      fetchSeasonalWinners();
    }
  }, [session, score, playSound, fetchHighScores]);

  const startGame = () => {
    const firstBlock = {
      x: (CANVAS_WIDTH - INITIAL_WIDTH) / 2,
      y: CANVAS_HEIGHT - BLOCK_HEIGHT,
      width: INITIAL_WIDTH,
      color: "#f59e0b",
    };
    setBlocks([firstBlock]);
    setCurrentBlock({
      x: 0,
      y: CANVAS_HEIGHT - BLOCK_HEIGHT * 2,
      width: INITIAL_WIDTH,
      color: "#fbbf24",
    });
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameState("playing");
    directionRef.current = 1;
    setShowPerfect(false);
    setTimeLeft(TIME_LIMIT);
    setIsPaused(false);
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

  const update = useCallback(() => {
    if (gameState !== "playing" || isPaused || !currentBlock) return;
    setCurrentBlock((prev) => {
      if (!prev) return null;
      let newX = prev.x + speed * directionRef.current;
      if (newX + prev.width > CANVAS_WIDTH) {
        newX = CANVAS_WIDTH - prev.width;
        directionRef.current = -1;
      } else if (newX < 0) {
        newX = 0;
        directionRef.current = 1;
      }
      return { ...prev, x: newX };
    });
    requestRef.current = requestAnimationFrame(update);
  }, [gameState, speed, currentBlock, isPaused]);

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
    if (isPaused) return;
    if (gameState === "idle" || gameState === "gameover") {
      startGame();
      return;
    }
    if (!currentBlock) return;
    const lastBlock = blocks[blocks.length - 1];
    const isPerfect = Math.abs(currentBlock.x - lastBlock.x) < 4;
    let leftEdge, rightEdge, newWidth;

    if (isPerfect) {
      leftEdge = lastBlock.x;
      rightEdge = lastBlock.x + lastBlock.width;
      newWidth = lastBlock.width;
      setShowPerfect(true);
      setTimeout(() => setShowPerfect(false), 800);
      playSound("perfect");
    } else {
      leftEdge = Math.max(currentBlock.x, lastBlock.x);
      rightEdge = Math.min(
        currentBlock.x + currentBlock.width,
        lastBlock.x + lastBlock.width,
      );
      newWidth = rightEdge - leftEdge;
      playSound("stack");
    }

    if (newWidth <= 0) {
      triggerGameOver();
      return;
    }

    const placedBlock = { ...currentBlock, x: leftEdge, width: newWidth };
    const newBlocks = [...blocks, placedBlock];
    setBlocks(newBlocks);
    setScore((s) => s + 1);
    setLastImpactTime(Date.now());
    setTimeLeft(TIME_LIMIT);
    setSpeed((s) => Math.min(s + (isPerfect ? 0.01 : 0.05), 10));
    setCurrentBlock({
      x: directionRef.current === 1 ? 0 : CANVAS_WIDTH - newWidth,
      y: CANVAS_HEIGHT - BLOCK_HEIGHT * (newBlocks.length + 1),
      width: newWidth,
      color: `hsl(${(newBlocks.length * 20) % 360}, 70%, 50%)`,
    });
  };

  return {
    gameState,
    score,
    blocks,
    currentBlock,
    speed,
    highScores,
    seasonalWinners,
    userHistory,
    currentSeason,
    seasonPost,
    isSavingScore,
    isLoggedIn: !!session?.user?.name,
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
  };
};
