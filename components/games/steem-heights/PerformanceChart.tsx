"use client";

import React from "react";
import { motion } from "framer-motion";
import { HighScore } from "./Config";

interface PerformanceChartProps {
  userHistory: HighScore[];
}

export const PerformanceChart = ({ userHistory }: PerformanceChartProps) => {
  if (userHistory.length === 0) return null;

  // Process history into daily bests
  const dailyStats = userHistory.reduce(
    (acc, curr) => {
      const dateObj = new Date(curr.created_at || "");
      const date = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const time = dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      if (!acc[date]) acc[date] = { score: 0, attempts: 0, bestTime: "" };

      if (curr.score >= acc[date].score) {
        acc[date].score = curr.score;
        acc[date].bestTime = time;
      }

      acc[date].attempts += 1;
      return acc;
    },
    {} as Record<string, { score: number; attempts: number; bestTime: string }>,
  );

  const chartData = Object.entries(dailyStats)
    .map(([date, stats]) => ({ date, ...stats }))
    .reverse()
    .slice(-7); // Last 7 days

  const maxChartScore = Math.max(...chartData.map((d) => d.score), 10);
  const chartHeight = 120;

  return (
    <div className="bg-zinc-300/50 dark:bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
          Performance Trend
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
              Peak Altitude
            </span>
          </div>
        </div>
      </div>
      <div className="relative h-[150px] w-full flex items-end gap-1 px-2 pt-8">
        {/* Y-Axis Labels & Grid */}
        <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none pr-2">
          {[1, 0.5, 0].map((p, i) => (
            <div key={i} className="flex items-center gap-3 w-full group">
              <span className="text-[8px] font-bold text-zinc-600 w-8 text-right tabular-nums">
                {Math.round(p * maxChartScore)}m
              </span>
              <div className="flex-1 h-px bg-zinc-400/10 border-t border-dashed border-zinc-500/10" />
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="flex-1 h-full flex items-end justify-around relative z-10">
          {chartData.map((d, i) => {
            const barHeightPercentage = (d.score / maxChartScore) * 100;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-50">
                  <div className="bg-zinc-950 border border-white/10 rounded-lg p-2 shadow-2xl min-w-[100px] text-center backdrop-blur-md">
                    <p className="text-[10px] font-semibold text-white uppercase tracking-tighter">
                      {d.attempts} attempts • {d.score}m
                    </p>
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase mt-0.5">
                      Best at {d.bestTime}
                    </p>
                    <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-zinc-950" />
                  </div>
                </div>

                {/* Animated Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeightPercentage}%` }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: [0.33, 1, 0.68, 1],
                  }}
                  className="w-4 sm:w-6 bg-linear-to-t from-emerald-600 to-emerald-400 rounded-t-sm sm:rounded-t-md relative group-hover:brightness-125 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>

                {/* X-Axis Label */}
                <div className="absolute top-full mt-3 text-[8px] font-black text-zinc-500 uppercase tracking-tighter whitespace-nowrap">
                  {d.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-4" /> {/* Spacer for labels */}
    </div>
  );
};
