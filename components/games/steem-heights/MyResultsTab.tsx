"use client";

import React from "react";
import { ScrollShadow } from "@heroui/react";
import { HighScore } from "./Config";
import {
  Trophy,
  History,
  Target,
  TrendingUp,
  Share2,
  Award,
} from "lucide-react";
import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { ActivityPublishModal } from "./ActivityPublishModal";
import { motion } from "framer-motion";
import { calculateRewards } from "./GlobalSummitTab";
import {
  REWARD_MIN_ALTITUDE,
  REWARD_MIN_PLAYS,
  REWARD_RANK_CUTOFF,
} from "./Config";
import { getRewardPool, getCoopConfig } from "./HeightsInfo";
import { getCommunityReward } from "./GlobalSummitTab";
import { PerformanceChart } from "./PerformanceChart";

interface Props {
  userHistory: HighScore[];
  username: string;
  highScores: HighScore[];
  seasonPost: any | null;
}

export const MyResultsTab = ({
  userHistory,
  username,
  highScores,
  seasonPost,
}: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const coopConfig = getCoopConfig(seasonPost);
  const totalLeaderboardAltitude = highScores.reduce(
    (acc, cur) => acc + (cur.score || 0),
    0,
  );
  const postPool = getRewardPool(seasonPost)?.reward ?? 0;
  const communityPool = getCommunityReward(
    totalLeaderboardAltitude,
    coopConfig,
  );
  const activePool = Math.max(postPool, communityPool);

  const { rewardMap } = calculateRewards(highScores, seasonPost, activePool);
  const userReward = rewardMap.get(username) || 0;
  const symbol = getRewardPool(seasonPost)?.symbol || "STEEM";

  const bestScore =
    userHistory.length > 0 ? Math.max(...userHistory.map((h) => h.score)) : 0;

  const totalPlays = userHistory.length;
  const totalCombos = userHistory.reduce(
    (acc, curr) => acc + (curr.combos || 0),
    0,
  );
  const avgAltitude =
    totalPlays > 0
      ? Math.round(
          userHistory.reduce((acc, curr) => acc + curr.score, 0) / totalPlays,
        )
      : 0;

  const isQualified =
    bestScore >= REWARD_MIN_ALTITUDE ||
    (bestScore >= 10 && totalPlays >= REWARD_MIN_PLAYS);

  const userRank = highScores.findIndex((h) => h.player === username) + 1;
  const isInTopCutoff = userRank > 0 && userRank <= REWARD_RANK_CUTOFF;

  return (
    <div className="space-y-6 pt-2">
      {/* Personal Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Plays",
            value: totalPlays,
            icon: History,
            color: "text-blue-500",
          },
          {
            label: "Best Altitude",
            value: `${bestScore}m`,
            icon: Trophy,
            color: "text-amber-500",
          },
          {
            label: "Avg Altitude",
            value: `${avgAltitude}m`,
            icon: TrendingUp,
            color: "text-emerald-500",
          },
          {
            label: "Total Combos",
            value: totalCombos,
            icon: Target,
            color: "text-indigo-500",
          },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label}
            className="bg-zinc-300/50 dark:bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col items-center gap-1"
          >
            <stat.icon size={12} className={stat.color} />
            <div className="text-sm font-black">{stat.value}</div>
            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest text-center">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Score History Chart */}
      <PerformanceChart userHistory={userHistory} />

      {/* Reward Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center gap-2 text-center"
      >
        <Award size={20} className="text-emerald-500" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/70">
            Estimated Seasonal Reward
          </span>
          <span className="text-xl font-black">
            {userReward.toFixed(3)} {symbol}
          </span>
        </div>

        {!isQualified || !isInTopCutoff ? (
          <p className="text-[10px] text-zinc-500 font-medium max-w-[250px]">
            {!isQualified
              ? `Keep climbing! Reach ${REWARD_MIN_ALTITUDE}m altitude OR ${REWARD_MIN_PLAYS} plays with 10m+ altitude to qualify.`
              : `You're qualified! Now break into the Top ${REWARD_RANK_CUTOFF} to secure your share of the pool.`}
          </p>
        ) : (
          <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider">
            You are qualified and earning!
          </p>
        )}
      </motion.div>

      <div className="flex justify-between items-center px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          Recent Activity
        </h3>
        <Button
          size="sm"
          onPress={onOpen}
          className="h-7 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-full font-black uppercase text-[8px] tracking-widest transition-all"
          startContent={<Share2 size={10} />}
        >
          Publish Activity
        </Button>
      </div>

      <ScrollShadow className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
        {userHistory.map((hs, i) => {
          const isLatest = i === 0;
          const isBest = hs.score === bestScore && bestScore > 0;

          return (
            <div
              key={i}
              className="flex justify-between items-center group py-1"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black">
                    Altitude: {hs.score}m
                  </span>
                  {(hs.combos ?? 0) > 0 && (
                    <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-1 rounded-sm border border-amber-500/10">
                      {hs.combos} Combos
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted font-medium">
                  {new Date(hs.created_at || "").toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                {isBest && (
                  <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Best
                  </span>
                )}
                {isLatest && (
                  <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Latest
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {userHistory.length === 0 && (
          <p className="text-xs text-zinc-600 italic py-4">
            No climbs recorded yet. Start your journey!
          </p>
        )}
      </ScrollShadow>

      <ActivityPublishModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        username={username}
        userHistory={userHistory}
      />
    </div>
  );
};
