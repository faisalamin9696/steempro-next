"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Gamepad2 } from "lucide-react";

export type CheerEvent = {
  id: string;
  username: string;
  type: "START" | "COMBO" | "MILESTONE";
  value?: number | string;
};

interface LiveCheerProps {
  cheer: CheerEvent | null;
}

export const LiveCheer = ({ cheer }: LiveCheerProps) => {
  const [activeCheer, setActiveCheer] = useState<CheerEvent | null>(null);

  useEffect(() => {
    if (cheer) {
      setActiveCheer(cheer);
      const timer = setTimeout(() => setActiveCheer(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [cheer]);

  return (
    <div className="absolute top-4 left-0 right-0 pointer-events-none flex justify-center z-[60]">
      <AnimatePresence mode="wait">
        {activeCheer && (
          <motion.div
            key={activeCheer.id}
            initial={{ y: -10, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 5, opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-full shadow-xl"
          >
            <div className={`${
              activeCheer.type === 'START' ? 'text-blue-400' :
              activeCheer.type === 'COMBO' ? 'text-orange-400' :
              'text-yellow-500'
            }`}>
              {activeCheer.type === 'START' && <Gamepad2 size={12} />}
              {activeCheer.type === 'COMBO' && <Flame size={12} />}
              {activeCheer.type === 'MILESTONE' && <Trophy size={12} />}
            </div>
            
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] text-white font-bold">
                {activeCheer.username}
              </span>
              <span className="text-[9px] text-zinc-400 font-medium lowercase">
                {activeCheer.type === 'START' && "started"}
                {activeCheer.type === 'COMBO' && `${activeCheer.value}x combo!`}
                {activeCheer.type === 'MILESTONE' && `${activeCheer.value}m reached!`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
