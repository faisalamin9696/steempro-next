"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/button";
import { Gamepad2, Crown, RefreshCw, Pause, Play } from "lucide-react";

interface GameMenusProps {
  gameState: "idle" | "playing" | "gameover";
  isPaused: boolean;
  score: number;
  combos: number;
  totalBonusScore: number;
  isSavingScore: boolean;
  isLoggedIn: boolean;
  isSeasonActive: boolean;
  startGame: () => void;
  setGameState: (state: "idle") => void;
  setIsPaused: (isPaused: boolean) => void;
  isGeneratingSession?: boolean;
}

export const GameMenus = memo(
  ({
    gameState,
    isPaused,
    score,
    combos,
    totalBonusScore,
    isSavingScore,
    isLoggedIn,
    isSeasonActive,
    startGame,
    setGameState,
    setIsPaused,
    isGeneratingSession,
  }: GameMenusProps) => {
    return (
      <AnimatePresence>
        {gameState !== "playing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm  flex flex-col items-center justify-center p-6 pt-14 text-center z-40"
          >
            {gameState === "idle" ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="p-3 sm:p-4 bg-amber-500/20 rounded-full w-fit mx-auto">
                  <Gamepad2
                    size={40}
                    className="text-amber-500 sm:w-12 sm:h-12"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black italic text-white uppercase tracking-tight">
                    READY TO RULE?
                  </h2>
                  <p className="text-zinc-500 text-xs sm:text-sm font-bold">
                    Tap anywhere on the box to drop the block.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-amber-500 text-black font-black px-8 sm:px-12 h-12 sm:h-14 rounded-2xl shadow-xl hover:scale-105 transition-transform text-sm sm:text-base"
                  onPress={startGame}
                >
                  BEGIN THE CLIMB
                </Button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-8">
                <div className="relative">
                  <Crown
                    size={48}
                    className="text-zinc-800 mx-auto sm:w-16 sm:h-16"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-black mt-1 sm:mt-2 text-white">
                      {score}
                    </span>
                  </div>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-[8px] sm:text-[9px]">
                    Total Altitude
                  </p>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-black italic text-white uppercase tracking-tight">
                    Climb Ended
                  </h2>

                  <div className="flex justify-center gap-2 sm:gap-4">
                    <div className="flex flex-col items-center bg-zinc-900/50 p-3 sm:p-4 rounded-2xl border border-white/5 w-20 sm:w-24">
                      <span className="text-[8px] sm:text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5 sm:mb-1">
                        Combos
                      </span>
                      <span className="text-lg sm:text-xl font-black italic text-white">
                        {combos}
                      </span>
                    </div>
                    <div className="flex flex-col items-center bg-zinc-900/50 p-3 sm:p-4 rounded-2xl border border-white/5 w-20 sm:w-24">
                      <span className="text-[8px] sm:text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5 sm:mb-1">
                        Bonus
                      </span>
                      <span className="text-lg sm:text-xl font-black italic text-amber-500">
                        +{totalBonusScore}m
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    {isSavingScore && (
                      <div className="flex items-center gap-2 text-amber-500 text-[8px] sm:text-[10px] font-bold animate-pulse mt-1">
                        <RefreshCw
                          size={10}
                          className="animate-spin sm:w-3 sm:h-3"
                        />
                        RECORDING ON BLOCKCHAIN...
                      </div>
                    )}
                    {!isLoggedIn && isSeasonActive && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 rounded-full mt-1 sm:mt-2">
                        LOGIN TO RECORD SCORE ON BLOCKCHAIN
                      </div>
                    )}
                    {!isSeasonActive && (
                      <div className="bg-zinc-800/50 border border-white/5 text-zinc-400 text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 rounded-full mt-1 sm:mt-2">
                        SEASON INACTIVE • SCORE NOT RECORDED
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <Button
                    size="lg"
                    className="bg-amber-500 text-black font-black w-full h-12 sm:h-14 rounded-2xl shadow-xl text-sm sm:text-base"
                    onPress={startGame}
                    isDisabled={isSavingScore}
                  >
                    <RefreshCw size={18} className="mr-2 sm:w-5 sm:h-5" /> TRY
                    AGAIN
                  </Button>
                  <Button
                    variant="light"
                    className="text-zinc-500 font-bold text-xs sm:text-sm h-10"
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
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-60"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-6 sm:space-y-8">
              <div className="p-3 sm:p-4 bg-amber-500/20 rounded-full w-fit mx-auto">
                <Pause
                  size={40}
                  className="text-amber-500 fill-amber-500 sm:w-12 sm:h-12"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black italic text-white uppercase tracking-tight">
                  PAUSED
                </h2>
                <p className="text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-widest px-4">
                  Take a breather, Champion.
                </p>
              </div>
              <Button
                size="lg"
                className="bg-white text-black font-black px-10 sm:px-12 h-14 sm:h-16 rounded-2xl shadow-xl hover:scale-105 transition-transform text-sm sm:text-base"
                onPress={() => setIsPaused(false)}
              >
                <Play size={18} className="mr-2 fill-black sm:w-5 sm:h-5" />{" "}
                RESUME
              </Button>
            </div>
          </motion.div>
        )}
        {isGeneratingSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-70"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative p-6 bg-zinc-900 rounded-3xl border border-white/5 flex justify-center">
                  <RefreshCw
                    size={40}
                    className="text-amber-500 animate-spin"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">
                  Preparing Ascent
                </h2>
                <div className="flex items-center justify-center gap-2 text-zinc-500 text-[10px] font-bold tracking-widest uppercase">
                  <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping" />
                  Generating Secure Session
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
