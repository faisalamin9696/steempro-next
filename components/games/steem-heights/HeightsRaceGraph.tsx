"use client";

import { motion } from "framer-motion";
import SAvatar from "@/components/ui/SAvatar";
import SUsername from "@/components/ui/SUsername";
import { HighScore } from "./Config";
import { Trophy } from "lucide-react";

interface Props {
  highScores: HighScore[];
}

export const HeightsRaceGraph = ({ highScores }: Props) => {
  // Take top 8 for the vertical race graph to ensure they fit side-by-side
  const topClimbers = highScores.slice(0, 8);
  const maxScore =
    topClimbers.length > 0 ? Math.max(...topClimbers.map((c) => c.score)) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-300/20 dark:bg-zinc-900/40 border border-white/5 rounded-3xl p-6 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary-500/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
            <Trophy
              size={14}
              className="text-primary-500"
              fill="currentColor"
            />
            Summit Race
          </h3>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-none">
            Top 8 Climbers
          </p>
        </div>

        <div className="h-48 flex items-end justify-between gap-1 sm:gap-4 px-2">
          {topClimbers.map((climber, idx) => {
            const percentage =
              maxScore > 0 ? (climber.score / maxScore) * 100 : 0;
            const isTop3 = idx < 3;

            return (
              <div
                key={climber.player}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
              >
                <div className="w-1.5 sm:w-3 flex-1 flex flex-col justify-end bg-black/10 dark:bg-black/30 rounded-full relative border border-white/5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{
                      duration: 1.5,
                      ease: "easeOut",
                      delay: idx * 0.08,
                    }}
                    className={`w-full relative rounded-full ${
                      idx === 0
                        ? "bg-linear-to-t from-amber-500 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : idx === 1
                          ? "bg-linear-to-t from-zinc-500 to-zinc-300"
                          : idx === 2
                            ? "bg-linear-to-t from-orange-500 to-orange-400"
                            : "bg-linear-to-t from-primary-600/60 to-primary-400/60"
                    }`}
                  >
                    {/* Glowing head at the TOP */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-linear-to-b from-white/40 to-transparent rounded-full" />

                    {/* Avatar at the peak */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 + idx * 0.08 }}
                      className="absolute -top-5 left-1/2 -translate-x-1/2 z-10"
                    >
                      <div className="relative group-hover:scale-110 transition-transform">
                        <SAvatar
                          username={climber.player}
                          size="xs"
                          radius="full"
                          isBordered
                          className="ring-1"
                        />
                        {/* Score Tooltip-style label */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 rounded px-1.5 py-1 pointer-events-none whitespace-nowrap shadow-xl">
                          <div className="flex flex-col text-[10px]  text-white">
                            <p>{climber.player}</p>

                            <p className="font-black tabular-nums">
                              {climber.score}m
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Rank & Mini Username */}
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={`text-[10px] font-black ${isTop3 ? "text-primary-500" : "text-zinc-600"}`}
                  >
                    #{idx + 1}
                  </span>
                  <div className="hidden sm:block">
                    <SUsername
                      username={`@${climber.player}`}
                      className="text-[10px] font-bold text-zinc-500 max-w-[40px] truncate"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
