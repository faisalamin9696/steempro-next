"use client";

import { Zap, Trophy, Clock } from "lucide-react";
import moment from "moment";

interface Props {
  season: number;
  seasonPost: any | null;
}

export const HeightsInfo = ({ season, seasonPost }: Props) => {
  const getRewardPool = () => {
    if (!seasonPost?.body) return null;
    // Common patterns: "Reward Pool: 100 STEEM", "Pool: 50 SBD", etc.
    const match = seasonPost.body.match(
      /(?:Reward Pool|Pool|Prize Pool):\s*([\d,.]+\s*(?:STEEM|SBD))/i,
    );
    return match ? match[1] : null;
  };

  const getTimeLeft = () => {
    if (!seasonPost?.created) return null;
    const createdAt = moment.unix(seasonPost.created);
    const endAt = createdAt.add(7, "days");
    const now = moment();
    const diff = endAt.diff(now);

    if (diff <= 0) return "Season Ended";

    const duration = moment.duration(diff);
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    return `${days}d ${hours}h ${minutes}m`;
  };

  const rewardPool = getRewardPool();
  const timeLeft = getTimeLeft();

  return (
    <div className="space-y-6 text-center lg:text-left">
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
          <Zap size={12} className="fill-amber-500" /> Skill Competition
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
          Season {season}
        </div>
        {timeLeft && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
            <Clock size={10} /> {timeLeft}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-white to-zinc-600 leading-none">
          STEEM <span className="text-zinc-700">HEIGHTS</span>
        </h1>
        {rewardPool && (
          <div className="flex items-center justify-center lg:justify-start gap-2 text-amber-500 font-black italic tracking-tighter text-xl">
            <Trophy size={18} /> {rewardPool} Pool
          </div>
        )}
      </div>

      <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm mx-auto lg:mx-0">
        Scale the skyline with unwavering focus. Align each block with surgical
        precision to reach record-breaking altitudes. In this climb, focus is
        your greatest power.
      </p>
    </div>
  );
};
