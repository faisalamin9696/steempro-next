"use client";

import React from "react";
import { Card } from "@heroui/card";
import { Trophy, Target, History, Award, Crown } from "lucide-react";
import { Tabs, Tab } from "@heroui/tabs";
import { AvatarGroup } from "@heroui/avatar";
import { HighScore } from "./constants";
import SUsername from "@/components/ui/SUsername";
import SAvatar from "@/components/ui/SAvatar";
import { ScrollShadow } from "@heroui/react";

interface Props {
  highScores: HighScore[];
  userHistory: HighScore[];
  seasonalWinners: any[];
}

export const HeightsLeaderboard = ({
  highScores,
  userHistory,
  seasonalWinners,
}: Props) => {
  return (
    <Card className="p-6 bg-zinc-900/10 border-zinc-800 shadow-xl overflow-hidden relative min-h-[400px]">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Target size={120} className="text-zinc-500" />
      </div>

      <div className="relative z-10 space-y-6">
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
            <div className="pt-4 space-y-3">
              {highScores.map((hs, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] w-4 font-black ${
                        i === 0
                          ? "text-amber-500"
                          : i === 1
                            ? "text-blue-500"
                            : i === 2
                              ? "text-cyan-500"
                              : "text-muted"
                      }`}
                    >
                      {i === 0
                        ? "1st"
                        : i === 1
                          ? "2nd"
                          : i === 2
                            ? "3rd"
                            : `0${i + 1}`}
                    </span>
                    <SAvatar radius="full" size={"xs"} username={hs.player} />
                    <SUsername
                      className="text-xs font-bold text-muted"
                      username={`@${hs.player}`}
                    />
                  </div>
                  <span className="text-xs font-black text-white bg-zinc-800 px-2 py-0.5 rounded-md">
                    {hs.score}m
                  </span>
                </div>
              ))}
              {highScores.length === 0 && (
                <p className="text-xs text-zinc-600 italic py-4">
                  Be the first to scale the heights!
                </p>
              )}
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
