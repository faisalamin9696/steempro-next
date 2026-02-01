"use client";

import { Trophy } from "lucide-react";
import { AvatarGroup } from "@heroui/avatar";
import SAvatar from "@/components/ui/SAvatar";
import SUsername from "@/components/ui/SUsername";

interface Props {
  seasonalWinners: any[];
}

export const SeasonalHallTab = ({ seasonalWinners }: Props) => {
  return (
    <div className="pt-6 space-y-6">
      <div className="flex flex-col items-center justify-center p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
        <div className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-4">
          All Time Champions
        </div>
        <AvatarGroup isBordered max={5} size="md" className="justify-center">
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
            className="flex justify-between items-center group bg-zinc-300/50 dark:bg-zinc-900/50 p-3 rounded-xl border border-white/5 hover:border-amber-500/20 transition-all hover:translate-x-1"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1 items-start">
                <div className="px-2 py-0.5 rounded bg-zinc-300 dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-800 text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                  Season {w.season}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <SAvatar
                    radius="full"
                    size={"sm"}
                    username={w.player}
                    className="border border-white/10"
                  />
                  <SUsername
                    className="text-sm font-black"
                    username={`@${w.player}`}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full">
                <Trophy size={12} className="fill-amber-500/20" />
                <span className="text-sm font-black italic">{w.score}m</span>
              </div>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">
                Peak Altitude
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
  );
};
