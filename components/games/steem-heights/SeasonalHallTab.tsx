"use client";

import {
  Trophy,
  History,
  Target,
  Eye,
  Users,
  Award,
  Cloud,
  FileText,
  Clipboard,
} from "lucide-react";
import SAvatar from "@/components/ui/SAvatar";
import SUsername from "@/components/ui/SUsername";
import { useState, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { HighScore } from "./Config";
import * as heightsDb from "@/libs/supabase/steem-heights";
import { DataTable } from "@/components/ui/data-table";
import { calculateRewards } from "./GlobalSummitTab";
import { getCoopConfig, getRewardPool } from "./HeightsInfo";
import { getCommunityReward } from "./GlobalSummitTab";
import { AvatarGroup, Spinner } from "@heroui/react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Constants } from "@/constants";
import { getSeasonFromTitle } from "@/hooks/games/useHeights";

interface Props {
  seasonalWinners: any[];
  seasonalPosts: Feed[];
}

export const SeasonalHallTab = ({ seasonalWinners, seasonalPosts }: Props) => {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [seasonData, setSeasonData] = useState<HighScore[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isModerator = useMemo(() => {
    return Constants.team.some((t) => t.name === session?.user?.name);
  }, [session]);

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

  const handleFetchSeasonDetails = async (season: number) => {
    setSelectedSeason(season);
    setIsLoading(true);
    onOpen();
    try {
      const scores = await heightsDb.getHeightsHighScores(season);
      setSeasonData(scores);
    } catch (error) {
      console.error("Failed to fetch season details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processedData = useMemo(() => {
    if (!selectedSeasonPost || seasonData.length === 0) return [];

    const coopConfig = getCoopConfig(selectedSeasonPost);
    const totalAltitude = seasonData.reduce(
      (acc, cur) => acc + (cur.score || 0),
      0,
    );
    const postPool = getRewardPool(selectedSeasonPost)?.reward ?? 0;
    const communityPool = getCommunityReward(totalAltitude, coopConfig);
    const activePool = Math.max(postPool, communityPool);

    const { rewardMap } = calculateRewards(
      seasonData,
      selectedSeasonPost,
      communityPool,
    );

    return seasonData.map((item, i) => ({
      ...item,
      rank: i + 1,
      reward: rewardMap.get(item.player) || 0,
    }));
  }, [selectedSeasonPost, seasonData]);

  const topThree = useMemo(() => processedData.slice(0, 3), [processedData]);
  const others = useMemo(() => processedData.slice(3), [processedData]);

  const copyTransactionReport = () => {
    if (processedData.length === 0) return;
    const report = processedData
      .filter((p) => (p.reward || 0) > 0)
      .map((p) => {
        return `${p.player}, ${p.reward.toFixed(3)} ${symbol}, Congratulations! You secured Rank #${p.rank} in Steem Heights Season ${selectedSeason}. Keep climbing!`;
      })
      .join("\n");

    navigator.clipboard.writeText(report);
    toast.success("Transaction report copied to clipboard!");
  };

  const copyMarkdownReport = () => {
    if (processedData.length === 0) return;
    const pool = getRewardPool(selectedSeasonPost);
    const symbol = pool?.symbol || "STEEM";

    let md = `### 🏆 Steem Heights Season ${selectedSeason} - Final Altitude Report\n\n`;
    md += `A massive congratulations to all our climbers! Looking at these results, the Steem ecosystem has never felt more alive. Whether you're at the peak or just starting your ascent, every meter counts. Keep pushing your limits! 🏔️✨\n\n`;
    md += `| Rank | Player | Max Altitude | Reward |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    processedData
      .filter((p) => (p.reward || 0) > 0)
      .forEach((p) => {
        md += `| ${p.rank} | @${p.player} | ${p.score}m | ${p.reward.toFixed(3)} ${symbol} |\n`;
      });

    md += `\n**Stay tuned for the next season... the cloud line is just the beginning!** 🚀`;

    navigator.clipboard.writeText(md);
    toast.success("Markdown report copied to clipboard!");
  };

  const symbol = getRewardPool(selectedSeasonPost)?.symbol || "STEEM";

  return (
    <>
      {/* Featured Hall of Fame Header */}
      <div className="flex flex-col items-center justify-center p-4 bg-amber-500/5 rounded-3xl border border-amber-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5">
          <Trophy size={60} className="text-amber-500" />
        </div>
        <div className="text-[9px] font-black uppercase text-amber-500 tracking-[0.3em] mb-3">
          Hall of Champions
        </div>
        <div className="flex -space-x-2">
          <AvatarGroup
            max={5}
            renderCount={(count) => (
              <p className="text-xs text-muted ms-2 font-medium hover:underline cursor-pointer">
                +{count} more
              </p>
            )}
          >
            {filteredWinners.map((w, i) => (
              <SAvatar
                key={i}
                username={w.player}
                radius="full"
                size="sm"
                className="border-2 border-zinc-950 shadow-lg"
              />
            ))}
          </AvatarGroup>
        </div>
      </div>

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
          const symbol = post
            ? (getRewardPool(post)?.symbol ?? "STEEM")
            : "STEEM";

          return (
            <div
              key={i}
              className="flex flex-col gap-2 bg-zinc-300/30 dark:bg-zinc-900/40 p-3 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Season & Avatar */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col items-center justify-center min-w-[40px]">
                    <span className="text-[8px] font-black text-zinc-500 uppercase leading-none mb-1">
                      SN
                    </span>
                    <span className="text-xs font-black leading-none">
                      {w.season}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-zinc-800" />
                  <SAvatar
                    radius="full"
                    size="sm"
                    username={w.player}
                    className="border border-amber-500/20 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <SUsername
                      className="text-xs font-black truncate"
                      username={`@${w.player}`}
                    />
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter leading-none">
                      Champion
                    </span>
                  </div>
                </div>

                {/* Score & Action */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2.5 py-1 rounded-full">
                    <Trophy size={10} className="fill-amber-500/20" />
                    <span className="text-[11px] font-black italic">
                      {w.score}m
                    </span>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={() => handleFetchSeasonDetails(w.season)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white h-8 w-8 min-w-8 rounded-xl shadow-lg border border-white/5"
                  >
                    <Eye size={12} />
                  </Button>
                </div>
              </div>

              {/* Enhanced Season Stats Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Users size={10} className="text-zinc-500" />
                  <span className="text-[9px] font-bold text-zinc-400 capitalize">
                    {w.totalClimbers} Climbers
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cloud size={10} className="text-zinc-500" />
                  <span className="text-[9px] font-bold text-zinc-400 capitalize">
                    {w.totalAscent?.toLocaleString()}m Ascent
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Target size={10} className="text-zinc-500" />
                  <span className="text-[9px] font-bold text-zinc-400 capitalize">
                    {Math.round(w.avgAltitude || 0)}m Avg
                  </span>
                </div>
                {totalReward > 0 && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">
                      Pool:
                    </span>
                    <span className="text-[9px] font-black text-emerald-500">
                      {totalReward.toFixed(2)} {symbol}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {seasonalWinners.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center opacity-40">
            <Award size={32} className="text-zinc-500 mb-2" />
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
              The hall awaits its first hero...
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="3xl"
        className="dark:bg-zinc-950 border border-white/10"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-white/5 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-2xl">
                    <History className="text-amber-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
                      Season{" "}
                      <span className="text-amber-500">{selectedSeason}</span>{" "}
                      Archives
                    </h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
                      Seasonal Performance Data
                    </p>
                  </div>
                </div>

                {isModerator && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      className="bg-zinc-800 text-zinc-400 font-bold uppercase text-[9px] tracking-widest px-3 rounded-xl border border-white/5 active:scale-95 transition-all"
                      onPress={copyTransactionReport}
                      startContent={<FileText size={12} />}
                    >
                      TX Report
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      className="bg-amber-500/10 text-amber-500 font-bold uppercase text-[9px] tracking-widest px-3 rounded-xl border border-amber-500/20 active:scale-95 transition-all"
                      onPress={copyMarkdownReport}
                      startContent={<Clipboard size={12} />}
                    >
                      MD Report
                    </Button>
                  </div>
                )}
              </ModalHeader>
              <ModalBody className="py-6 space-y-8">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spinner size="lg" color="warning" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
                      Fetching History...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Top 3 Winners - Compact Podium */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {topThree.map((winner, idx) => (
                        <div
                          key={winner.player}
                          className={`relative flex-1 p-3 rounded-2xl border transition-all flex items-center gap-4 ${
                            idx === 0
                              ? "bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20"
                              : "bg-zinc-300/50 dark:bg-zinc-800/40 border-white/5"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black ${
                              idx === 0
                                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/50"
                                : idx === 1
                                  ? "bg-zinc-300 text-black"
                                  : "bg-amber-700"
                            }`}
                          >
                            {idx + 1}
                          </div>

                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <SAvatar
                              username={winner.player}
                              size="sm"
                              radius="full"
                            />
                            <div className="flex flex-col min-w-0">
                              <SUsername
                                username={`@${winner.player}`}
                                className="text-xs font-black truncate"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black italic">
                                  {winner.score}m
                                </span>
                                <span className="text-[9px] font-black text-emerald-500">
                                  +{winner.reward.toFixed(2)} {symbol}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* All Participants Table - Synced with GlobalSummitTab */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-zinc-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                          All Participants & Rankings
                        </h3>
                      </div>
                      <div className="bg-zinc-300/50 dark:bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden p-2">
                        <DataTable
                          data={processedData.map((item, i) => ({
                            ...item,
                            rank: i + 1,
                          }))}
                          columns={[
                            {
                              key: "rank",
                              header: "#",
                              sortable: true,
                              className: "w-10 px-2 py-2",
                              render: (rank) => (
                                <span className="text-[10px] font-black text-zinc-500">
                                  {rank < 10 ? `0${rank}` : rank}
                                </span>
                              ),
                            },
                            {
                              key: "player",
                              header: "Player",
                              sortable: true,
                              searchable: true,
                              className: "px-2 py-2",
                              render: (player, row) => (
                                <div className="flex items-center gap-2">
                                  <SAvatar
                                    radius="full"
                                    size={"xs"}
                                    username={player}
                                  />
                                  <div>
                                    <SUsername
                                      className="text-xs font-bold text-muted"
                                      username={`@${player}`}
                                    />
                                    {row.reward > 0 && (
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                                          {row.reward.toFixed(3)} {symbol}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ),
                            },
                            {
                              key: "score",
                              header: "Performance",
                              sortable: true,
                              className: "px-2 py-2",
                              render: (score, row) => (
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-white bg-zinc-800 px-2 py-0.5 rounded-md">
                                      {score}m
                                    </span>
                                    {row.plays && (
                                      <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                                        <History size={10} />
                                        {row.plays}
                                      </span>
                                    )}
                                  </div>
                                  {(row.combos ?? 0) > 0 && (
                                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-sm w-fit">
                                      <Target size={10} />
                                      <span className="text-[8px] font-bold uppercase tracking-wider">
                                        {row.combos} Combos
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ),
                            },
                          ]}
                          initialLoadCount={15}
                        />
                      </div>
                    </div>
                  </>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
