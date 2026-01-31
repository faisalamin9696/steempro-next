"use client";

import { Card } from "@heroui/card";
import { Trophy, Target, History, Award, Crown } from "lucide-react";
import { Tabs, Tab } from "@heroui/tabs";
import { AvatarGroup } from "@heroui/avatar";
import { HighScore } from "./Config";
import SUsername from "@/components/ui/SUsername";
import SAvatar from "@/components/ui/SAvatar";
import { ScrollShadow } from "@heroui/react";
import { DataTable } from "@/components/ui/data-table";

interface Props {
  highScores: HighScore[];
  userHistory: HighScore[];
  seasonalWinners: any[];
  currentSeason: number;
  isSeasonActive: boolean;
}

export const HeightsLeaderboard = ({
  highScores,
  userHistory,
  seasonalWinners,
  currentSeason,
  isSeasonActive,
}: Props) => {
  return (
    <Card className=" bg-zinc-900/10 border-zinc-800 shadow-xl overflow-hidden relative min-h-[400px]">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Target size={120} className="text-zinc-500" />
      </div>

      <div className="relative z-10 space-y-6 p-4">
        <Tabs
          aria-label="Leaderboard Tabs"
          variant="underlined"
          classNames={{
            base: "w-full",
            tabList: "gap-6 w-full relative rounded-none p-0",
            cursor: "w-full bg-amber-500",
            tab: "max-w-fit px-0 h-12",
            panel: "p-0",
            tabContent:
              "group-data-[selected=true]:text-amber-500 font-black uppercase text-[10px] tracking-widest",
          }}
        >
          <Tab
            key="global"
            title={
              <div className="flex items-center gap-2">
                <Trophy size={14} />
                <span>Global Summit</span>
              </div>
            }
          >
            <div className="space-y-12">
              {/* Season Badge & Status */}
              <div className="flex flex-col items-center gap-4">
                <div className="px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                  <Trophy size={12} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                    Season {currentSeason} Summit
                  </span>
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
                        <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-blue-500/50 rounded-full p-1">
                          🥈
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <SUsername
                          className="text-[10px] font-bold text-zinc-400 max-w-[80px] truncate"
                          username={`@${highScores[1].player}`}
                        />
                        <div className="flex flex-col items-center">
                          <span className="text-[11px] font-black text-blue-500">
                            {highScores[1].score}m
                          </span>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">
                            {highScores[1].plays} Plays
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {highScores[0] && (
                    <div className="flex flex-col items-center gap-2 w-28 -translate-y-4">
                      <div className="relative group">
                        <div className="absolute -inset-2 bg-linear-to-t from-amber-500/30 to-amber-500/10 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-500" />
                        <Crown
                          size={24}
                          className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        />
                        <SAvatar
                          radius="full"
                          size="lg"
                          quality="medium"
                          username={highScores[0].player}
                          className="border-3 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex flex-col items-center pt-1">
                        <SUsername
                          className="text-xs font-black text-amber-500 tracking-tight max-w-[100px] truncate"
                          username={`@${highScores[0].player}`}
                        />
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-white drop-shadow-sm">
                            {highScores[0].score}m
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-tighter text-amber-500/70">
                            {highScores[0].plays} Plays • Champion
                          </span>
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
                          className="border-2 border-cyan-500/30 grayscale-[0.8] group-hover:grayscale-0 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-cyan-500/50 rounded-full p-1">
                          🥉
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <SUsername
                          className="text-[10px] font-bold text-zinc-400 max-w-[80px] truncate"
                          username={`@${highScores[2].player}`}
                        />
                        <div className="flex flex-col items-center">
                          <span className="text-[11px] font-black text-cyan-500">
                            {highScores[2].score}m
                          </span>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">
                            {highScores[2].plays} Plays
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <DataTable
                data={highScores.slice(3)}
                columns={[
                  {
                    key: "rank",
                    header: "Rank",
                    className: "w-12 px-2 py-2",
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
                    render: (plays) => (
                      <span className="text-xs font-bold text-zinc-500">
                        {plays}
                      </span>
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
          </Tab>

          <Tab
            key="history"
            title={
              <div className="flex items-center gap-2">
                <History size={14} />
                <span>My Results</span>
              </div>
            }
          >
            <ScrollShadow className="pt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {(() => {
                const bestScore =
                  userHistory.length > 0
                    ? Math.max(...userHistory.map((h) => h.score))
                    : 0;

                return userHistory.map((hs, i) => {
                  const isLatest = i === 0;
                  const isBest = hs.score === bestScore && bestScore > 0;

                  return (
                    <div
                      key={i}
                      className="flex justify-between items-center group py-1"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-muted">
                          Altitude: {hs.score}m
                        </span>
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
                });
              })()}
              {userHistory.length === 0 && (
                <p className="text-xs text-zinc-600 italic py-4">
                  No climbs recorded yet. Start your journey!
                </p>
              )}
            </ScrollShadow>
          </Tab>

          <Tab
            key="winners"
            title={
              <div className="flex items-center gap-2">
                <Award size={14} />
                <span>Seasonal Hall</span>
              </div>
            }
          >
            <div className="pt-6 space-y-6">
              <div className="flex flex-col items-center justify-center p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <div className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-4">
                  All Time Champions
                </div>
                <AvatarGroup
                  isBordered
                  max={5}
                  size="md"
                  className="justify-center"
                >
                  {seasonalWinners.map((w, i) => (
                    <SAvatar
                      key={i}
                      username={w.player}
                      radius="full"
                      className="border-2 border-zinc-950"
                    />
                  ))}
                </AvatarGroup>
              </div>

              <div className="space-y-3">
                {seasonalWinners.map((w, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                          Season {w.season}
                        </span>
                        <div className="flex items-center gap-2">
                          <SAvatar
                            radius="full"
                            size={"xs"}
                            username={w.player}
                          />
                          <SUsername
                            className="text-xs font-bold text-muted"
                            username={`@${w.player}`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 font-black text-xs">
                        <Crown size={10} className="text-amber-500" />
                        {w.score}m
                      </div>
                      <span className="text-[9px] text-zinc-600 font-bold uppercase">
                        Champion
                      </span>
                    </div>
                  </div>
                ))}
                {seasonalWinners.length === 0 && (
                  <p className="text-xs text-zinc-600 italic py-4 text-center">
                    The hall awaits its first hero...
                  </p>
                )}
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </Card>
  );
};
