"use client";

import { memo, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Trophy,
  Target,
  History,
  ArrowUpRight,
  Users,
  Zap,
  Cloud,
  BarChart2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import SAvatar from "@/components/ui/SAvatar";
import SUsername from "@/components/ui/SUsername";
import { DataTable } from "@/components/ui/data-table";
import {
  HighScore,
  GameStats,
  REWARD_MIN_ALTITUDE,
  REWARD_MIN_PLAYS,
  REWARD_RANK_CUTOFF,
  PODIUM_POOL_PERCENT,
  PERFORMANCE_POOL_PERCENT,
  AVERAGE_POOL_PERCENT,
} from "./Config";
import { motion } from "framer-motion";
import { getRewardPool, getCoopConfig } from "./HeightsInfo";
import { CommunityGoalCard } from "./CommunityGoalCard";
import { HeightsRaceGraph } from "./HeightsRaceGraph";

interface Props {
  currentSeason: number;
  isSeasonActive: boolean;
  highScores: HighScore[];
  seasonPost: any | null;
  globalStats: GameStats;
  username: string;
  eligibilityMap: {
    [key: string]: { sp: number; rep: number; eligible: boolean };
  };
}

export const calculateRewards = (
  highScores: HighScore[],
  seasonPost: any | null,
  poolValue: number,
  eligibilityMap: {
    [key: string]: { sp: number; rep: number; eligible: boolean };
  },
) => {
  if (!seasonPost || !highScores.length)
    return { rewardMap: new Map<string, number>(), globalAverage: 0 };

  // 1. Eligibility Filter (Super Strict Anti-Cheat)
  // - Must reach REWARD_MIN_ALTITUDE (Skill Barrier)
  // - Must play REWARD_MIN_PLAYS times (Grind Barrier)
  const qualifiedClimbers = highScores.filter((u, index) => {
    const score = u.score || 0;
    const plays = u.plays || 0;
    const accountEligibility = eligibilityMap[u.player]?.eligible ?? false;
    // skip the plays condition to check for bot if the REWARD_MIN_ALTITUDE meet
    const isQualified =
      (score >= REWARD_MIN_ALTITUDE ||
        (score >= 10 && plays >= REWARD_MIN_PLAYS)) &&
      accountEligibility;

    return isQualified && index < REWARD_RANK_CUTOFF;
  });

  if (poolValue <= 0 || qualifiedClimbers.length === 0)
    return { rewardMap: new Map<string, number>(), globalAverage: 0 };

  const rewardMap = new Map<string, number>();

  // Calculate Global Average only from qualified climbers to avoid bot skewing
  const totalScore = qualifiedClimbers.reduce(
    (acc, cur) => acc + (cur.score || 0),
    0,
  );
  const globalAverage = totalScore / qualifiedClimbers.length;

  // Pools: Podium, Performance, and Average Achievement
  const podiumPool = poolValue * PODIUM_POOL_PERCENT;
  const performancePool = poolValue * PERFORMANCE_POOL_PERCENT;
  const averagePool = poolValue * AVERAGE_POOL_PERCENT;

  // 2. Average Altitude Achievement (Shared equally by those who reach globalAverage, excluding top 3)
  const averageAchievers = qualifiedClimbers
    .slice(3)
    .filter((u) => (u.score || 0) >= globalAverage);
  const averageRewardPerPerson =
    averageAchievers.length > 0 ? averagePool / averageAchievers.length : 0;

  // 3. Podium Distribution (Rank 1-3)
  const podiumWeights: { [key: number]: number } = {
    0: 0.5, // 1st
    1: 0.3, // 2nd
    2: 0.2, // 3rd
  };

  // 4. Robust Performance Distribution (Rank 4+)
  const rank4PlusQualified = qualifiedClimbers.slice(3);
  const sumRank4PlusScores = rank4PlusQualified.reduce(
    (acc, cur) => acc + (cur.score || 0),
    0,
  );

  qualifiedClimbers.forEach((user, index) => {
    let reward = 0;
    const score = user.score || 0;

    if (index < 3) {
      // Podium gets fixed percentages of the podium pool
      reward += podiumPool * (podiumWeights[index] || 0);
    } else if (sumRank4PlusScores > 0) {
      // Performance Share distributed proportionally
      reward += (score / sumRank4PlusScores) * performancePool;
    }

    // Add Average Altitude Reward if reached target
    if (index >= 3 && score >= globalAverage) {
      reward += averageRewardPerPerson;
    }

    rewardMap.set(user.player, reward);
  });

  return { rewardMap, globalAverage };
};

export const getCommunityReward = (totalAltitude: number, config: any) => {
  if (!config) return 0;
  const { minReward, maxReward, stepSize, increasePercent, baseAltitude } =
    config;

  if (totalAltitude < baseAltitude) return 0;

  const steps = Math.floor((totalAltitude - baseAltitude) / stepSize);
  const reward = minReward + steps * (minReward * increasePercent);

  return Math.min(reward, maxReward);
};
export const GlobalSummitTab = memo(
  ({
    currentSeason,
    isSeasonActive,
    highScores,
    seasonPost,
    globalStats,
    username,
    eligibilityMap,
  }: Props) => {
    const t = useTranslations("Games.steemHeights.leaderboard.global");
    const coopConfig = getCoopConfig(seasonPost);
    const { qualifiedHighScores, unqualifiedHighScores } = useMemo(() => {
      const qualified: HighScore[] = [];
      const unqualified: HighScore[] = [];

      highScores.forEach((u) => {
        const eligibility = eligibilityMap[u.player];
        if (eligibility?.eligible) {
          qualified.push(u);
        } else if (eligibility) {
          unqualified.push(u);
        } else {
          // If not in top 100 or not yet fetched, assume unqualified for now
          unqualified.push(u);
        }
      });
      return {
        qualifiedHighScores: qualified,
        unqualifiedHighScores: unqualified,
      };
    }, [highScores, eligibilityMap]);

    const totalLeaderboardAltitude = useMemo(() => {
      return qualifiedHighScores.reduce((acc, cur) => acc + (cur.score || 0), 0);
    }, [qualifiedHighScores]);

    const rewardPool = getRewardPool(seasonPost);
    const postPool = rewardPool?.reward ?? 0;
    const symbol = rewardPool?.symbol || "STEEM";

    const communityPool = getCommunityReward(
      totalLeaderboardAltitude,
      coopConfig,
    );
    const activePool = Math.max(postPool, communityPool);

    const { rewardMap: rewards, globalAverage } = useMemo(
      () =>
        calculateRewards(
          highScores,
          seasonPost,
          communityPool,
          eligibilityMap,
        ),
      [highScores, seasonPost, communityPool, eligibilityMap],
    );

    const totalAscent = totalLeaderboardAltitude;

    return (
      <div className="space-y-12">
        {/* Community Global Goal (Co-op Mode) */}
        {coopConfig && (
          <CommunityGoalCard
            totalAltitude={totalLeaderboardAltitude}
            symbol={symbol}
            config={coopConfig}
          />
        )}
        {/* Season Badge & Status */}
        <div className="flex flex-col items-center gap-6">
          <Link
            href={
              seasonPost ? `/@${seasonPost.author}/${seasonPost.permlink}` : ""
            }
            className="px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 hover:bg-amber-500/20 transition-all group/season"
          >
            <Trophy
              size={12}
              className="text-amber-500 group-hover/season:scale-110 transition-transform"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
              {seasonPost
                ? t("summit", { season: currentSeason })
                : t("hall")}
            </span>
            {seasonPost && (
              <ArrowUpRight
                size={10}
                className="text-amber-500/50 group-hover/season:text-amber-500 transition-colors"
              />
            )}
          </Link>

          {/* Global Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
            {[
              {
                label: t("totalClimbers"),
                value: globalStats.totalParticipants,
                icon: Users,
                color: "text-blue-500",
              },
              {
                label: t("active24h"),
                value: globalStats.activePlayers24h,
                icon: Zap,
                color: "text-amber-500",
              },
              {
                label: t("totalAscent"),
                value: `${totalAscent.toLocaleString()}m`,
                icon: Cloud,
                color: "text-emerald-500",
                hint: t("onlyQualified"),
              },
              {
                label: t("avgAltitude"),
                value: `${Math.round(globalAverage).toLocaleString()}m`,
                icon: BarChart2,
                color: "text-cyan-500",
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
                {"hint" in stat && (
                  <div className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest mt-0.5">
                    {stat.hint}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {!isSeasonActive && (
            <div className="w-full bg-zinc-300/50 dark:bg-zinc-950/50 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
              <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                <Trophy size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase text-amber-500">
                  {t("intermission")}
                </span>
                <span className="text-[10px] font-medium text-muted">
                  {seasonPost
                    ? t("concluded", { season: currentSeason })
                    : t("preparing")}
                </span>
              </div>
            </div>
          )}

          {/* Race Graph Visualization */}
          {qualifiedHighScores.length > 0 && (
            <HeightsRaceGraph highScores={qualifiedHighScores} />
          )}
        </div>

        <div className="mt-24">
          {/* Podium */}
          {qualifiedHighScores.length > 0 && (
            <div className="flex justify-center items-end gap-2 pb-8">
              {/* 2nd Place */}
              {qualifiedHighScores[1] && (
                <div className="flex flex-col items-center gap-2 w-24">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-t from-blue-500/20 to-transparent rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500" />
                    <SAvatar
                      radius="full"
                      size="md"
                      quality="medium"
                      username={qualifiedHighScores[1].player}
                      className="border-2 border-blue-500/30 grayscale-[0.5] group-hover:grayscale-0 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-blue-500/50 rounded-full p-0.5">
                      🥈
                    </div>
                    {qualifiedHighScores[1].player === username && (
                      <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg z-10">
                        {t("you")}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <SUsername
                      className="text-[10px] font-bold text-zinc-400 max-w-[80px] truncate"
                      username={`@${qualifiedHighScores[1].player}`}
                    />
                    <div className="flex flex-col items-center mt-0.5">
                      <span className="text-[11px] font-black text-blue-500 leading-none">
                        {qualifiedHighScores[1].score}m
                      </span>
                      <div className="flex flex-col items-center gap-0.5 mt-1">
                        {rewards.has(qualifiedHighScores[1].player) && (
                          <span className="text-[9px] font-black bg-blue-500/20 px-1.5 py-0.5 rounded-full border border-blue-500/30 mb-1">
                            +{rewards.get(qualifiedHighScores[1].player)?.toFixed(3)}{" "}
                            {symbol}
                          </span>
                        )}
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter leading-none">
                          {qualifiedHighScores[1].plays} {t("plays")}
                        </span>
                        {(qualifiedHighScores[1].combos ?? 0) > 0 && (
                          <span className="text-[8px] font-black text-amber-500/80 uppercase tracking-wider bg-amber-500/5 px-1 rounded-sm border border-amber-500/10">
                            {qualifiedHighScores[1].combos} {t("combos")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

               {/* 1st Place */}
              {qualifiedHighScores[0] && (
                <div className="flex flex-col items-center gap-3 w-28 -mt-6">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-linear-to-t from-amber-500/30 to-transparent rounded-full blur-md opacity-50 group-hover:opacity-100 transition duration-500" />
                    <SAvatar
                      radius="full"
                      size="lg"
                      quality="medium"
                      username={qualifiedHighScores[0].player}
                      className="border-2 border-amber-500 scale-110 shadow-2xl transition-transform group-hover:scale-115"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-zinc-900 border-1 border-amber-500 rounded-full p-2 shadow-lg">
                      <Trophy
                        size={14}
                        className="text-amber-500 fill-amber-500/20"
                      />
                    </div>
                    {qualifiedHighScores[0].player === username && (
                      <div className="absolute -top-2 -left-2 bg-primary-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-xl z-10 border-2 border-zinc-950">
                        {t("you")}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <SUsername
                      className="text-xs font-black text-amber-500 tracking-tight max-w-[100px] truncate"
                      username={`@${qualifiedHighScores[0].player}`}
                    />
                    <div className="flex flex-col items-center mt-0.5">
                      <span className="text-sm font-black drop-shadow-sm leading-none">
                        {qualifiedHighScores[0].score}m
                      </span>
                      <div className="flex flex-col items-center gap-0.5 mt-1">
                        {rewards.has(qualifiedHighScores[0].player) && (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-[10px] font-black text-black bg-amber-500 px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20 mb-1"
                          >
                            +{rewards.get(qualifiedHighScores[0].player)?.toFixed(3)}{" "}
                            {symbol}
                          </motion.div>
                        )}
                        <span className="text-[8px] font-black uppercase tracking-tighter text-amber-500/70 leading-none">
                          {qualifiedHighScores[0].plays} {t("plays")}
                        </span>
                        {(qualifiedHighScores[0].combos ?? 0) > 0 && (
                          <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                            {qualifiedHighScores[0].combos} {t("combos")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {qualifiedHighScores[2] && (
                <div className="flex flex-col items-center gap-2 w-24">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-t from-cyan-500/20 to-transparent rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500" />
                    <SAvatar
                      radius="full"
                      size="md"
                      quality="medium"
                      username={qualifiedHighScores[2].player}
                      className="border-2 border-cyan-500/30 grayscale-[0.5] group-hover:grayscale-0 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-cyan-500/50 rounded-full p-0.5">
                      🥉
                    </div>
                    {qualifiedHighScores[2].player === username && (
                      <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg z-10">
                        {t("you")}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <SUsername
                      className="text-[10px] font-bold text-zinc-400 max-w-[80px] truncate"
                      username={`@${qualifiedHighScores[2].player}`}
                    />
                    <div className="flex flex-col items-center mt-0.5">
                      <span className="text-[11px] font-black text-cyan-500 leading-none">
                        {qualifiedHighScores[2].score}m
                      </span>
                      <div className="flex flex-wrap items-center gap-0.5 mt-1 justify-center">
                        {rewards.has(qualifiedHighScores[2].player) && (
                          <span className="text-[9px] font-black bg-cyan-500/20 px-1.5 py-0.5 rounded-full border border-cyan-500/30 mb-1">
                            +{rewards.get(qualifiedHighScores[2].player)?.toFixed(3)}{" "}
                            {symbol}
                          </span>
                        )}
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter leading-none">
                          {qualifiedHighScores[2].plays} {t("plays")}
                        </span>
                        {(qualifiedHighScores[2].combos ?? 0) > 0 && (
                          <span className="text-[8px] font-black text-amber-500/80 uppercase tracking-wider bg-amber-500/5 px-1 rounded-sm border border-amber-500/10">
                            {qualifiedHighScores[2].combos} {t("combos")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-2">
          <DataTable
            data={qualifiedHighScores.map((item, i) => ({ ...item, rank: i + 1 }))}
            columns={[
              {
                key: "rank",
                header: "#",
                sortable: true,
                className: "w-10 px-2 py-2",
                render: (rank) => (
                  <span className="text-[10px] font-black text-muted">
                    {rank < 10 ? `0${rank}` : rank}
                  </span>
                ),
              },
              {
                key: "player",
                header: t("table.player"),
                sortable: true,
                searchable: true,
                className: "px-2 py-2",
                render: (player, row) => (
                  <div className="flex items-center gap-2">
                    <SAvatar radius="full" size={"xs"} username={player} />
                    <div>
                      <SUsername
                        className="text-xs font-bold text-muted"
                        username={`@${player}`}
                      />
                      {player === username && (
                        <span className="text-[8px] font-black bg-primary-500 text-white px-1 rounded-sm uppercase tracking-widest ml-1">
                          {t("you")}
                        </span>
                      )}
                      {eligibilityMap[row.player] && (
                        <div className="flex items-center gap-1 mt-1">
                          {eligibilityMap[row.player].eligible ? (
                            <CheckCircle2 size={10} className="text-emerald-500" />
                          ) : (
                            <XCircle size={10} className="text-rose-500" />
                          )}
                          <span className="text-[8px] font-bold text-zinc-500">
                            REP {eligibilityMap[row.player].rep.toFixed(1)} |{" "}
                            {eligibilityMap[row.player].sp.toFixed(0)} SP
                          </span>
                        </div>
                      )}
                      {rewards.has(row.player) && (
                        <div className="flex flex-col mt-1">
                          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                            {rewards.get(row.player)?.toFixed(3)} {symbol}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "score",
                header: t("table.performance"),
                sortable: true,
                className: "px-2 py-2",
                render: (score, row) => (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white bg-zinc-800 px-2 py-0.5 rounded-md">
                        {score}m
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                        <History size={10} />
                        {row.plays}
                      </span>
                    </div>
                    {(row.combos ?? 0) > 0 && (
                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-sm w-fit">
                        <Target size={10} />
                        <span className="text-[8px] font-bold uppercase tracking-wider">
                          {row.combos} {t("combos")}
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
                ? t("beFirst")
                : t("noMore")
            }
          />
        </div>

        {/* Unqualified Section */}
        {unqualifiedHighScores.length > 0 && (
          <div className="mt-8 pt-8 border-t border-zinc-500/10 opacity-70">
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={14} className="text-zinc-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {t("unqualifiedClimbers")}
              </span>
            </div>
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-2">
              <DataTable
                data={unqualifiedHighScores.map((item) => ({
                  ...item,
                  rank: "-",
                }))}
                columns={[
                  {
                    key: "rank",
                    header: "#",
                    className: "w-10 px-2 py-2",
                    render: () => (
                      <span className="text-[10px] font-black text-zinc-600">
                        DQ
                      </span>
                    ),
                  },
                  {
                    key: "player",
                    header: t("table.player"),
                    className: "px-2 py-2",
                    render: (player) => (
                      <div className="flex items-center gap-2">
                        <SAvatar radius="full" size={"xs"} username={player} />
                        <div>
                          <SUsername
                            className="text-xs font-bold text-zinc-600"
                            username={`@${player}`}
                          />
                          {eligibilityMap[player] && (
                            <div className="flex items-center gap-1 mt-1">
                              <XCircle size={10} className="text-rose-500" />
                              <span className="text-[8px] font-bold text-zinc-600">
                                REP {eligibilityMap[player].rep.toFixed(1)} |{" "}
                                {eligibilityMap[player].sp.toFixed(0)} SP
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "score",
                    header: t("table.performance"),
                    className: "px-2 py-2",
                    render: (score, row) => (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded-md">
                          {score}m
                        </span>
                        <span className="text-[10px] font-bold text-zinc-700 uppercase flex items-center gap-1">
                          <History size={10} />
                          {row.plays}
                        </span>
                      </div>
                    ),
                  },
                ]}
                initialLoadCount={50}
                emptyMessage={t("noMore")}
              />
            </div>
          </div>
        )}
      </div>
    );
  },
);
