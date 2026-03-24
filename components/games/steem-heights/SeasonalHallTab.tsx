"use client";

import { Trophy, Cloud, Users, Award, Eye } from "lucide-react";
import { useState, useMemo, memo } from "react";
import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { SeasonalHallModal } from "./SeasonalHallModal";
import { getCoopConfig, getRewardPool } from "./HeightsInfo";
import { getCommunityReward } from "./GlobalSummitTab";
import { getSeasonFromTitle } from "@/hooks/games/useHeightsSeason";
import { useTranslations } from "next-intl";

interface Props {
  seasonalWinners: any[];
  seasonalPosts: Feed[];
  eligibilityMap: Record<string, any>;
}

export const SeasonalHallTab = memo(
  ({ seasonalWinners, seasonalPosts, eligibilityMap }: Props) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const t = useTranslations("Games.steemHeights.leaderboard.winners");

    const selectedSeasonPost = useMemo(() => {
      if (!selectedSeason) return null;
      return seasonalPosts.find((p) => {
        const season = getSeasonFromTitle(p.title);
        return season === selectedSeason;
      });
    }, [selectedSeason, seasonalPosts]);

    const filteredWinners = useMemo(() => {
      return seasonalWinners.filter((w) =>
        seasonalPosts.some((p) => getSeasonFromTitle(p.title) === w.season),
      );
    }, [seasonalWinners, seasonalPosts]);

    return (
      <>
        {/* Compact Seasonal List */}
        <div className="space-y-2 mt-2">
          {filteredWinners.map((w, i) => {
            const post = seasonalPosts.find((p) => {
              const season = getSeasonFromTitle(p.title);
              return season === w.season;
            });
            const coopConfig = post ? getCoopConfig(post) : null;
            const communityPool = getCommunityReward(w.totalAscent, coopConfig);
            const totalReward = communityPool;
            const maxReward = coopConfig?.maxReward || 0;

            const symbol = post
              ? (getRewardPool(post)?.symbol ?? "STEEM")
              : "STEEM";

            return (
              <div
                key={i}
                className="group relative flex flex-col gap-3 bg-zinc-300/40 dark:bg-zinc-900/40 p-4 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all overflow-hidden cursor-pointer"
                onClick={() => {
                  setSelectedSeason(w.season);
                  onOpen();
                }}
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32  bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  {/* Season Badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 min-w-[50px] group-hover:bg-amber-500/20 transition-colors">
                      <span className="text-[8px] font-black text-amber-500 uppercase leading-none mb-1">
                        Season
                      </span>
                      <span className="text-xl font-black text-amber-500 leading-none">
                        {w.season}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black">
                        Altitude Expedition
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                        <Users size={10} className="text-zinc-600" />
                        {w.totalClimbers} {t("climbers")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={() => {
                      setSelectedSeason(w.season);
                      onOpen();
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white h-8 w-8 min-w-8 rounded-full shadow-lg border border-white/10 group-hover:scale-110 transition-transform"
                  >
                    <Eye size={12} />
                  </Button>
                </div>

                {/* Enhanced Season Stats Row */}
                <div className="flex flex-wrap items-center justify-between gap-y-2 pt-3 border-t border-white/5 mt-1 relative z-10 bg-zinc-300/50 dark:bg-zinc-950/20 -mx-4 -mb-4 px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">
                        Global Ascent
                      </span>
                      <span className="text-xs font-black text-muted flex items-center gap-1">
                        <Cloud size={10} className="text-zinc-500" />
                        {w.totalAscent?.toLocaleString()}m
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">
                        Max Altitude
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Trophy size={10} className="text-amber-500" />
                        <span className="text-xs font-black text-amber-500 italic">
                          {w.score}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {totalReward > 0 && (
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">
                          {t("achieved")}
                        </span>
                        <span className="text-[11px] font-black text-primary-500">
                          {totalReward.toFixed(2)} {symbol}
                        </span>
                      </div>
                    )}
                    {maxReward > 0 && (
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">
                          {t("pool")}
                        </span>
                        <span className="text-[11px] font-black text-emerald-500">
                          {maxReward.toFixed(2)} {symbol}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {seasonalWinners.length === 0 && (
            <div className="py-8 flex flex-col items-center justify-center opacity-40">
              <Award size={32} className="text-zinc-500 mb-2" />
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                {t("hallAwaits")}
              </p>
            </div>
          )}
        </div>
        <SeasonalHallModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          selectedSeason={selectedSeason}
          selectedSeasonPost={selectedSeasonPost}
          eligibilityMap={eligibilityMap}
        />
      </>
    );
  },
);
