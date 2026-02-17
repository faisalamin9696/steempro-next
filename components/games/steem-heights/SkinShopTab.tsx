"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Zap, Shield, Heart } from "lucide-react";
import { Button } from "@heroui/button";
import { SKINS, Skin } from "./Config";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

interface Props {
  selectedSkin: Skin;
  onSelectSkin: (id: string) => void;
  username: string;
}

export const SkinShopTab = ({
  selectedSkin,
  onSelectSkin,
  username,
}: Props) => {
  const handlePurchase = (skin: Skin) => {
    if (skin.price === 0) {
      onSelectSkin(skin.id);
      return;
    }

    if (!username) {
      toast.error("Please login to purchase skins.");
      return;
    }

    // This would be a real blockchain transaction in a full implementation
    // For now, we'll simulate the selection as if purchased
    toast.success(`${skin.name} activated!`);
    onSelectSkin(skin.id);
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
      default:
        return <ShoppingBag className="text-white" size={20} />;
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Tile Customization
          </h3>
          <p className="text-[9px] text-zinc-600 font-bold uppercase">
            Equip blocks with unique perks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {SKINS.map((skin, i) => {
          const isSelected = selectedSkin.id === skin.id;
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
                    ACTIVE
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
                    Core Ability
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black italic border transition-colors ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-500 dark:text-zinc-400 group-hover:border-zinc-500/40"
                    }`}
                  >
                    {skin.ability}
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
                  {skin.name}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  {skin.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-5 border-t border-black/5 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] leading-none mb-2">
                    Unlock Cost
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black tracking-tighter">
                      {skin.price === 0 ? "FREE" : skin.price}
                    </span>
                    {skin.price > 0 && (
                      <span className="text-[10px] font-black text-zinc-400 uppercase">
                        STEEM
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  size="md"
                  onPress={() => handlePurchase(skin)}
                  className={`relative h-11 px-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] overflow-hidden transition-all active:scale-95 ${
                    isSelected
                      ? "bg-amber-500 text-black shadow-[0_15px_30px_-10px_rgba(245,158,11,0.5)] border-none"
                      : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-black dark:hover:bg-white dark:hover:text-black border border-black/5 dark:border-white/10"
                  }`}
                >
                  {isSelected
                    ? "EQUIPPED"
                    : skin.price === 0
                      ? "SELECT"
                      : "PURCHASE"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 bg-zinc-300/50 dark:bg-zinc-900/50 border border-white/5 rounded-2xl">
        <p className="text-[9px] text-zinc-500 font-medium text-center italic leading-relaxed">
          * Skin abilities are active during gameplay. One skin can be equipped
          at a time.
          <br />
          <span className="text-amber-500/80 font-bold uppercase tracking-tighter">
            Note:
          </span>{" "}
          Skins are valid for the ongoing season and will reset at the start of
          the next season.
        </p>
      </div>
    </div>
  );
};
