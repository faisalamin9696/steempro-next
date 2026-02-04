"use client";

import React, { useState, useEffect } from "react";
import { Zap, Trophy, Clock, Info } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { HowToPlayModal } from "./HowToPlayModal";
import { motion } from "framer-motion";

interface Props {
  season: number;
  seasonPost: any | null;
}

export const getRewardPool = (seasonPost?: Post) => {
  if (!seasonPost?.body) return null;
  // Common patterns: "Reward Pool: 100 STEEM", "Pool: 50 SBD", etc.
  const match = seasonPost.body.match(
    /(?:Reward Pool|Pool|Prize Pool):\s*([\d,.]+\s*(?:STEEM|SBD))/i,
  );
  return match
    ? { reward: parseFloat(match[1]), symbol: match[1].split(" ")[1] }
    : null;
};

export const HeightsInfo = ({ season, seasonPost }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonPost?.created) return;

    const calculateTimeLeft = () => {
      const createdAt = moment.unix(seasonPost.created);
      const endAt = createdAt.add(7, "days");
      const now = moment();
      const diff = endAt.diff(now);

      if (diff <= 0) {
        setTimeLeft("Season Ended");
        return;
      }

      const duration = moment.duration(diff);
      const days = Math.floor(duration.asDays());
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [seasonPost]);

  const rewardPool = getRewardPool(seasonPost);

  return (
    <div className="space-y-6 text-center lg:text-left">
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
          <Zap size={12} className="fill-amber-500" /> Skill Competition
        </div>
        <Link
          href={
            seasonPost ? `/@${seasonPost.author}/${seasonPost.permlink}` : "#"
          }
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-amber-500 hover:border-amber-500/50 transition-all cursor-pointer"
        >
          Season {season}
        </Link>
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
            <Trophy size={18} /> {rewardPool.reward} {rewardPool.symbol} Pool
          </div>
        )}
      </div>

      <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm mx-auto lg:mx-0">
        Scale the skyline with unwavering focus. Align each block with surgical
        precision to reach record-breaking altitudes. In this climb, focus is
        your greatest power.
      </p>

      <div className="pt-6 relative group">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            size="lg"
            onPress={onOpen}
            className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-[0.3em] h-14 px-10 rounded-2xl shadow-2xl shadow-amber-900/40 relative overflow-hidden group/btn transition-all active:scale-95"
            startContent={
              <Info
                size={18}
                className="group-hover/btn:rotate-12 transition-transform"
              />
            }
          >
            <span className="relative z-10">Climber's Handbook</span>
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
          </Button>

          {/* Subtle Glow beneath */}
          <div className="absolute -inset-1 bg-amber-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
      </div>

      <HowToPlayModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
};
