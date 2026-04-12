"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  ChevronRight,
  User
} from "lucide-react";
import { HighScore } from "../Config";

interface LandmarksBarProps {
  score: number;
  highScores: HighScore[];
}

export const LandmarksBar = memo(({ score, highScores }: LandmarksBarProps) => {
  const topThree = useMemo(() => {
    return highScores.slice(0, 3).reverse(); // Reverse so Rank 1 is on far right
  }, [highScores]);

  const maxGoal = useMemo(() => {
    const highestInView = Math.max(score, ...topThree.map(h => h.score));
    return highestInView > 0 ? highestInView * 1.1 : 500; // Use highest plus buffer
  }, [score, topThree]);

  const progress = Math.min(100, (score / maxGoal) * 100);

  const nearestCompetitor = useMemo(() => {
    return topThree.find(h => h.score > score) || null;
  }, [score, topThree]);

  return (
    <div className="w-full bg-zinc-300/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/5 p-3 rounded-2xl sm:rounded-3xl shadow-xl">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
            {nearestCompetitor ? "Next Target" : "Elite Status"}
          </span>
          {nearestCompetitor && (
             <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px]">
                <User size={10} />
                <span>@{nearestCompetitor.player}</span>
                <span className="text-[8px] text-zinc-500 lowercase">
                    — {nearestCompetitor.score}m
                </span>
             </div>
          )}
        </div>
        <span className="text-[10px] font-black text-zinc-400 italic">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="relative h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
        {/* Fill */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", bounce: 0, duration: 1 }}
        />

        {/* Competitor Markers */}
        {topThree.map((h, i) => {
          const pos = (h.score / maxGoal) * 100;
          const isRank1 = i === 2;
          return (
            <div
              key={h.player}
              className={`absolute top-0 bottom-0 w-px z-10 ${isRank1 ? 'bg-amber-500' : 'bg-zinc-500'}`}
              style={{ left: `${pos}%` }}
            >
                <div className="absolute top-0 -translate-x-1/2 -translate-y-full pb-1">
                    {i === 2 && <Crown size={10} className="text-amber-500" />}
                    {i === 1 && <Trophy size={10} className="text-zinc-400" />}
                    {i === 0 && <Medal size={10} className="text-amber-700" />}
                </div>
            </div>
          );
        })}

        {/* Current Player Marker */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
          animate={{ left: `${progress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="absolute bottom-1 bg-amber-500 text-black text-[7px] font-black px-1 rounded-sm shadow-lg whitespace-nowrap">
                {score}m
            </div>
        </motion.div>
      </div>

      {/* Rank Labels Row */}
      <div className="flex justify-between mt-4 px-1 relative h-4">
        {topThree.map((h, i) => {
          const pos = (h.score / maxGoal) * 100;
          return (
            <div
              key={`label-${h.player}`}
              className="absolute text-[8px] font-black whitespace-nowrap -translate-x-1/2 leading-none"
              style={{ left: `${pos}%` }}
            >
                <span className="text-zinc-500">#{3-i} </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
