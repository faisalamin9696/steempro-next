"use client";

import { memo } from "react";
import {
  Zap,
  Mountain,
  Gamepad2,
  Target as PrecisionIcon,
  Info,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { DAILY_CHALLENGES } from "./Config";

interface Props {
  energy: number;
  dailyProgress: {
    ascent: number;
    combos: number;
    plays: number;
    lastReset: string;
    claimed: string[];
  };
  claimChallenge: (id: string) => void;
  syncingChallengeId: string | null;
  isSeasonActive: boolean;
  currentSeason: number;
}

export const DailyChallengesTab = memo(
  ({
    energy,
    dailyProgress,
    claimChallenge,
    syncingChallengeId,
    isSeasonActive,
    currentSeason,
  }: Props) => {
    return (
      <div className="space-y-6 pt-2">
        {/* Header Stat Card */}
        <div className="relative overflow-hidden bg-zinc-300/40 dark:bg-zinc-900/60 border border-white/10 rounded-[2.5rem] p-5 sm:p-6 shadow-2xl">
          {/* Animated Ornaments */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2.5 bg-amber-500/10 border border-amber-500/20 rounded-full items-center flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                    Daily Operations
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
                Tactical <span className="text-amber-500">Challenges</span>
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider max-w-xs leading-relaxed italic">
                Push your limits daily to accumulate energy reserves for the
                laboratory.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="group relative flex items-center gap-4 bg-zinc-350/40 dark:bg-zinc-950/40 border border-white/10 p-3 pr-5 rounded-4xl backdrop-blur-xl shadow-2xl transition-all"
            >
              <div className="absolute inset-0 bg-amber-500/5 dark:bg-amber-500/5 rounded-4xl group-hover:bg-amber-500/10 transition-colors" />
              <div className="relative p-2.5 bg-amber-500 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-all">
                <Zap size={20} className="text-black" fill="currentColor" />
              </div>
              <div className="relative flex flex-col">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">
                  Energy Reserves
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black tabular-nums tracking-tighter">
                    {energy}
                  </span>
                  <span className="text-[10px] font-black text-zinc-600 uppercase">
                    nrg
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {isSeasonActive ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
              {DAILY_CHALLENGES.map((challenge, idx) => {
                const current =
                  (challenge.type === "ascent"
                    ? dailyProgress.ascent
                    : challenge.type === "combos"
                      ? dailyProgress.combos
                      : dailyProgress.plays) || 0;
                const progress = Math.min(
                  100,
                  (current / challenge.target) * 100,
                );
                const isCompleted = current >= challenge.target;
                const isClaimed = dailyProgress.claimed.includes(challenge.id);
                const isSyncing = syncingChallengeId === challenge.id;

                const Icon =
                  challenge.type === "ascent"
                    ? Mountain
                    : challenge.type === "combos"
                      ? PrecisionIcon
                      : Gamepad2;

                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`group relative flex flex-col gap-4 p-4 rounded-4xl border transition-all duration-500 overflow-hidden ${
                      isClaimed
                        ? "dark:bg-zinc-950/20 bg-zinc-300/20 border-white/5 opacity-70"
                        : isCompleted
                          ? "bg-zinc-950/40 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                          : "bg-zinc-300/50 dark:bg-zinc-950/40 border-white/10 hover:border-amber-500/30"
                    }`}
                  >
                    {/* Status Overlay for Completed/Claimed */}
                    {isClaimed && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <CheckCircle2
                            size={10}
                            className="text-emerald-500"
                          />
                          <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">
                            Claimed
                          </span>
                        </div>
                      </div>
                    )}

                    {!isClaimed && isCompleted && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-3 right-3"
                      >
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                          <Sparkles size={10} className="text-amber-500" />
                          <span className="text-[8px] font-black uppercase text-amber-500 tracking-widest">
                            Ready
                          </span>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className={`p-3 rounded-xl border shrink-0 transition-all ${
                          isClaimed
                            ? "dark:bg-zinc-800/40 bg-zinc-300/30 text-zinc-600 border-transparent"
                            : isCompleted
                              ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                              : "bg-zinc-900 text-amber-500 border-white/10 group-hover:border-amber-500/30 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="flex flex-col gap-0.5 pr-10">
                        <h4
                          className={`text-base font-black italic uppercase tracking-tighter ${isClaimed ? "text-zinc-600" : "text-zinc-900 dark:text-white"}`}
                        >
                          {challenge.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-relaxed italic">
                          {challenge.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-0.5">
                            Progress
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span
                              className={`text-lg font-black tabular-nums ${isClaimed ? "text-zinc-600" : isCompleted ? "text-emerald-500" : "text-zinc-900 dark:text-white"}`}
                            >
                              {Math.floor(current)}
                            </span>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                              / {challenge.target}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-0.5">
                            Reward
                          </span>
                          <div
                            className={`flex items-center gap-1 p-0.5 px-2.5 rounded-full border ${isClaimed ? "bg-zinc-800/20 border-white/5 text-zinc-700" : "bg-amber-500/10 border-amber-500/20 text-amber-500"}`}
                          >
                            <Zap size={8} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              +{challenge.reward}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="relative h-1.5 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            isClaimed
                              ? "bg-zinc-800"
                              : isCompleted
                                ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                : "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          }`}
                        />
                      </div>
                    </div>

                    <Button
                      size="md"
                      onPress={() => claimChallenge(challenge.id)}
                      isLoading={isSyncing}
                      isDisabled={
                        !isCompleted || isClaimed || !!syncingChallengeId
                      }
                      className={`h-11 w-full rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-300 relative overflow-hidden group/btn ${
                        isClaimed
                          ? "bg-zinc-800/20 text-zinc-600 border border-white/5 cursor-not-allowed"
                          : isCompleted
                            ? "bg-emerald-600 hover:bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                            : "bg-zinc-900 text-zinc-600 border border-white/5 hover:border-amber-500/20 hover:text-amber-500"
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isClaimed ? (
                          "MISSION COMPLETED"
                        ) : isSyncing ? (
                          "PROCESSING..."
                        ) : isCompleted ? (
                          <>
                            CLAIM REWARD <ArrowRight size={14} />
                          </>
                        ) : (
                          "IN PROGRESS"
                        )}
                      </span>
                      {!isClaimed && isCompleted && (
                        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col mt-4 items-center justify-center py-12 px-4 text-center dark:bg-zinc-950/20 bg-zinc-300/30 rounded-4xl border border-white/5">
              <div className="p-4 bg-zinc-800/30 rounded-3xl mb-4 text-zinc-500">
                <Zap size={32} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-2">
                Daily Challenges Inactive
              </h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider max-w-xs leading-relaxed">
                Challenges and Energy rewards are only available during active
                seasons. Stay tuned for the next climb!
              </p>
            </div>
          )}

          {/* Season Reset Alert */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex items-center gap-4 bg-amber-500/5 border border-amber-500/10 p-4 rounded-4xl mt-8 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl rounded-full -mr-12 -mt-12" />
            <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0">
              <Info size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                Season Reset Notice
              </span>
              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                Energy is season-specific. Your balance for{" "}
                <span className="font-bold">Season {currentSeason}</span> will
                be reset when the season ends to ensure a fresh start for all
                competitors.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  },
);
