"use client";

import { memo } from "react";
import { Crown } from "lucide-react";
import SAvatar from "@/components/ui/SAvatar";
import { HighScore, BLOCK_HEIGHT, CANVAS_HEIGHT } from "../Config";

interface GhostMarkersProps {
  highScores: HighScore[];
  username: string;
}

export const GhostMarkers = memo(
  ({ highScores, username }: GhostMarkersProps) => {
    return (
      <>
        {highScores.map((hs, hidx) => {
          const isOwn = hs.player === username;
          const isTop = hidx === 0;

          return (
            <div
              key={`ghost-${hs.player}-${hidx}`}
              className="absolute w-full border-t border-dashed border-zinc-500/20 z-0 flex items-center justify-start pointer-events-none will-change-transform"
              style={{
                transform: `translate3d(0, ${-((hs.score * BLOCK_HEIGHT) / CANVAS_HEIGHT) * CANVAS_HEIGHT}px, 0)`,
                left: 0,
                bottom: 0,
              }}
            >
              <div
                className={`flex items-center gap-2 bg-zinc-950/80 px-2 py-1 rounded-r-xl border-r border-y ${
                  isOwn
                    ? "border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    : "border-zinc-500/20"
                }`}
              >
                <div className="relative">
                  <SAvatar
                    username={hs.player}
                    radius="full"
                    size={20}
                    className={`border shadow-sm ${
                      isOwn ? "border-amber-500/50" : "border-zinc-700/50"
                    }`}
                  />

                  {isTop && (
                    <div className="absolute self-center -top-2 right-[4px]  text-amber-500 drop-shadow-sm">
                      <Crown size={10} fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[8px] font-semibold uppercase tracking-widest leading-none ${
                      isOwn ? "text-amber-500" : "text-zinc-400"
                    }`}
                  >
                    {hs.player} {isOwn && "(YOU)"}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-500 mt-0.5">
                    {hs.score}m
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  },
);
