"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Heart, Shield, Zap } from "lucide-react";
import { Button } from "@heroui/button";
import { PowerUp } from "../Config";
import { useTranslations } from "next-intl";

interface GameHUDProps {
  score: number;
  lives: number;
  timeLeft: number;
  activePowerUp: PowerUp | null;
  gameState: "idle" | "playing" | "gameover";
  windDrift: number;
  onOpenGuide: () => void;
  scrollToLeaderboard?: () => void;
}

export const GameHUD = memo(
  ({
    score,
    lives,
    timeLeft,
    activePowerUp,
    gameState,
    windDrift,
    onOpenGuide,
    scrollToLeaderboard,
  }: GameHUDProps) => {
    const t = useTranslations("Games.steemHeights");

    return (
      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-zinc-200 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-3xl mb-1 sm:mb-2 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Main Score Display */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[8px] sm:text-[9px] text-zinc-500 font-black uppercase tracking-widest sm:tracking-[0.2em]">
                {t("canvas.altitude")}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenGuide();
                }}
                className="text-zinc-600 hover:text-amber-500 transition-colors"
                title={t("canvas.howToPlay")}
              >
                <Info size={10} className="sm:w-3 sm:h-3" />
              </button>
            </div>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className="text-xl sm:text-3xl font-black italic tracking-tighter drop-shadow-sm">
                {score}
              </span>
              <span className="text-xs sm:text-sm font-black italic text-zinc-500">
                m
              </span>
            </div>
          </div>

          {/* Stats Divider - Hidden on very small screens if compact */}
          <div className="hidden sm:block w-px h-8 dark:bg-white/5 bg-black/5" />

          {/* Hearts & Powerups */}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            <div className="flex gap-0.5 sm:gap-1">
              <AnimatePresence>
                {Array.from({ length: lives }).map((_, i) => (
                  <motion.div
                    key={`heart-${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  >
                    <Heart
                      size={12}
                      className="sm:w-[14px] sm:h-[14px]"
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {activePowerUp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-md sm:rounded-lg border border-amber-500/20"
                >
                  <div className="text-amber-500">
                    {activePowerUp.type === "wind_shield" && (
                      <Shield
                        size={8}
                        className="sm:w-[10px] sm:h-[10px]"
                        fill="currentColor"
                      />
                    )}
                    {activePowerUp.type === "slow_motion" && (
                      <Zap
                        size={8}
                        className="sm:w-[10px] sm:h-[10px]"
                        fill="currentColor"
                      />
                    )}
                    {activePowerUp.type === "extra_gear" && (
                      <Heart
                        size={8}
                        className="sm:w-[10px] sm:h-[10px]"
                        fill="currentColor"
                      />
                    )}
                  </div>
                  <span className="text-[7px] sm:text-[8px] font-black text-amber-500/80 uppercase tracking-widest whitespace-nowrap">
                    {t(`leaderboard.lab.items.powerups.${activePowerUp.id}.name`)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section: Wind & Leaderboard */}
        <div className="flex items-center gap-3 sm:gap-4">
          {gameState === "playing" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col items-end"
            >
              <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                <span className="text-[8px] sm:text-[9px] text-zinc-500 font-black uppercase tracking-widest sm:tracking-[0.2em]">
                  {t("canvas.wind")}
                </span>
                <div
                  className={`w-1 sm:h-1.5 sm:w-1.5 h-1 rounded-full ${windDrift === 0 ? "bg-zinc-700" : "bg-amber-500 animate-pulse"}`}
                />
              </div>
              <span className="text-xs sm:text-sm font-black tabular-nums">
                {windDrift === 0
                  ? "--"
                  : `${Math.abs(windDrift * 10).toFixed(1)} ${windDrift > 0 ? "→" : "←"}`}
              </span>
            </motion.div>
          )}

          <Button
            size="sm"
            variant="flat"
            onPress={scrollToLeaderboard}
            className="lg:hidden h-7 sm:h-9 px-3 sm:px-4 bg-black/10 dark:bg-white/5 hover:bg-white/10 font-black uppercase text-[8px] sm:text-[10px] tracking-widest rounded-xl sm:rounded-2xl border border-white/5 active:scale-95 transition-all"
          >
            {t("canvas.rankings")}
          </Button>
        </div>
      </div>
    );
  },
);
