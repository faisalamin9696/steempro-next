"use client";

import { useState, useMemo } from "react";
import { ScrollShadow } from "@heroui/react";
import { HighScore } from "./Config";
import {
  Trophy,
  History,
  Target,
  TrendingUp,
  Share2,
  Award,
  Filter,
  BarChart2,
  Mountain,
  Gamepad2,
  Target as PrecisionIcon,
  RefreshCw,
  Info,
} from "lucide-react";
import { Progress } from "@heroui/progress";
import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { ActivityPublishModal } from "./ActivityPublishModal";
import { motion, AnimatePresence } from "framer-motion";
import { getSeasonFromTitle } from "@/hooks/games/useHeights";
import { calculateRewards } from "./GlobalSummitTab";
import {
  REWARD_MIN_ALTITUDE,
  REWARD_MIN_PLAYS,
  REWARD_RANK_CUTOFF,
} from "./Config";
import { getRewardPool, getCoopConfig } from "./HeightsInfo";
import { getCommunityReward } from "./GlobalSummitTab";
import { PerformanceChart } from "./PerformanceChart";

import { DAILY_CHALLENGES } from "./Config";
import { Zap, CheckCircle2 } from "lucide-react";

interface Props {
  userHistory: HighScore[];
  username: string;
  highScores: HighScore[];
  seasonPost: any | null;
  currentSeason: number;
  seasonalHistory: any[];
  energy: number;
  dailyProgress: {
    ascent: number;
    combos: number;
    plays: number;
    lastReset: string;
    claimed: string[];
  };
  claimChallenge: (id: string) => void;
  syncingChallengeId: string | null;
}

export const MyResultsTab = ({
  userHistory,
  username,
  highScores,
  seasonPost,
  currentSeason,
  seasonalHistory,
  energy,
  dailyProgress,
  claimChallenge,
  syncingChallengeId,
}: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedSeason, setSelectedSeason] = useState<number>(currentSeason);
  const isSeasonActive = !!seasonPost;

  const availableSeasons = useMemo(() => {
    const seasons = new Set<number>();
    if (currentSeason) seasons.add(currentSeason);
    seasonalHistory.forEach((post) => {
      const s = getSeasonFromTitle(post.title);
      if (s) seasons.add(s);
    });
    return Array.from(seasons).sort((a, b) => b - a);
  }, [currentSeason, seasonalHistory]);

  const filteredHistory = useMemo(() => {
    return userHistory.filter((h) => (h as any).season === selectedSeason);
  }, [userHistory, selectedSeason]);

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

  const { rewardMap } = calculateRewards(highScores, seasonPost, communityPool);
  const userReward = rewardMap.get(username) || 0;
  const symbol = getRewardPool(seasonPost)?.symbol || "STEEM";

  const bestScore =
    filteredHistory.length > 0
      ? Math.max(...filteredHistory.map((h) => h.score))
      : 0;

  const totalPlays = filteredHistory.length;
  const totalCombos = filteredHistory.reduce(
    (acc, curr) => acc + (curr.combos || 0),
    0,
  );
  const avgAltitude =
    totalPlays > 0
      ? Math.round(
          filteredHistory.reduce((acc, curr) => acc + curr.score, 0) /
            totalPlays,
        )
      : 0;

  const isQualified =
    bestScore >= REWARD_MIN_ALTITUDE ||
    (bestScore >= 10 && totalPlays >= REWARD_MIN_PLAYS);

  const userRank = highScores.findIndex((h) => h.player === username) + 1;
  const isInTopCutoff = userRank > 0 && userRank <= REWARD_RANK_CUTOFF;

  return (
    <div className="space-y-6 pt-2">
      {/* Daily Challenges Section */}
      <div className="relative overflow-hidden bg-zinc-300/40 dark:bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 sm:p-8">
        {/* Background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-3">
              <span className="p-2 bg-amber-500/10 rounded-xl">
                <Zap size={20} fill="currentColor" />
              </span>
              Daily Challenges
            </h3>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-11">
              Complete tasks to fuel your next ascent
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group flex items-center gap-4 bg-zinc-300/50 dark:bg-zinc-950/50 border dark:border-white/10 border-black/10 p-2 pr-6 rounded-2xl backdrop-blur-md transition-all hover:border-amber-500/30"
          >
            <div className="p-3 bg-amber-500 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Zap size={18} className="text-black" fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Available Energy
              </span>
              <span className="text-xl font-black tabular-nums">{energy}</span>
            </div>
          </motion.div>
        </div>

        {isSeasonActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-4">
            {DAILY_CHALLENGES.map((challenge, idx) => {
              const current =
                (challenge.type === "ascent"
                  ? dailyProgress.ascent
                  : challenge.type === "combos"
                    ? dailyProgress.combos
                    : dailyProgress.plays) || 0;
              const progress = Math.min(
                100,
                (current / challenge.target) * 100,
              );
              const isCompleted = current >= challenge.target;
              const isClaimed = dailyProgress.claimed.includes(challenge.id);
              const isSyncing = syncingChallengeId === challenge.id;

              const Icon =
                challenge.type === "ascent"
                  ? Mountain
                  : challenge.type === "combos"
                    ? PrecisionIcon
                    : Gamepad2;

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0.8, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group relative flex flex-col gap-5 p-5 rounded-4xl border transition-all duration-500 ${
                    isClaimed
                      ? "dark:bg-zinc-950/30 bg-zinc-300/30 border-white/5 opacity-80"
                      : isCompleted
                        ? "bg-primary-500/5 border-primary-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                        : "bg-amber-500/10 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4
                        className={`text-xs font-black uppercase tracking-wider ${isClaimed ? "text-zinc-500" : ""}`}
                      >
                        {challenge.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-medium leading-snug max-w-[150px]">
                        {challenge.description}
                      </p>
                    </div>
                    <div
                      className={`p-2.5 rounded-2xl border transition-all ${
                        isClaimed
                          ? "dark:bg-zinc-800/80 bg-zinc-300/30 text-zinc-600 border-transparent"
                          : isCompleted
                            ? "bg-primary-500/20 text-primary-500 border-primary-500/30"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/10"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isClaimed ? "text-success opacity-50" : ""}
                      />
                    </div>
                  </div>

                  <Progress
                    aria-label="Daily challenge progress"
                    size="sm"
                    value={progress}
                    color={
                      isClaimed
                        ? "success"
                        : isCompleted
                          ? "primary"
                          : "warning"
                    }
                    classNames={{
                      base: "space-y-2",
                      label:
                        "text-[10px] font-black text-zinc-500 uppercase tracking-widest",
                      value: "text-xs font-black text-zinc-500 tabular-nums",
                    }}
                    label="Task Progress"
                    valueLabel={
                      <div className="flex items-baseline gap-1">
                        {Math.floor(current)}
                        <span className="text-[10px] text-zinc-600 font-bold">
                          /
                        </span>
                        {challenge.target}
                      </div>
                    }
                    showValueLabel={true}
                  />

                  <Button
                    size="md"
                    onPress={() => claimChallenge(challenge.id)}
                    isLoading={isSyncing}
                    isDisabled={
                      !isCompleted || isClaimed || !!syncingChallengeId
                    }
                    className={`h-10 w-full rounded-[1.25rem] font-black uppercase text-[10px] tracking-[0.15em] transition-all duration-300 ${
                      isClaimed
                        ? "bg-zinc-800/50 text-zinc-600 border border-white/5 cursor-not-allowed"
                        : isCompleted
                          ? "bg-primary-500 text-black shadow-lg shadow-emerald-500/20"
                          : "bg-zinc-900 text-zinc-500 border border-white/5 hover:border-white/10"
                    }`}
                  >
                    {isClaimed
                      ? "CLAIMED"
                      : isSyncing
                        ? "CLAIMING..."
                        : isCompleted
                          ? `CLAIM +${challenge.reward}`
                          : "IN PROGRESS"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center dark:bg-zinc-950/20 bg-zinc-300/30 rounded-4xl border border-white/5">
            <div className="p-4 bg-zinc-800/30 rounded-3xl mb-4 text-zinc-500">
              <Zap size={32} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-2">
              Daily Challenges Inactive
            </h4>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider max-w-xs leading-relaxed">
              Challenges and Energy rewards are only available during active
              seasons. Stay tuned for the next climb!
            </p>
          </div>
        )}

        {/* Season Reset Alert */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex items-center gap-4 bg-amber-500/5 border border-amber-500/10 p-4 rounded-4xl mt-8 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl rounded-full -mr-12 -mt-12" />
          <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0">
            <Info size={20} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
              Season Reset Notice
            </span>
            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
              Energy is season-specific. Your balance for{" "}
              <span className="font-bold">Season {currentSeason}</span> will be
              reset when the season ends to ensure a fresh start for all
              competitors.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Personal Stats Summary */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Personal Stats Summary
          </h3>
        </div>
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
      </div>

      {/* Score History Chart */}
      <PerformanceChart userHistory={filteredHistory} />

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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">
            Personal Records
          </h3>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {availableSeasons.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSeason(s)}
                className={`flex-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${
                  selectedSeason === s
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-lg shadow-amber-500/10"
                    : "bg-zinc-800/10 border-white/5 text-zinc-500 hover:border-white/10"
                }`}
              >
                SN-{s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            size="sm"
            onPress={onOpen}
            className="h-7 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-full font-black uppercase text-[8px] tracking-widest transition-all"
            startContent={<Share2 size={10} />}
          >
            Publish Activity
          </Button>
        </div>
      </div>

      <ScrollShadow className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
        <AnimatePresence mode="popLayout">
          {filteredHistory.map((hs, i) => {
            const isLatest =
              i === 0 && selectedSeason === (userHistory[0] as any)?.season;
            const isBest = hs.score === bestScore && bestScore > 0;

            return (
              <motion.div
                key={`${hs.created_at}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="flex justify-between items-center group py-2 border-b border-white/5 last:border-0"
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
                  <span className="text-[10px] text-zinc-500 font-medium font-mono">
                    {new Date(hs.created_at || "").toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  {isBest && (
                    <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      Best
                    </span>
                  )}
                  {isLatest && (
                    <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      Latest
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filteredHistory.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center opacity-40">
            <Filter size={32} className="text-zinc-500 mb-2" />
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
              No records for Season {selectedSeason}
            </p>
          </div>
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
