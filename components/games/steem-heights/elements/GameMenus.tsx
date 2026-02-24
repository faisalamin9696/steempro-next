"use client";

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
}

export const GameMenus = ({
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
            <div className="space-y-6">
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
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-60"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="space-y-8">
            <div className="p-4 bg-amber-500/20 rounded-full w-fit mx-auto">
              <Pause size={48} className="text-amber-500 fill-amber-500" />
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
  );
};
