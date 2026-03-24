"use client";

import { useState, useMemo, useEffect, memo } from "react";
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
} from "lucide-react";
import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { ActivityPublishModal } from "./ActivityPublishModal";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { calculateRewards } from "./GlobalSummitTab";
import {
  REWARD_MIN_ALTITUDE,
  REWARD_MIN_PLAYS,
  REWARD_RANK_CUTOFF,
} from "./Config";
import { getRewardPool, getCoopConfig } from "./HeightsInfo";
import { getCommunityReward } from "./GlobalSummitTab";
import { getSeasonFromTitle } from "@/hooks/games/useHeightsSeason";

interface Props {
  userStats: any;
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
  eligibilityMap: Record<string, any>;
  fetchHeightsUserData: (season?: number) => Promise<any>;
  fetchUserHistory: (season?: number) => Promise<HighScore[]>;
}

export const MyResultsTab = memo(
  ({
    userStats,
    userHistory,
    username,
    highScores,
    seasonPost,
    currentSeason,
    seasonalHistory,
    fetchHeightsUserData,
    fetchUserHistory,
    eligibilityMap,
  }: Props) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedSeason, setSelectedSeason] = useState<number>(currentSeason);
    const [seasonStats, setSeasonStats] = useState<any>(userStats);
    const [seasonHistoryItems, setSeasonHistoryItems] =
      useState<HighScore[]>(userHistory);
    const [isFetching, setIsFetching] = useState(false);
    const t = useTranslations("Games.steemHeights.leaderboard.history");

    const availableSeasons = useMemo(() => {
      const seasons = new Set<number>();
      if (currentSeason) seasons.add(currentSeason);
      seasonalHistory.forEach((post) => {
        const s = getSeasonFromTitle(post.title);
        if (s) seasons.add(s);
      });
      return Array.from(seasons).sort((a, b) => b - a);
    }, [currentSeason, seasonalHistory]);

    useEffect(() => {
      if (selectedSeason === currentSeason) {
        setSeasonStats(userStats);
        setSeasonHistoryItems(userHistory);
        return;
      }

      const fetchOtherSeason = async () => {
        setIsFetching(true);
        try {
          const [stats, history] = await Promise.all([
            fetchHeightsUserData(selectedSeason),
            fetchUserHistory(selectedSeason),
          ]);
          setSeasonStats(stats);
          setSeasonHistoryItems(history);
        } finally {
          setIsFetching(false);
        }
      };
      fetchOtherSeason();
    }, [
      selectedSeason,
      currentSeason,
      userStats,
      userHistory,
      fetchHeightsUserData,
      fetchUserHistory,
    ]);

    const bestScore = seasonStats?.highest_score || 0;
    const totalPlays = seasonStats?.total_plays || 0;
    const totalCombos = seasonStats?.total_combos || 0;
    const avgAltitude = Math.round(seasonStats?.avg_score || 0);

    const coopConfig = getCoopConfig(seasonPost);
    const { qualifiedHighScores } = useMemo(() => {
      const qualified = highScores.filter(
        (u) => eligibilityMap[u.player]?.eligible,
      );
      return { qualifiedHighScores: qualified };
    }, [highScores, eligibilityMap]);

    const totalLeaderboardAltitude = useMemo(() => {
      return (
        qualifiedHighScores?.reduce((acc, cur) => acc + (cur.score || 0), 0) ||
        0
      );
    }, [qualifiedHighScores]);

    const communityPool = getCommunityReward(
      totalLeaderboardAltitude,
      coopConfig,
    );

    const { rewardMap } = calculateRewards(
      highScores,
      seasonPost,
      communityPool,
      eligibilityMap,
    );
    const userReward = rewardMap.get(username) || 0;
    const symbol = getRewardPool(seasonPost)?.symbol || "STEEM";

    const isQualified = !!eligibilityMap[username]?.eligible;

    const userRank =
      qualifiedHighScores.findIndex((h) => h.player === username) + 1;
    const isInTopCutoff = userRank > 0 && userRank <= REWARD_RANK_CUTOFF;

    return (
      <div className="space-y-6 pt-2">
        {/* Personal Stats Summary */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              {t("summary")}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: t("totalPlays"),
                value: totalPlays,
                icon: History,
                color: "text-blue-500",
              },
              {
                label: t("bestAltitude"),
                value: `${bestScore}m`,
                icon: Trophy,
                color: "text-amber-500",
              },
              {
                label: t("avgAltitude"),
                value: `${avgAltitude}m`,
                icon: TrendingUp,
                color: "text-emerald-500",
              },
              {
                label: t("totalCombos"),
                value: totalCombos,
                icon: Target,
                color: "text-indigo-500",
              },
            ].map((stat, i) => (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={stat.label}
                className={`bg-zinc-300/50 dark:bg-zinc-900/50 border border-white/5 rounded-xl p-3 flex flex-col items-center gap-1 transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}
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

        {/* Reward Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center gap-2 text-center"
        >
          <Award size={20} className="text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/70">
              {t("estReward")}
            </span>
            <span className="text-xl font-black">
              {userReward.toFixed(3)} {symbol}
            </span>
          </div>

          {!isQualified || !isInTopCutoff ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] text-zinc-500 font-medium max-w-[280px]">
                {!isQualified
                  ? "Qualification requires ≥ 50 Steem Power and > 40 Reputation."
                  : t("breakIntoTop", {
                      ranking: REWARD_RANK_CUTOFF,
                    })}
              </p>
              {!isQualified && eligibilityMap[username] && (
                <div className="flex items-center gap-3 px-3 py-1 bg-rose-500/5 border border-rose-500/10 rounded-full">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-black text-rose-500/40 uppercase">
                      Reputation
                    </span>
                    <span
                      className={`text-[10px] font-black ${eligibilityMap[username].rep > 40 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {eligibilityMap[username].rep.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-px h-2 bg-rose-500/20" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-black text-rose-500/40 uppercase">
                      Steem Power
                    </span>
                    <span
                      className={`text-[10px] font-black ${eligibilityMap[username].sp >= 50 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {eligibilityMap[username].sp.toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest bg-emerald-500/10 px-4 py-1 rounded-full border border-emerald-500/20 anim-pulse">
              {t("qualified")}
            </p>
          )}
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap">
              {t("records")}
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
              {t("publish.btnLabel")}
            </Button>
          </div>
        </div>

        <ScrollShadow className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
          <AnimatePresence mode="popLayout">
            {seasonHistoryItems.map((hs, i) => {
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
                        {t("altitude")}: {hs.score}m
                      </span>
                      {(hs.combos ?? 0) > 0 && (
                        <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-1 rounded-sm border border-amber-500/10">
                          {hs.combos} {t("combos")}
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
                        {t("best")}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {seasonHistoryItems.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center opacity-40">
              <Filter size={32} className="text-zinc-500 mb-2" />
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                {t("noRecords", { season: selectedSeason })}
              </p>
            </div>
          )}
        </ScrollShadow>

        <ActivityPublishModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          username={username}
          userStats={userStats}
        />
      </div>
    );
  },
);
