import { useState, useMemo, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import {
  History,
  Target,
  FileText,
  Clipboard,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import SAvatar from "@/components/ui/SAvatar";
import SUsername from "@/components/ui/SUsername";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import * as heightsDb from "@/libs/supabase/steem-heights";
import { sdsApi } from "@/libs/sds";
import { condenserApi } from "@/libs/consenser";
import { useAppSelector } from "@/hooks/redux/store";
import { toast } from "sonner";
import { Constants } from "@/constants";
import { calculateRewards } from "./GlobalSummitTab";
import { getCoopConfig, getRewardPool } from "./HeightsInfo";
import { getCommunityReward } from "./GlobalSummitTab";
import { HighScore } from "./Config";

interface SeasonalHallModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedSeason: number | null;
  selectedSeasonPost: any;
  eligibilityMap: Record<string, any>;
}

export function SeasonalHallModal({
  isOpen,
  onOpenChange,
  selectedSeason,
  selectedSeasonPost,
  eligibilityMap,
}: SeasonalHallModalProps) {
  const { data: session } = useSession();
  const t = useTranslations("Games.steemHeights.leaderboard.winners");
  const globalData = useAppSelector((s) => s.globalPropsReducer.value);

  const [seasonData, setSeasonData] = useState<HighScore[]>([]);
  const [localEligibilityMap, setLocalEligibilityMap] = useState<
    Record<string, { sp: number; rep: number; eligible: boolean }>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const isModerator = useMemo(() => {
    return Constants.team.some(
      (teamMember) => teamMember.name === session?.user?.name,
    );
  }, [session]);

  const handleFetchSeasonDetails = async (season: number) => {
    setIsLoading(true);
    setSeasonData([]);
    try {
      const scores = await heightsDb.getHeightsHighScores(season);
      setSeasonData(scores);

      if (scores.length > 0) {
        try {
          const players = scores.slice(0, 100).map((s) => s.player);
          const [accounts] = await Promise.all([
            sdsApi.getAccountsExt(players, null, [
              "name",
              "reputation",
              "vests_own",
            ]),
          ]);

          const resultMap: Record<
            string,
            { sp: number; rep: number; eligible: boolean }
          > = {};
          accounts.forEach((acc: any) => {
            const sp = condenserApi.vestsToSteem(
              acc.vests_own,
              globalData.total_vesting_shares,
              globalData.total_vesting_fund_steem,
            );
            const rep = acc.reputation;
            resultMap[acc.name] = {
              sp,
              rep,
              eligible: rep > 40 && sp >= 50,
            };
          });
          setLocalEligibilityMap((prev) => ({ ...prev, ...resultMap }));
        } catch (error) {
          console.error("Failed to fetch eligibility data:", error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch season details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedSeason) {
      handleFetchSeasonDetails(selectedSeason);
    } else if (!isOpen) {
      setSeasonData([]);
      setLocalEligibilityMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedSeason]);

  const processedData = useMemo(() => {
    if (!selectedSeasonPost || seasonData.length === 0) return [];

    const combinedMap = { ...eligibilityMap, ...localEligibilityMap };

    const coopConfig = getCoopConfig(selectedSeasonPost);
    const totalAltitude = seasonData.reduce((acc, cur) => {
      const eligibility = combinedMap[cur.player];
      if (eligibility?.eligible) {
        return acc + (cur.score || 0);
      }
      return acc;
    }, 0);

    const postPool = getRewardPool(selectedSeasonPost)?.reward ?? 0;
    const communityPool = getCommunityReward(totalAltitude, coopConfig);
    const { rewardMap } = calculateRewards(
      seasonData,
      selectedSeasonPost,
      communityPool,
      combinedMap,
    );

    return seasonData.map((item, i) => ({
      ...item,
      rank: i + 1,
      reward: rewardMap.get(item.player) || 0,
    }));
  }, [selectedSeasonPost, seasonData, eligibilityMap, localEligibilityMap]);

  const { qualifiedData, unqualifiedData } = useMemo(() => {
    const combinedMap = { ...eligibilityMap, ...localEligibilityMap };
    const qualified: typeof processedData = [];
    const unqualified: typeof processedData = [];

    processedData.forEach((p) => {
      const eligibility = combinedMap[p.player];
      if (eligibility?.eligible) {
        qualified.push(p);
      } else if (eligibility) {
        unqualified.push(p);
      } else {
        unqualified.push(p);
      }
    });

    // Assign consecutive ranks only to qualified players
    const rankedQualified = qualified.map((q, index) => ({
      ...q,
      rank: index + 1,
    }));

    return { qualifiedData: rankedQualified, unqualifiedData: unqualified };
  }, [processedData, eligibilityMap, localEligibilityMap]);

  const topThree = useMemo(() => qualifiedData.slice(0, 3), [qualifiedData]);

  const symbol = getRewardPool(selectedSeasonPost)?.symbol || "STEEM";

  const copyTransactionReport = () => {
    if (qualifiedData.length === 0) return;
    const report = qualifiedData
      .filter((p) => (p.reward || 0) > 0)
      .map((p) => {
        return `${p.player}, ${p.reward.toFixed(3)} ${symbol}, Congratulations! You secured Rank #${p.rank} in Steem Heights Season ${selectedSeason}. Keep climbing!`;
      })
      .join("\n");

    navigator.clipboard.writeText(report);
    toast.success(t("transactionReport"));
  };

  const copyMarkdownReport = () => {
    if (qualifiedData.length === 0) return;
    const pool = getRewardPool(selectedSeasonPost);
    const localSymbol = pool?.symbol || "STEEM";

    let md = `### 🏆 Steem Heights Season ${selectedSeason} - Final Altitude Report\n\n`;
    md += `A massive congratulations to all our climbers! Looking at these results, the Steem ecosystem has never felt more alive. Whether you're at the peak or just starting your ascent, every meter counts. Keep pushing your limits! 🏔️✨\n\n`;
    md += `| Rank | Player | Max Altitude | Reward |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    qualifiedData
      .filter((p) => (p.reward || 0) > 0)
      .forEach((p) => {
        md += `| ${p.rank} | @${p.player} | ${p.score}m | ${p.reward.toFixed(3)} ${localSymbol} |\n`;
      });

    md += `\n**Stay tuned for the next season... the cloud line is just the beginning!** 🚀`;

    navigator.clipboard.writeText(md);
    toast.success(t("markdownReport"));
  };

  return (
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
                    {t.rich("archives", {
                      season: selectedSeason ?? 0,
                      span: (chunks) => (
                        <span className="text-amber-500">{chunks}</span>
                      ),
                    })}
                  </h2>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
                    {t("performanceData")}
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
                    {t("txReport")}
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    className="bg-amber-500/10 text-amber-500 font-bold uppercase text-[9px] tracking-widest px-3 rounded-xl border border-amber-500/20 active:scale-95 transition-all"
                    onPress={copyMarkdownReport}
                    startContent={<Clipboard size={12} />}
                  >
                    {t("mdReport")}
                  </Button>
                </div>
              )}
            </ModalHeader>
            <ModalBody className="py-6 space-y-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Spinner size="lg" color="warning" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
                    {t("fetching")}
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

                  {/* All Participants Table */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-zinc-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                        {t("allParticipants")} (Qualified)
                      </h3>
                    </div>
                    <div className="bg-zinc-300/50 dark:bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden p-2">
                      <DataTable
                        data={qualifiedData.map((item, i) => ({
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
                            header: t("table.player"),
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
                                  {player === session?.user?.name && (
                                    <span className="text-[8px] font-black bg-primary-500 text-white px-1 rounded-sm uppercase tracking-widest ml-1">
                                      YOU
                                    </span>
                                  )}
                                  {(eligibilityMap[row.player] ||
                                    localEligibilityMap[row.player]) && (
                                    <div className="flex items-center gap-1 mt-1">
                                      {(
                                        eligibilityMap[row.player] ||
                                        localEligibilityMap[row.player]
                                      ).eligible ? (
                                        <CheckCircle2
                                          size={10}
                                          className="text-emerald-500"
                                        />
                                      ) : (
                                        <XCircle
                                          size={10}
                                          className="text-rose-500"
                                        />
                                      )}
                                      <span className="text-[8px] font-bold text-zinc-500">
                                        REP{" "}
                                        {(
                                          eligibilityMap[row.player] ||
                                          localEligibilityMap[row.player]
                                        ).rep.toFixed(1)}{" "}
                                        |{" "}
                                        {(
                                          eligibilityMap[row.player] ||
                                          localEligibilityMap[row.player]
                                        ).sp.toFixed(0)}{" "}
                                        SP
                                      </span>
                                    </div>
                                  )}
                                  {row.reward > 0 && (
                                    <div className="flex flex-col mt-1">
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
                            header: t("table.performance"),
                            sortable: true,
                            className: "px-2 py-2",
                            render: (score, row: any) => (
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

                                {row.tid && (
                                  <Link
                                    href={`/explorer/transaction/${row.tid}`}
                                    className="flex items-center gap-1 text-[9px] font-black text-primary-500/50 hover:text-primary-500 transition-colors uppercase"
                                  >
                                    <span className="truncate max-w-[50px]">
                                      {row.tid}
                                    </span>
                                    <ExternalLink size={8} />
                                  </Link>
                                )}
                              </div>
                            ),
                          },
                        ]}
                        initialLoadCount={15}
                      />
                    </div>
                  </div>

                  {/* Unqualified Section */}
                  {unqualifiedData.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-zinc-500/10 opacity-70">
                      <div className="flex items-center gap-2 mb-4">
                        <XCircle size={14} className="text-zinc-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Disqualified Climbers
                        </span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-2">
                        <DataTable
                          data={unqualifiedData.map((item) => ({
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
                                  <SAvatar
                                    radius="full"
                                    size={"xs"}
                                    username={player}
                                  />
                                  <div>
                                    <SUsername
                                      className="text-xs font-bold text-zinc-600"
                                      username={`@${player}`}
                                    />
                                    {(eligibilityMap[player] ||
                                      localEligibilityMap[player]) && (
                                      <div className="flex items-center gap-1 mt-1">
                                        <XCircle
                                          size={10}
                                          className="text-rose-500"
                                        />
                                        <span className="text-[8px] font-bold text-zinc-600">
                                          REP{" "}
                                          {(
                                            eligibilityMap[player] ||
                                            localEligibilityMap[player]
                                          ).rep.toFixed(1)}{" "}
                                          |{" "}
                                          {(
                                            eligibilityMap[player] ||
                                            localEligibilityMap[player]
                                          ).sp.toFixed(0)}{" "}
                                          SP
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
                              render: (score, row: any) => (
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
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
