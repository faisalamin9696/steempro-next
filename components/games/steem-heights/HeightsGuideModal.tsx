"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { HelpCircle, Zap, Wind, MousePointer2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const HeightsGuideModal = ({ isOpen, onOpenChange }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      className=" dark:bg-zinc-950 border border-white/10"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pb-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <HelpCircle className="text-amber-500" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tight">
                    Climber's Guide
                  </h2>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                    Master the Steem Heights
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-6">
                {/* How to Play */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
                    <MousePointer2 size={16} className="text-zinc-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-wide">
                      How to Play
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Tap anywhere to drop the moving block. Your goal is to
                      stack them as perfectly as possible. Any part hanging off
                      the edge will be sliced away!
                    </p>
                  </div>
                </div>

                {/* Perfect Shots */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Zap size={16} className="text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-wide">
                      The "Perfect" Shot
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Align a block exactly with the one below to score a{" "}
                      <span className="text-amber-500 font-bold">PERFECT</span>.
                      This preserves the block width and keeps your foundation
                      strong.
                    </p>
                  </div>
                </div>

                {/* Streak & Combo */}
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Wind size={16} className="text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-wide">
                      Dynamic Combo Rewards
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Hitting{" "}
                      <span className="font-bold">3 Perfects</span>{" "}
                      in a row triggers a Combo! Higher{" "}
                      <span className="text-emerald-500 font-bold font-mono">
                        Wind Speeds
                      </span>{" "}
                      grant bigger altitude bonuses (up to +5m).
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                className="text-zinc-500 font-black uppercase tracking-widest text-[10px]"
                onPress={onClose}
              >
                Got it, Captain!
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
