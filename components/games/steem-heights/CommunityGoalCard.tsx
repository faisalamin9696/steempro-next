"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Info,
  Target,
  Share2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Progress } from "@heroui/progress";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { toast } from "sonner";

interface CommunityGoalCardProps {
  totalAltitude: number;
  symbol: string;
  config: {
    minReward: number;
    maxReward: number;
    stepSize: number;
    increasePercent: number;
    baseAltitude: number;
  };
}

export const CommunityGoalCard = ({
  totalAltitude,
  symbol,
  config,
}: CommunityGoalCardProps) => {
  const { minReward, maxReward, stepSize, increasePercent, baseAltitude } =
    config;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [copied, setCopied] = useState(false);

  const calculateReward = () => {
    if (totalAltitude < baseAltitude) return 0;
    const steps = Math.floor((totalAltitude - baseAltitude) / stepSize);
    const reward = minReward + steps * (minReward * increasePercent);
    return Math.min(reward, maxReward);
  };

  const currentReward = calculateReward();
  const nextThreshold =
    totalAltitude < baseAltitude
      ? baseAltitude
      : baseAltitude +
        (Math.floor((totalAltitude - baseAltitude) / stepSize) + 1) * stepSize;

  const stepsToMax = Math.ceil(
    (maxReward - minReward) / (minReward * increasePercent),
  );
  const maxAltitude = baseAltitude + stepsToMax * stepSize;

  // Calculate tiers
  const tiers: { altitude: number; reward: number }[] = [];
  for (let i = 0; i <= stepsToMax; i++) {
    const alt = baseAltitude + i * stepSize;
    const rew = minReward + i * (minReward * increasePercent);
    if (rew <= maxReward) {
      tiers.push({ altitude: alt, reward: rew });
    }
  }

  const progressValue = (totalAltitude / maxAltitude) * 100;
  const isMaxed = currentReward >= maxReward;

  const invitationMarkdown = `#### 🏔️ Let'sReach New Heights in Steem Heights!\n\nI'm participating in **Steem Heights**, the ultimate stacking challenge on Steem. We're working together to unlock a massive **${maxReward} ${symbol}** community reward pool!\n\n📈 **Community Progress:** ${totalAltitude.toLocaleString()}m / ${maxAltitude.toLocaleString()}m\n💰 **Current Reward Pool:** ${currentReward.toFixed(1)} ${symbol}\n\nJoin the climb and earn your share of the prize pool based on your performance!\n\n🔗 **Play Now:** https://steempro.com/games/steem-heights`;

  const handleCopy = () => {
    navigator.clipboard.writeText(invitationMarkdown);
    setCopied(true);
    toast.success("Invitation markdown copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto px-4"
      >
        <div className="bg-zinc-300/50 dark:bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group backdrop-blur-xl">
          {/* Animated Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-colors duration-700" />

          <div className="relative z-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Zap size={14} className="fill-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">
                    Community Global Goal
                  </h3>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentReward}
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="text-5xl font-black italic tracking-tighter text-zinc-900 dark:text-white"
                      >
                        {currentReward.toFixed(1)}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-xl font-black text-emerald-500 uppercase italic">
                      {symbol}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1">
                    Current Seasonal Bonus Pool
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3">
                <div className="flex flex-col items-center md:items-end gap-1 bg-zinc-300/50 dark:bg-zinc-900/70 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
                  <div className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Target size={10} className="text-emerald-500" />
                    Max Capability
                  </div>
                  <div className="text-xl font-black italic tracking-tight text-zinc-900 dark:text-white">
                    {maxReward}{" "}
                    <span className="text-xs text-zinc-500">{symbol}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onPress={onOpen}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-[0.2em] text-[9px] h-9 px-6 rounded-xl shadow-lg shadow-emerald-500/20"
                  startContent={<Share2 size={12} />}
                >
                  Invite Friends
                </Button>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-1">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    Total Progress
                  </span>
                  <span className="text-xs font-black text-zinc-900 dark:text-white">
                    {totalAltitude.toLocaleString()}m
                  </span>
                </div>
                {!isMaxed && (
                  <div className="text-right">
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                      Targeting {nextThreshold}m
                    </span>
                    <div className="text-[10px] font-black text-zinc-500 dark:text-zinc-400">
                      +{(minReward * increasePercent).toFixed(1)} {symbol} Boost
                    </div>
                  </div>
                )}
              </div>

              <Progress
                aria-label="Community Progress"
                value={progressValue}
                className="max-w-full"
                size="md"
                radius="full"
                classNames={{
                  base: "p-1",
                  track: "bg-zinc-500/10 dark:bg-zinc-950 p-0.5",
                  indicator:
                    "bg-linear-to-r from-emerald-600 via-emerald-400 to-emerald-500 rounded-full",
                }}
              />

              <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Base Start: {baseAltitude}m
                </div>
                <div className="flex items-center gap-1.5">
                  Max Goal: {maxAltitude}m
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                </div>
              </div>
            </div>

            {/* Tiers List */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 text-center md:text-left">
                Reward Milestones
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tiers.map((tier, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border ${
                      totalAltitude >= tier.altitude
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                        : "bg-zinc-400/20 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-500"
                    } transition-all hover:scale-[1.02] duration-300 flex flex-col justify-between min-h-[70px]`}
                  >
                    <div>
                      <div className="text-[8px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">
                        {tier.altitude}m
                      </div>
                      <div className="text-sm font-black italic">
                        {tier.reward.toFixed(1)}
                        <span className="text-[10px] ml-0.5">{symbol}</span>
                      </div>
                    </div>
                    {totalAltitude >= tier.altitude && (
                      <div className="mt-1 flex justify-end">
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Tooltip Icon */}
          <div className="absolute bottom-4 right-8 text-zinc-700 hover:text-zinc-500 transition-colors cursor-help group/info">
            <Info size={12} />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-950 border border-white/10 rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl backdrop-blur-md">
              <p className="text-[8px] font-bold text-zinc-400 leading-tight">
                Community rewards are calculated from the total combined
                altitude of all players. Every {stepSize}m beyond {baseAltitude}
                m adds {(minReward * increasePercent).toFixed(1)} {symbol} to
                the pool.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Invite Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="lg"
        className="dark:bg-zinc-950 border border-white/10"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                    <Share2 className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
                      Invite <span className="text-emerald-500">Climbers</span>
                    </h2>
                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                      Help break the community goal
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6 space-y-4">
                <div className="p-4 bg-zinc-300/30 dark:bg-zinc-900/50 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Invitation Markdown
                    </span>
                    <Button
                      size="sm"
                      variant="flat"
                      className="bg-zinc-800 text-white min-w-unit-0 px-2 h-7"
                      onPress={handleCopy}
                    >
                      {copied ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  </div>
                  <pre className="text-[10px] font-mono p-3 bg-zinc-950 rounded-xl overflow-x-auto text-emerald-500/80 whitespace-pre-wrap leading-relaxed">
                    {invitationMarkdown}
                  </pre>
                </div>
                <div className="flex gap-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <Info
                    size={14}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />
                  <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">
                    Copy this markdown and paste it in your next post or comment
                    to invite friends. Higher collective altitude means bigger
                    rewards for everyone!
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  onPress={onClose}
                  className="bg-zinc-800 text-white font-black uppercase tracking-widest text-xs h-12 rounded-xl w-full"
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
