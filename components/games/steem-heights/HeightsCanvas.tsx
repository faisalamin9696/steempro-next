"use client";

import { forwardRef } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Crown,
  RefreshCw,
  ArrowUp,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Info,
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
} from "./Config";

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
}

export const HeightsCanvas = forwardRef<HTMLDivElement, Props>(
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
    },
    ref,
  ) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const viewY = Math.max(0, (blocks.length - 10) * BLOCK_HEIGHT);

    return (
      <div className="flex flex-col gap-4 w-full max-w-[420px] group select-none">
        {/* Score Floating Panel */}
        <div className="px-2 flex justify-between items-end">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                Current Altitude
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
                className="text-zinc-500 hover:text-amber-500 transition-colors"
                title="How to Play"
              >
                <Info size={14} />
              </button>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black italic ">{score}m</span>
              <Button
                size="sm"
                variant="flat"
                onPress={scrollToLeaderboard}
                className="lg:hidden h-7 bg-zinc-300/50 dark:bg-zinc-900/50 text-zinc-400 font-bold uppercase text-[9px] tracking-widest px-3 rounded-full border border-white/5 active:scale-95 transition-all"
              >
                Leaderboard
              </Button>
            </div>
          </div>
          {gameState === "playing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-baseline gap-2 text-zinc-500"
            >
              <span className="text-xs font-black text-amber-500 font-mono">
                {(speed / 2).toFixed(1)}x
              </span>
              <span className="text-[10px] font-black uppercase font-mono">
                Wind
              </span>
            </motion.div>
          )}
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

          {/* Sound Toggle Overlay */}
          <div
            className="absolute top-4 right-4 z-20"
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
          </div>

          {/* Pause Toggle Overlay */}
          <div
            className="absolute top-4 left-4 z-20"
            onMouseDown={(e) => e.stopPropagation()}
          >
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
            {blocks.map((block, i) => (
              <motion.div
                key={i}
                className="absolute rounded-sm shadow-sm border-t border-white/20 z-1"
                style={{
                  left: `${(block.x / CANVAS_WIDTH) * 100}%`,
                  bottom: `${((CANVAS_HEIGHT - block.y - BLOCK_HEIGHT) / CANVAS_HEIGHT) * 100}%`,
                  width: `${(block.width / CANVAS_WIDTH) * 100}%`,
                  height: `${((BLOCK_HEIGHT - 1) / CANVAS_HEIGHT) * 100}%`,
                  backgroundColor: block.color,
                }}
              >
                {block.grow && (
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
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
                className="absolute rounded-sm shadow-xl border-t border-white/40 z-10"
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
                <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 animate-pulse bg-white/10" />
              </motion.div>
            )}
          </div>

          {/* Perfect Overlay */}
          <AnimatePresence>
            {showPerfect && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 0.6, y: -200, scale: 1.1 }}
                exit={{ opacity: 0, y: -250, scale: 1.3 }}
                className="absolute inset-x-0 bottom-1/2 pointer-events-none  flex items-center justify-center text-center"
              >
                <div className="text-amber-500 font-black italic tracking-widest text-5xl drop-shadow-[0_4px_20px_rgba(245,158,11,0.8)]">
                  PERFECT!
                </div>
              </motion.div>
            )}

            {showBonus && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 20, scale: 1 }}
                exit={{ opacity: 0, y: -40 }}
                className="absolute inset-x-0 top-20 pointer-events-none flex flex-col items-center justify-center text-center z-50"
              >
                <div className="text-amber-400 font-black italic tracking-tighter text-4xl drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                  +{lastBonus}m
                </div>
                <div className="text-white font-black text-sm uppercase tracking-[0.2em] -mt-1 drop-shadow-md">
                  COMBO BONUS
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Impact Flash */}
          <AnimatePresence>
            <motion.div
              key={lastImpactTime}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-white pointer-events-none z-40"
            />
          </AnimatePresence>

          {/* Game Over / Idle Overlays */}
          <AnimatePresence>
            {gameState !== "playing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm  flex flex-col items-center justify-center p-8 text-center"
              >
                {gameState === "idle" ? (
                  <div className="space-y-8">
                    <div className="p-4 bg-amber-500/20 rounded-full w-fit mx-auto">
                      <Gamepad2 size={48} className="text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black italic text-white">
                        READY TO RULE?
                      </h2>
                      <p className="text-zinc-500 text-sm font-bold">
                        Tap anywhere on the box to drop the block.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="bg-amber-500 text-black font-black px-12 h-14 rounded-2xl shadow-xl hover:scale-105 transition-transform"
                      onPress={startGame}
                    >
                      BEGIN THE CLIMB
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="relative">
                      <Crown size={64} className="text-zinc-800 mx-auto" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black mt-2 text-white">
                          {score}
                        </span>
                      </div>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">
                        Total Altitude
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">
                        Climb Ended
                      </h2>

                      {/* Stats Row */}
                      <div className="flex justify-center gap-4">
                        <div className="flex flex-col items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5 w-24">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                            Combos
                          </span>
                          <span className="text-xl font-black italic text-white">
                            {combos}
                          </span>
                        </div>
                        <div className="flex flex-col items-center bg-zinc-900/50 p-4 rounded-2xl border border-white/5 w-24">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                            Bonus
                          </span>
                          <span className="text-xl font-black italic text-amber-500">
                            +{totalBonusScore}m
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        {isSavingScore && (
                          <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold animate-pulse mt-1">
                            <RefreshCw size={12} className="animate-spin" />
                            RECORDING ON BLOCKCHAIN...
                          </div>
                        )}
                        {!isLoggedIn && isSeasonActive && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full mt-2">
                            LOGIN TO RECORD SCORE ON BLOCKCHAIN
                          </div>
                        )}
                        {!isSeasonActive && (
                          <div className="bg-zinc-800/50 border border-white/5 text-zinc-400 text-[10px] font-bold px-3 py-1 rounded-full mt-2">
                            SEASON INACTIVE • SCORE NOT RECORDED
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        size="lg"
                        className="bg-amber-500 text-black font-black w-full h-14 rounded-2xl shadow-xl"
                        onPress={startGame}
                        isDisabled={isSavingScore}
                      >
                        <RefreshCw size={20} className="mr-2" /> TRY AGAIN
                      </Button>
                      <Button
                        variant="light"
                        className="text-zinc-500 font-bold"
                        onPress={() => setGameState("idle")}
                        isDisabled={isSavingScore}
                      >
                        MAIN MENU
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {isPaused && gameState === "playing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="space-y-8">
                  <div className="p-4 bg-amber-500/20 rounded-full w-fit mx-auto">
                    <Pause
                      size={48}
                      className="text-amber-500 fill-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black italic text-white">
                      GAME PAUSED
                    </h2>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
                      Take a breather, Champion.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-white text-black font-black px-12 h-16 rounded-2xl shadow-xl hover:scale-105 transition-transform"
                    onPress={() => setIsPaused(false)}
                  >
                    <Play size={20} className="mr-2 fill-black" /> RESUME CLIMB
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
);

HeightsCanvas.displayName = "HeightsCanvas";
