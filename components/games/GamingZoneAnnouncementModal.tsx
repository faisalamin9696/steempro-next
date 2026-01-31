"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Gamepad2, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const STORAGE_KEY = "steempro_gaming_zone_announced";

export default function GamingZoneAnnouncementModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      const timer = setTimeout(() => {
        onOpen();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [onOpen]);

  const handleEnter = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onClose();
    router.push("/games");
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onClose();
  };

  if (!hasMounted) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleDismiss}
      size="xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: "bg-zinc-950 border border-zinc-900 shadow-2xl overflow-hidden mx-4",
        header: "border-none pb-0",
        footer: "border-none pt-2",
        backdrop: "bg-black/80 backdrop-blur-md",
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody className="p-0">
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <Image
                  removeWrapper
                  alt="Gaming Zone Announcement"
                  className="z-0 w-full h-full object-cover brightness-75 scale-105"
                  src="/gaming_zone_announcement_banner.png"
                />
                <div className="absolute inset-0 z-10 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                <div className="absolute bottom-4 left-6 z-20">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest backdrop-blur-md"
                  >
                    <Sparkles size={12} className="fill-amber-500" /> New
                    Expansion
                  </motion.div>
                </div>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                    The <span className="text-amber-500">Gaming Zone</span>
                  </h2>
                  <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md">
                    Play immersive blockchain games, compete for top
                    leaderboards, and earn rewards directly on Steem.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      icon: <Gamepad2 className="text-amber-500" size={16} />,
                      title: "Play",
                      desc: "Arcade Games",
                    },
                    {
                      icon: (
                        <TrendingUp className="text-emerald-500" size={16} />
                      ),
                      title: "Compete",
                      desc: "Leaderboards",
                    },
                    {
                      icon: <Trophy className="text-blue-500" size={16} />,
                      title: "Earn",
                      desc: "STEEM & SBD",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 hover:bg-zinc-900 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-zinc-950 w-fit">
                        {item.icon}
                      </div>
                      <div className="space-y-0 text-left">
                        <div className="text-[10px] font-black text-white uppercase tracking-tight">
                          {item.title}
                        </div>
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                          {item.desc}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                fullWidth
                variant="light"
                onPress={handleDismiss}
                className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest h-10 order-2 sm:order-1"
              >
                Maybe Later
              </Button>
              <Button
                fullWidth
                onPress={handleEnter}
                className="bg-white hover:bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest px-8 h-10 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-amber-500/20 order-1 sm:order-2"
                endContent={<Gamepad2 className="shrink-0" size={14} />}
              >
                Enter Zones
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
