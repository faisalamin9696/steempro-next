"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Star,
  Zap,
  Shield,
  Heart,
  CheckCircle2,
  Mountain,
} from "lucide-react";
import { Button } from "@heroui/button";
import {
  SKINS,
  Skin,
  POWER_UPS,
  PowerUp,
} from "./Config";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { useTranslations } from "next-intl";

interface Props {
  selectedSkin: Skin;
  onSelectSkin: (id: string) => void;
  username: string;
  energy: number;
  activePowerUp: PowerUp | null;
  onPurchasePowerUp: (powerUp: PowerUp) => void;
  purchasedSkins: string[];
  onPurchaseSkin: (skin: Skin) => void;
  gameState: "idle" | "playing" | "gameover";
  syncingPowerUpId: string | null;
  syncingSkinId: string | null;
}

export const SkinShopTab = React.memo(
  ({
    selectedSkin,
    onSelectSkin,
    username,
    energy,
    activePowerUp,
    onPurchasePowerUp,
    purchasedSkins = [],
    onPurchaseSkin,
    gameState,
    syncingPowerUpId,
    syncingSkinId,
  }: Props) => {
    const isPlaying = gameState === "playing";
    const isAnySyncing = !!syncingPowerUpId || !!syncingSkinId;
    const t = useTranslations("Games.steemHeights.leaderboard.lab");

    const handleAction = (skin: Skin) => {
      if (isPlaying) return;

      // Check if this skin conflicts with the currently active power-up
      if (activePowerUp?.conflicts?.includes(skin.id)) {
        toast.error(
          t("conflictToast", {
            skin: t(`items.skins.${skin.id}.name`),
            powerUp: t(`items.powerups.${activePowerUp.id}.name`),
          }),
        );
        return;
      }

      const isOwned = skin.price === 0 || purchasedSkins.includes(skin.id);

      if (isOwned) {
        onSelectSkin(skin.id);
      } else {
        if (!username) {
          toast.error(t("loginToast"));
          return;
        }
        onPurchaseSkin(skin);
      }
    };

    const getIcon = (id: string) => {
      switch (id) {
        case "glacier":
          return <Zap className="text-white" size={20} />;
        case "steel":
          return <Shield className="text-white" size={20} />;
        case "phoenix":
          return <Heart className="text-white" size={20} />;
        case "gold":
          return <Star className="text-white" size={20} />;
        case "default":
          return <Mountain className="text-white" size={20} />;
        default:
          return <ShoppingBag className="text-white" size={20} />;
      }
    };

    return (
      <div
        className={`space-y-8 pt-2 ${isPlaying ? "opacity-60 pointer-events-none" : ""}`}
      >
        {isPlaying && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center justify-center gap-2">
            <Zap size={14} className="text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
              {t("disabled")}
            </span>
          </div>
        )}

        {/* Energy & Power-ups Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <Zap size={14} className="text-amber-500" fill="currentColor" />
                {t("powerups")}
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                {t("powerupsSub")}
              </p>
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
            >
              <Zap size={14} className="text-amber-500" fill="currentColor" />
              <span className="text-xs font-black text-amber-500 tracking-tight">
                {energy}
              </span>
            </motion.div>
          </div>

          <ScrollShadow
            orientation="horizontal"
            className="pb-6 -mx-4 px-4 sm:mx-0 sm:px-0"
            hideScrollBar
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-4">
              {POWER_UPS.map((pu, i) => {
                const isActive = activePowerUp?.id === pu.id;
                const canAfford = energy >= pu.cost;

                // Check for conflicts between current skin and power-ups
                const hasConflict = pu.conflicts?.includes(selectedSkin.id);

                return (
                  <motion.div
                    key={pu.id}
                    initial={{ opacity: 0.8, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={twMerge(
                      "p-5 rounded-4xl border transition-all relative overflow-hidden group",
                      isActive
                        ? "bg-amber-500 border-transparent shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)]"
                        : hasConflict
                          ? "bg-zinc-300/20 dark:bg-zinc-800/20 dark:border-white/5 border-black/5 opacity-70"
                          : "bg-zinc-300/40 dark:bg-zinc-900/40 dark:border-white/5 border-black/5 hover:border-amber-500/30 dark:hover:bg-zinc-900/60",
                    )}
                  >
                    {/* Card Background Glow */}
                    {isActive && (
                      <div className="absolute -inset-10 bg-white/20 blur-3xl opacity-30 animate-pulse pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div
                        className={twMerge(
                          "p-3 rounded-2xl transition-colors",
                          isActive
                            ? "bg-black/20 text-white"
                            : hasConflict
                              ? "bg-zinc-500/10 text-zinc-500"
                              : "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20",
                        )}
                      >
                        {pu.type === "wind_shield" && <Shield size={20} />}
                        {pu.type === "slow_motion" && <Zap size={20} />}
                        {pu.type === "extra_gear" && <Heart size={20} />}
                      </div>

                      {!isActive && !hasConflict && (
                        <div className="flex items-center gap-1.5 bg-white/40 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                          <Zap
                            size={12}
                            className="text-amber-500"
                            fill="currentColor"
                          />
                          <span className="text-[11px] font-black">
                            {pu.cost}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 space-y-1.5 mb-5">
                      <h4
                        className={twMerge(
                          "text-[13px] font-black uppercase tracking-widest",
                          isActive
                            ? "text-black"
                            : hasConflict
                              ? "text-zinc-600 dark:text-zinc-500"
                              : " group-hover:text-amber-500",
                        )}
                      >
                        {t(`items.powerups.${pu.id}.name`)}
                      </h4>
                      <p
                        className={twMerge(
                          "text-[10px] font-medium leading-relaxed italic",
                          isActive ? "text-black/80" : "text-zinc-500",
                        )}
                      >
                        {hasConflict
                          ? t("conflictMsg", {
                              skin: t(`items.skins.${selectedSkin.id}.name`),
                            })
                          : t(`items.powerups.${pu.id}.description`)}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onPress={() => onPurchasePowerUp(pu)}
                      isLoading={syncingPowerUpId === pu.id}
                      isDisabled={
                        isActive ||
                        !canAfford ||
                        isPlaying ||
                        isAnySyncing ||
                        hasConflict
                      }
                      className={twMerge(
                        "w-full h-10 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all relative z-10 overflow-hidden",
                        isActive
                          ? "bg-black/10 text-black border border-black/10"
                          : hasConflict
                            ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 opacity-50 border border-white/5"
                            : canAfford
                              ? "dark:bg-white/10 bg-black/10 hover:bg-white hover:text-black shadow-lg"
                              : "bg-zinc-800 text-zinc-600 cursor-not-allowed",
                      )}
                    >
                      {isActive ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 size={12} />
                          {t("ready")}
                        </span>
                      ) : hasConflict ? (
                        t("skinConflict")
                      ) : canAfford ? (
                        t("activate")
                      ) : (
                        t("insufficient")
                      )}
                    </Button>

                    {isActive && (
                      <motion.div
                        layoutId="active-shine"
                        className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/30 to-white/0"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </ScrollShadow>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <ShoppingBag size={14} className="text-primary" />
              {t("skins")}
            </h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
              {t("skinsSub")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SKINS.map((skin, i) => {
            const isSelected = selectedSkin.id === skin.id;
            const isOwned =
              skin.price === 0 || purchasedSkins.includes(skin.id);
            const canAfford = energy >= skin.price;

            return (
              <motion.div
                initial={{ opacity: 0.8, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ delay: i * 0.05 }}
                key={skin.id}
                className={`relative group p-6 rounded-[2.5rem] border transition-all duration-400 ${
                  isSelected
                    ? "bg-zinc-900 border-amber-500/40 shadow-[0_30px_60px_-20px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/10"
                    : "bg-zinc-50/50 dark:bg-zinc-900/40 border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-zinc-900/60 shadow-sm hover:shadow-2xl"
                } backdrop-blur-xl overflow-hidden`}
              >
                {/* Seasonal Ribbon / Badge */}
                {isSelected && (
                  <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none z-20">
                    <div className="absolute top-4 -right-8 bg-amber-500 text-black text-[8px] font-black uppercase tracking-tighter py-1.5 px-10 rotate-45 shadow-lg border-b border-black/10">
                      {t("active")}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden ring-4 ring-black/5 dark:ring-white/5"
                      style={{ backgroundColor: skin.color }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-black/20 pointer-events-none" />
                      <div className="relative z-10 scale-125 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
                        {getIcon(skin.id)}
                      </div>
                    </div>
                    {/* Background Glow */}
                    <div
                      className="absolute -inset-4 blur-3xl opacity-20 pointer-events-none -z-1"
                      style={{ backgroundColor: skin.color }}
                    />
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5">
                      {t("ability")}
                    </span>
                    <span
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black italic border transition-colors ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                          : "bg-zinc-500/10 border-zinc-500/20 text-zinc-500 dark:text-zinc-400 group-hover:border-zinc-500/40"
                      }`}
                    >
                      {t(`items.skins.${skin.id}.ability`)}
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <h4
                    className={twMerge(
                      "text-lg font-black italic tracking-tight mb-2 group-hover:text-amber-500 transition-colors uppercase",
                      isSelected ? "text-white" : "",
                    )}
                  >
                    {t(`items.skins.${skin.id}.name`)}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {t(`items.skins.${skin.id}.description`)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-5 border-t border-black/5 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] leading-none mb-2">
                      {t("cost")}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black tracking-tighter">
                        {isOwned ? t("owned") : skin.price}
                      </span>
                      {!isOwned && skin.price > 0 && (
                        <span className="text-[10px] font-black text-zinc-400 uppercase">
                          {t("energy")}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="md"
                    onPress={() => handleAction(skin)}
                    isLoading={syncingSkinId === skin.id}
                    isDisabled={
                      isSelected ||
                      (!isOwned && !canAfford) ||
                      isPlaying ||
                      isAnySyncing
                    }
                    className={`relative h-11 px-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] overflow-hidden transition-all active:scale-95 ${
                      isSelected
                        ? "bg-amber-500 text-black shadow-[0_15px_30px_-10px_rgba(245,158,11,0.5)] border-none"
                        : isOwned
                          ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-black dark:hover:bg-white dark:hover:text-black border border-black/5 dark:border-white/10"
                          : canAfford
                            ? "bg-amber-500 text-black shadow-lg"
                            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    }`}
                  >
                    {isSelected ? t("equipped") : isOwned ? t("select") : t("purchase")}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="p-4 bg-zinc-300/50 dark:bg-zinc-900/50 border border-white/5 rounded-2xl">
          <p className="text-[9px] text-zinc-500 font-medium text-center italic leading-relaxed">
            {t("footnote")}
            <br />
            <span className="text-amber-500/80 font-bold uppercase tracking-tighter">
              {t("footnoteNote")}
            </span>{" "}
            {t("footnoteSub")}
          </p>
        </div>
      </div>
    );
  },
);
