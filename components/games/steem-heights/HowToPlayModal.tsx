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

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HowToPlayModal = ({ isOpen, onOpenChange }: Props) => {
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
                    Master the <span className="text-amber-500">Climb</span>
                  </h2>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                    Essential Survival Guide
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="py-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Drop Control",
                    desc: "TAP anywhere to drop the moving block. Timing is everything.",
                    icon: MousePointer2,
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/20",
                  },
                  {
                    title: "Precision Slicing",
                    desc: "Blocks must land on the foundation. Overhanging parts are sliced off instantly!",
                    icon: Target,
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/20",
                  },
                  {
                    title: "Perfect Streak",
                    desc: "Aligning blocks exactly gives a PERFECT score. Increases combos and make less wind resistance.",
                    icon: Zap,
                    color: "text-purple-500",
                    bg: "bg-purple-500/10",
                    border: "border-purple-500/20",
                  },
                  {
                    title: "Altitude Bonus",
                    desc: "Every 10 successful combos grants a massive +10m Altitude Bonus!",
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
                    key={item.title}
                    className={`p-4 ${item.bg} border ${item.border} rounded-2xl space-y-2`}
                  >
                    <div className={`flex items-center gap-2 ${item.color}`}>
                      <item.icon size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 bg-zinc-400/20 dark:bg-zinc-900/60 border border-white/5 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="text-amber-500" size={20} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest">
                    Gravity Pulse
                  </h4>
                  <p className="text-[11px] font-medium text-zinc-500">
                    You have 5 seconds to drop each block. Taking too long
                    triggers an{" "}
                    <span className="text-red-500 font-bold italic">
                      Automatic Drop!
                    </span>
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
                Start Your Ascent
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
