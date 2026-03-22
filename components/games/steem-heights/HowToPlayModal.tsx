"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Zap, Target, Trophy, Clock, Info, MousePointer2 } from "lucide-react";
import { motion } from "framer-motion";
import { TIME_LIMIT } from "./Config";
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HowToPlayModal = ({ isOpen, onOpenChange }: Props) => {
  const t = useTranslations("Games.steemHeights.howToPlay");

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="xl"
      className="dark:bg-zinc-950 border border-white/10"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="pb-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 rounded-xl shadow-lg shadow-amber-500/10">
                  <Info className="text-amber-500" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
                    {t.rich("title", {
                      climb: (chunks) => <span className="text-amber-500">{chunks}</span>,
                    })}
                  </h2>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                    {t("subtitle")}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="py-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: "dropControl",
                    icon: MousePointer2,
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/20",
                  },
                  {
                    id: "precision",
                    icon: Target,
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/20",
                  },
                  {
                    id: "perfect",
                    icon: Zap,
                    color: "text-purple-500",
                    bg: "bg-purple-500/10",
                    border: "border-purple-500/20",
                  },
                  {
                    id: "bonus",
                    icon: Trophy,
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/20",
                  },
                ].map((item, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={item.id}
                    className={`p-4 ${item.bg} border ${item.border} rounded-2xl space-y-2`}
                  >
                    <div className={`flex items-center gap-2 ${item.color}`}>
                      <item.icon size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {t(`controls.${item.id}.title`)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                      {t(`controls.${item.id}.desc`)}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 bg-zinc-400/20 dark:bg-zinc-900/60 border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="text-amber-500" size={20} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                    {t("gravityPulse")}
                  </h4>
                  <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
                    {t.rich("gravityDesc", {
                      timeVal: TIME_LIMIT,
                      time: (chunks) => <span className="text-amber-500 font-bold italic">{chunks}</span>,
                      autoDrop: (chunks) => <span className="text-red-500 font-bold italic">{chunks}</span>,
                    })}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Zap
                    className="text-amber-500"
                    size={20}
                    fill="currentColor"
                  />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                    {t("dailyRewards")}
                  </h4>
                  <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
                    {t.rich("dailyDesc", {
                      challenges: (chunks) => <span className="text-amber-500 font-bold">{chunks}</span>,
                      energy: (chunks) => <span className="text-amber-500 font-bold">{chunks}</span>,
                      powerups: (chunks) => <span className="text-amber-500 font-bold">{chunks}</span>,
                      skins: (chunks) => <span className="text-amber-500 font-bold">{chunks}</span>,
                    })}
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-white/5 bg-zinc-400/10 dark:bg-zinc-900/20">
              <Button
                size="lg"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-sm h-14 rounded-2xl shadow-xl shadow-amber-900/20 transition-all active:scale-95"
                onPress={onClose}
              >
                {t("close")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
