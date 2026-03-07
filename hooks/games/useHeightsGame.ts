"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Block,
  Debris,
  INITIAL_SPEED,
  TIME_LIMIT,
  CANVAS_WIDTH,
  INITIAL_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_HEIGHT,
  SPEED_INCREMENT_PERFECT,
  SPEED_INCREMENT_NORMAL,
  MAX_SPEED,
  SCORE_PER_BLOCK,
  Skin,
  PowerUp,
} from "@/components/games/steem-heights/Config";
import { useDeviceInfo } from "../redux/useDeviceInfo";
import { useHeightsSound } from "./useHeightsSound";
import { generateHMAC } from "@/utils/encryption";

interface useHeightsGameProps {
  session: any;
  selectedSkin: Skin;
  activePowerUp: PowerUp | null;
  currentSeason: number;
  activeSeasonPost: any;
  energy: number;
  purchasedSkins: string[];
  selectedSkinId: string;
  syncShopState: any;
  fetchData: () => void;
  isMuted: boolean;
  perfectStreak: number;
  setPerfectStreak: (s: number | ((prev: number) => number)) => void;
}

export const useHeightsGame = ({
  session,
  selectedSkin,
  activePowerUp,
  currentSeason,
  activeSeasonPost,
  energy,
  purchasedSkins,
  selectedSkinId,
  syncShopState,
  fetchData,
  isMuted,
  perfectStreak,
  setPerfectStreak,
}: useHeightsGameProps) => {
  const { isMobile } = useDeviceInfo();
  const { playSound } = useHeightsSound(isMuted, perfectStreak);

  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">(
    "idle",
  );
  const [score, setScore] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [debris, setDebris] = useState<Debris[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const [lastImpactTime, setLastImpactTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isPaused, setIsPaused] = useState(false);
  const [combos, setCombos] = useState(0);
  const [totalBonusScore, setTotalBonusScore] = useState(0);
  const [showBonus, setShowBonus] = useState(false);
  const [lastBonus, setLastBonus] = useState(0);
  const [lives, setLives] = useState(1);
  const [windDrift, setWindDrift] = useState(0);
  const [isGeneratingSession, setIsGeneratingSession] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    gameId: string;
    challenge: string;
  } | null>(null);

  const requestRef = useRef<number | null>(null);
  const directionRef = useRef<number>(1);
  const currentBlockRef = useRef<Block | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Performance Optimization: Reactive refs for animation loop
  const gameStateRef = useRef<string>(gameState);
  const isPausedRef = useRef<boolean>(isPaused);
  const speedRef = useRef<number>(speed);
  const scoreRef = useRef<number>(score);
  const selectedSkinRef = useRef(selectedSkin);
  const activePowerUpRef = useRef(activePowerUp);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    selectedSkinRef.current = selectedSkin;
  }, [selectedSkin]);
  useEffect(() => {
    activePowerUpRef.current = activePowerUp;
  }, [activePowerUp]);

  const triggerGameOver = useCallback(async () => {
    setGameState("gameover");
    playSound("gameover");
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    if (session?.user?.name && score > 0) {
      if (!activeSeasonPost) {
        console.log("No active season, skipping score recording");
        return;
      }

      setIsSavingScore(true);

      try {
        if (activePowerUp) {
          try {
            await syncShopState(
              `Power-up consumed: ${activePowerUp.name}`,
              currentSeason,
              energy,
              purchasedSkins,
              null,
              selectedSkinId,
            );
          } catch (error) {
            console.error("Failed to consume power-up:", error);
          }
        }

        const signature = sessionInfo
          ? generateHMAC(
              `${session?.user?.name}:${sessionInfo.gameId}:${sessionInfo.challenge}:${score}:${combos}`,
              sessionInfo.challenge,
            )
          : "";

        const response = await fetch("/api/game/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score,
            season: currentSeason,
            combos,
            gameId: sessionInfo?.gameId,
            signature,
          }),
        });

        if (response.ok) {
          toast.success("Score recorded on blockchain");
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to broadcast score");
        }
      } catch (error) {
        toast.error("Failed to broadcast score");
      } finally {
        setIsSavingScore(false);
        fetchData();
        setSessionInfo(null);
      }
    }
  }, [
    session,
    score,
    playSound,
    activeSeasonPost,
    activePowerUp,
    syncShopState,
    currentSeason,
    energy,
    purchasedSkins,
    selectedSkinId,
    combos,
    fetchData,
    sessionInfo,
  ]);

  const startGame = useCallback(async () => {
    setSessionInfo(null);

    // Only generate secure session if user is logged in and active season
    if (session?.user?.name && currentSeason) {
      setIsGeneratingSession(true);
      try {
        const response = await fetch("/api/game/start", { method: "POST" });
        const data = await response.json();
        if (data.success) {
          setSessionInfo({ gameId: data.gameId, challenge: data.challenge });
        } else {
          toast.error(data.error || "Failed to generate game session");
          setGameState("idle");
          return;
        }
      } catch (error) {
        toast.error("Connectivity error. Please try again.");
        setGameState("idle");
        return;
      } finally {
        setIsGeneratingSession(false);
      }
    }

    // Now that session is secure (if user logged in), initialize and start the game
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

    // Final step: trigger loops
    setGameState("playing");
  }, [selectedSkin, session?.user?.name, currentSeason]);

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
      if (gameStateRef.current !== "playing") return;
      if (isPausedRef.current) {
        lastFrameTimeRef.current = timestamp;
        requestRef.current = requestAnimationFrame(update);
        return;
      }

      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const dt = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      const dtScale = Math.min(dt / (1000 / 60), 2); // Cap dtScale to prevent huge jumps
      const current = currentBlockRef.current;
      if (!current) {
        requestRef.current = requestAnimationFrame(update);
        return;
      }

      const activePowerUp = activePowerUpRef.current;
      const selectedSkin = selectedSkinRef.current;
      const currentScore = scoreRef.current;

      const mobileFactor = isMobile ? 0.85 : 1;
      const powerUpSlow = activePowerUp?.perks.slowFactor || 1;
      const effectiveSpeed =
        speedRef.current *
        (selectedSkin.perks.slowFactor || 1) *
        mobileFactor *
        powerUpSlow;

      let currentWindDrift = 0;
      if (!selectedSkin.perks.windResist && !activePowerUp?.perks.windResist) {
        const windIntensity = (currentScore / 100) * 0.2;
        currentWindDrift = Math.sin(timestamp / 2000) * windIntensity;
        setWindDrift(currentWindDrift);
      } else {
        setWindDrift(0);
      }

      let newX =
        current.x +
        (effectiveSpeed * directionRef.current + currentWindDrift) * dtScale;

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

      setDebris((prevDebris) => {
        if (prevDebris.length === 0) return prevDebris;
        return prevDebris
          .map((d) => ({
            ...d,
            y: d.y + 1 * dtScale,
            rotation: d.rotation + d.velocity * 2 * dtScale,
          }))
          .filter((d) => d.y < CANVAS_HEIGHT + 100)
          .slice(-10); // Performance: Only keep last 10 debris items
      });

      requestRef.current = requestAnimationFrame(update);
    },
    [isMobile], // Minimal dependencies
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
    if (isPaused || isSavingScore || isGeneratingSession) return;
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

      if (newStreak > 0 && newStreak % 3 === 0) {
        isBonus = true;
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
    setGameState,
    score,
    blocks,
    debris,
    currentBlock,
    speed,
    isSavingScore,
    showPerfect,
    lastImpactTime,
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
  };
};
