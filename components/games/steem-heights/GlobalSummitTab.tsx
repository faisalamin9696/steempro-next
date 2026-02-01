"use client";

import React from "react";
import {
  Trophy,
  Target,
  History,
  ArrowUpRight,
  Users,
  Zap,
  Cloud,
} from "lucide-react";
import Link from "next/link";
import SAvatar from "@/components/ui/SAvatar";
import SUsername from "@/components/ui/SUsername";
import { DataTable } from "@/components/ui/data-table";
import { HighScore, GameStats } from "./Config";
import { motion } from "framer-motion";

interface Props {
  currentSeason: number;
  isSeasonActive: boolean;
  highScores: HighScore[];
  seasonPost: any | null;
  globalStats: GameStats;
}

export const GlobalSummitTab = ({
  currentSeason,
  isSeasonActive,
  highScores,
  seasonPost,
  globalStats,
}: Props) => {
  return (
    <div className="space-y-12">
      {/* Season Badge & Status */}
      <div className="flex flex-col items-center gap-6">
        <Link
          href={
            seasonPost ? `/@${seasonPost.author}/${seasonPost.permlink}` : "#"
          }
          className="px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 hover:bg-amber-500/20 transition-all group/season"
        >
          <Trophy
            size={12}
            className="text-amber-500 group-hover/season:scale-110 transition-transform"
          />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Season {currentSeason} Summit
          </span>
          <ArrowUpRight
            size={10}
            className="text-amber-500/50 group-hover/season:text-amber-500 transition-colors"
          />
        </Link>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
          {[
            {
              label: "Total Climbers",
              value: globalStats.totalParticipants,
              icon: Users,
              color: "text-blue-500",
            },
            {
              label: "Active (24h)",
              value: globalStats.activePlayers24h,
              icon: Zap,
              color: "text-amber-500",
            },
            {
              label: "Total Ascent",
              value: `${globalStats.totalAltitude.toLocaleString()}m`,
              icon: Cloud,
              color: "text-emerald-500",
            },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="bg-zinc-300/50 dark:bg-zinc-900/50 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-1 hover:border-white/10 transition-colors"
            >
              <stat.icon size={14} className={stat.color} />
              <div className="text-sm font-black">{stat.value}</div>
              <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter text-center">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {!isSeasonActive && (
          <div className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
            <div className="p-2 rounded-full bg-red-500/10 text-red-500">
              <Target size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-white">
                Season Inactive
              </span>
              <span className="text-[10px] font-medium text-zinc-500">
                Scores are currently not being recorded for Season{" "}
                {currentSeason}.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Podium */}
      {highScores.length > 0 && (
        <div className="flex justify-center items-end gap-2 px-2 pb-8">
          {/* 2nd Place */}
          {highScores[1] && (
            <div className="flex flex-col items-center gap-2 w-24">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-t from-blue-500/20 to-transparent rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500" />
                <SAvatar
                  radius="full"
                  size="md"
                  quality="medium"
                  username={highScores[1].player}
                  className="border-2 border-blue-500/30 grayscale-[0.5] group-hover:grayscale-0 transition-all"
                />
                <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-blue-500/50 rounded-full p-0.5">
                  🥈
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <SUsername
                  className="text-[10px] font-bold text-zinc-400 max-w-[80px] truncate"
                  username={`@${highScores[1].player}`}
                />
                <div className="flex flex-col items-center mt-0.5">
                  <span className="text-[11px] font-black text-blue-500 leading-none">
                    {highScores[1].score}m
                  </span>
                  <div className="flex flex-col items-center gap-0.5 mt-1">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter leading-none">
                      {highScores[1].plays} Plays
                    </span>
                    {(highScores[1].combos ?? 0) > 0 && (
                      <span className="text-[7px] font-black text-amber-500/80 uppercase tracking-wider bg-amber-500/5 px-1 rounded-sm border border-amber-500/10">
                        {highScores[1].combos} Combos
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {highScores[0] && (
            <div className="flex flex-col items-center gap-3 w-28 -mt-6">
              <div className="relative group">
                <div className="absolute -inset-2 bg-linear-to-t from-amber-500/30 to-transparent rounded-full blur-md opacity-50 group-hover:opacity-100 transition duration-500" />
                <SAvatar
                  radius="full"
                  size="lg"
                  quality="medium"
                  username={highScores[0].player}
                  className="border-2 border-amber-500 scale-110 shadow-2xl transition-transform group-hover:scale-115"
                />
                <div className="absolute -bottom-2 -right-2 bg-zinc-900 border-1 border-amber-500 rounded-full p-2 shadow-lg">
                  <Trophy
                    size={14}
                    className="text-amber-500 fill-amber-500/20"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <SUsername
                  className="text-xs font-black text-amber-500 tracking-tight max-w-[100px] truncate"
                  username={`@${highScores[0].player}`}
                />
                <div className="flex flex-col items-center mt-0.5">
                  <span className="text-sm font-black drop-shadow-sm leading-none">
                    {highScores[0].score}m
                  </span>
                  <div className="flex flex-col items-center gap-0.5 mt-1">
                    <span className="text-[8px] font-black uppercase tracking-tighter text-amber-500/70 leading-none">
                      {highScores[0].plays} Plays
                    </span>
                    {(highScores[0].combos ?? 0) > 0 && (
                      <span className="text-[7px] font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                        {highScores[0].combos} Combos
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {highScores[2] && (
            <div className="flex flex-col items-center gap-2 w-24">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-t from-cyan-500/20 to-transparent rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500" />
                <SAvatar
                  radius="full"
                  size="md"
                  quality="medium"
                  username={highScores[2].player}
                  className="border-2 border-cyan-500/30 grayscale-[0.5] group-hover:grayscale-0 transition-all"
                />
                <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-cyan-500/50 rounded-full p-0.5">
                  🥉
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <SUsername
                  className="text-[10px] font-bold text-zinc-400 max-w-[80px] truncate"
                  username={`@${highScores[2].player}`}
                />
                <div className="flex flex-col items-center mt-0.5">
                  <span className="text-[11px] font-black text-cyan-500 leading-none">
                    {highScores[2].score}m
                  </span>
                  <div className="flex flex-wrap items-center gap-0.5 mt-1 justify-center">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter leading-none">
                      {highScores[2].plays} Plays
                    </span>
                    {(highScores[2].combos ?? 0) > 0 && (
                      <span className="text-[7px] font-black text-amber-500/80 uppercase tracking-wider bg-amber-500/5 px-1 rounded-sm border border-amber-500/10">
                        {highScores[2].combos} Combos
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-2">
        <DataTable
          data={highScores.slice(3)}
          columns={[
            {
              key: "rank",
              header: "#",
              className: "w-10 px-2 py-2",
              render: (_, __, i) => (
                <span className="text-[10px] font-black text-muted">
                  {i + 4 < 10 ? `0${i + 4}` : i + 4}
                </span>
              ),
            },
            {
              key: "player",
              header: "Player",
              className: "px-2 py-2",
              render: (player) => (
                <div className="flex items-center gap-2">
                  <SAvatar radius="full" size={"xs"} username={player} />
                  <SUsername
                    className="text-xs font-bold text-muted"
                    username={`@${player}`}
                  />
                </div>
              ),
            },
            {
              key: "score",
              header: "Altitude",
              className: "px-2 py-2",
              render: (score) => (
                <span className="text-xs font-black text-white bg-zinc-800 px-2 py-0.5 rounded-md">
                  {score}m
                </span>
              ),
            },
            {
              key: "plays",
              header: "Plays",
              className: "px-2 py-2",
              render: (plays, row) => (
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                    <History size={10} className="text-zinc-600" />
                    {row.plays} Plays
                  </span>
                  {(row.combos ?? 0) > 0 && (
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-sm">
                      <Target size={10} />
                      <span className="text-[8px] font-black uppercase tracking-wider">
                        {row.combos} Combos
                      </span>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
          initialLoadCount={10}
          loadMoreCount={10}
          emptyMessage={
            highScores.length === 0
              ? "Be the first to scale the heights!"
              : "No more climbers in this range."
          }
        />
      </div>
    </div>
  );
};
