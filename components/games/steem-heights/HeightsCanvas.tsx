"use client";

import { forwardRef, memo } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  ArrowUp,
  Volume2,
  VolumeX,
  Gamepad2,
  Star,
  Zap,
  Heart,
  Shield,
  Pause,
  Play,
  Mountain,
} from "lucide-react";
import { useDisclosure } from "@heroui/modal";
import { HeightsGuideModal } from "./HeightsGuideModal";
import {
  Block,
  Debris,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_HEIGHT,
  TIME_LIMIT,
  Skin,
  HighScore,
  PowerUp,
} from "./Config";

import { GameHUD } from "./elements/GameHUD";
import { GhostMarkers } from "./elements/GhostMarkers";
import { GameMenus } from "./elements/GameMenus";
import { Overlays } from "./elements/Overlays";

interface Props {
  gameState: "idle" | "playing" | "gameover";
  score: number;
  blocks: Block[];
  debris: Debris[];
  currentBlock: Block | null;
  speed: number;
  timeLeft: number;
  isSavingScore: boolean;
  isLoggedIn: boolean;
  isMuted: boolean;
  isPaused: boolean;
  isSeasonActive: boolean;
  showPerfect: boolean;
  lastImpactTime: number;
  activePowerUp: PowerUp | null;
  handleAction: () => void;
  setIsMuted: (muted: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  startGame: () => void;
  setGameState: (state: "idle") => void;
  scrollToLeaderboard?: () => void;
  perfectStreak: number;
  combos: number;
  totalBonusScore: number;
  showBonus: boolean;
  lastBonus: number;
  lives: number;
  windDrift: number;
  selectedSkin: Skin;
  highScores: HighScore[];
  username: string;
  isGeneratingSession?: boolean;
}

export const HeightsCanvas = memo(
  forwardRef<HTMLDivElement, Props>(
    (
      {
        gameState,
        score,
        blocks,
        debris,
        currentBlock,
        speed,
        timeLeft,
        isSavingScore,
        isLoggedIn,
        isMuted,
        isPaused,
        isSeasonActive,
        showPerfect,
        lastImpactTime,
        activePowerUp,
        handleAction,
        setIsMuted,
        setIsPaused,
        startGame,
        setGameState,
        scrollToLeaderboard,
        perfectStreak,
        combos,
        totalBonusScore,
        showBonus,
        lastBonus,
        lives,
        windDrift,
        selectedSkin,
        highScores,
        username,
        isGeneratingSession,
      },
      ref,
    ) => {
      const { isOpen, onOpen, onOpenChange } = useDisclosure();
      const viewY = Math.max(0, (blocks.length - 10) * BLOCK_HEIGHT);

      const renderBlockIcon = (width: number) => {
        if (width < 30) return null;
        const iconSize = Math.min(12, width / 3);
        const commonProps = {
          size: iconSize,
          className: "text-white/80 drop-shadow-sm",
        };

        switch (selectedSkin?.id) {
          case "glacier":
            return <Zap {...commonProps} />;
          case "steel":
            return <Shield {...commonProps} />;
          case "phoenix":
            return <Heart {...commonProps} />;
          case "gold":
            return <Star {...commonProps} />;
          case "default":
            return <Mountain {...commonProps} />;
          default:
            return null;
        }
      };

      return (
        <div className="flex flex-col gap-2 w-full max-w-full sm:max-w-[450px] group select-none sm:px-1">
          <GameHUD
            score={score}
            lives={lives}
            activePowerUp={activePowerUp}
            gameState={gameState}
            windDrift={windDrift}
            onOpenGuide={onOpen}
            scrollToLeaderboard={scrollToLeaderboard}
          />

          <div className="flex items-center justify-between mb-1 px-1">
            <div className="flex items-center gap-1">
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center overflow-hidden transition-colors"
                style={{
                  color: selectedSkin.color,
                }}
              >
                <div className="[&_svg]:text-current">
                  {renderBlockIcon(30)}
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {selectedSkin.name}
              </span>
            </div>
          </div>

          <Card
            ref={ref}
            className="relative w-full aspect-2/3 bg-zinc-950 border-4 border-zinc-900 rounded-3xl overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] cursor-pointer active:scale-[0.99] transition-transform touch-none"
            onMouseDown={handleAction}
          >
            {/* Countdown Progress Bar */}
            {gameState === "playing" && (
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
                <motion.div
                  className="h-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  animate={{
                    width: `${(timeLeft / TIME_LIMIT) * 100}%`,
                    backgroundColor: timeLeft < 2 ? "#ef4444" : "#f59e0b",
                  }}
                  transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                />
              </div>
            )}

            {/* Status Overlay Notices */}
            <AnimatePresence>
              {(!isLoggedIn || !isSeasonActive) && gameState === "idle" && (
                <div className="absolute top-14 left-0 right-0 z-41 px-4 pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl backdrop-blur-md border border-white/5 shadow-2xl ${
                      !isLoggedIn
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                        !isLoggedIn
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-blue-500/20 text-blue-500"
                      }`}
                    >
                      {!isLoggedIn ? (
                        <Gamepad2 size={16} />
                      ) : (
                        <RefreshCw size={16} className="animate-spin-slow" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          !isLoggedIn ? "text-amber-500" : "text-blue-500"
                        }`}
                      >
                        {!isLoggedIn ? "Test Gameplay" : "Season Break"}
                      </span>
                      <p className="text-[10px] text-zinc-400 font-medium leading-tight max-w-[200px]">
                        {!isLoggedIn
                          ? "Login now to record your scores and earn rewards. Current altitude will not be saved."
                          : "The current season has ended. Please wait for the next season to compete and earn rewards!"}
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Background Gradients */}
            <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 via-transparent to-amber-500/5 pointer-events-none" />
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, #3f3f46 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Game Controls */}
            <div
              className="absolute top-2 right-4 z-41 flex flex-col gap-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-zinc-900/80 backdrop-blur-md text-zinc-400 border border-white/5 hover:bg-zinc-800 transition-colors"
                onPress={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </Button>

              {gameState === "playing" && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="bg-zinc-900/80 backdrop-blur-md text-zinc-400 border border-white/5 hover:bg-zinc-800 transition-colors"
                  onPress={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                </Button>
              )}
            </div>

            <div
              className="absolute w-full h-full bottom-0 transition-transform duration-500 ease-out"
              style={{
                transform: `translateY(${(viewY / CANVAS_HEIGHT) * 100}%)`,
              }}
            >
              {gameState === "playing" && (
                <GhostMarkers highScores={highScores} username={username} />
              )}

              {blocks.map((block, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-sm shadow-sm border-t border-white/20 z-1 flex items-center justify-center overflow-hidden"
                  style={{
                    left: `${(block.x / CANVAS_WIDTH) * 100}%`,
                    bottom: `${((CANVAS_HEIGHT - block.y - BLOCK_HEIGHT) / CANVAS_HEIGHT) * 100}%`,
                    width: `${(block.width / CANVAS_WIDTH) * 100}%`,
                    height: `${((BLOCK_HEIGHT - 1) / CANVAS_HEIGHT) * 100}%`,
                    backgroundColor: block.color,
                  }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  {block.grow && (
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
                  {renderBlockIcon(block.width)}
                </motion.div>
              ))}

              {debris.map((d, i) => (
                <div
                  key={`debris-${i}`}
                  className="absolute rounded-sm shadow-lg border-t border-white/20 z-0"
                  style={{
                    left: `${(d.x / CANVAS_WIDTH) * 100}%`,
                    bottom: `${((CANVAS_HEIGHT - d.y - BLOCK_HEIGHT) / CANVAS_HEIGHT) * 100}%`,
                    width: `${(d.width / CANVAS_WIDTH) * 100}%`,
                    height: `${((BLOCK_HEIGHT - 1) / CANVAS_HEIGHT) * 100}%`,
                    backgroundColor: d.color,
                    transform: `rotate(${d.rotation}deg)`,
                    opacity: 0.8,
                  }}
                />
              ))}

              {currentBlock && gameState === "playing" && (
                <motion.div
                  className="absolute rounded-sm shadow-xl border-t border-white/40 z-10 flex items-center justify-center overflow-hidden"
                  style={{
                    left: `${(currentBlock.x / CANVAS_WIDTH) * 100}%`,
                    bottom: `${((CANVAS_HEIGHT - currentBlock.y - BLOCK_HEIGHT) / CANVAS_HEIGHT) * 100}%`,
                    width: `${(currentBlock.width / CANVAS_WIDTH) * 100}%`,
                    height: `${((BLOCK_HEIGHT - 1) / CANVAS_HEIGHT) * 100}%`,
                    backgroundColor: currentBlock.color,
                    boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)",
                    opacity: 0.9,
                  }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 animate-pulse bg-white/10" />
                  {renderBlockIcon(currentBlock.width)}
                </motion.div>
              )}
            </div>

            <Overlays
              showPerfect={showPerfect}
              showBonus={showBonus}
              lastBonus={lastBonus}
              lastImpactTime={lastImpactTime}
            />

            <GameMenus
              gameState={gameState}
              isPaused={isPaused}
              score={score}
              combos={combos}
              totalBonusScore={totalBonusScore}
              isSavingScore={isSavingScore}
              isLoggedIn={isLoggedIn}
              isSeasonActive={isSeasonActive}
              startGame={startGame}
              setGameState={setGameState}
              setIsPaused={setIsPaused}
              isGeneratingSession={isGeneratingSession}
            />
          </Card>

          <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
            <div className="flex gap-4 opacity-20">
              {[1, 2, 3, 4, 5].map((i) => (
                <ArrowUp key={i} size={16} />
              ))}
            </div>
          </div>

          <HeightsGuideModal isOpen={isOpen} onOpenChange={onOpenChange} />
        </div>
      );
    },
  ),
);

HeightsCanvas.displayName = "HeightsCanvas";
