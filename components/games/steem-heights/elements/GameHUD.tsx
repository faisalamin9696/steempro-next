"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Heart, Shield, Zap } from "lucide-react";
import { Button } from "@heroui/button";
import { PowerUp } from "../Config";

interface GameHUDProps {
  score: number;
  lives: number;
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
    activePowerUp,
    gameState,
    windDrift,
    onOpenGuide,
    scrollToLeaderboard,
  }: GameHUDProps) => {
    return (
      <div className="px-2 flex justify-between items-end">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
              Current Altitude
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenGuide();
              }}
              className="text-zinc-500 hover:text-amber-500 transition-colors"
              title="How to Play"
            >
              <Info size={14} />
            </button>
          </div>
          <div className="flex items-end gap-3">
            <span className="sm:text-4xl text-2xl font-black italic ">
              {score}m
            </span>
            <div className="flex gap-1 mb-1">
              <AnimatePresence>
                {Array.from({ length: lives }).map((_, i) => (
                  <motion.div
                    key={`heart-${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                  >
                    <Heart size={14} fill="currentColor" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {activePowerUp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full mb-1"
                >
                  <div className="text-amber-500 animate-pulse">
                    {activePowerUp.type === "wind_shield" && (
                      <Shield size={12} fill="currentColor" />
                    )}
                    {activePowerUp.type === "slow_motion" && (
                      <Zap size={12} fill="currentColor" />
                    )}
                    {activePowerUp.type === "extra_gear" && (
                      <Heart size={12} fill="currentColor" />
                    )}
                  </div>
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">
                    {activePowerUp.name}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
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
              {windDrift === 0
                ? "OFF"
                : `${Math.abs(windDrift * 10).toFixed(1)} ${windDrift > 0 ? "→" : "←"}`}
            </span>
            <span className="text-[10px] font-black uppercase font-mono">
              Wind
            </span>
          </motion.div>
        )}
      </div>
    );
  },
);
