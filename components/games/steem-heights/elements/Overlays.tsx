"use client";

import { motion, AnimatePresence } from "framer-motion";

interface OverlaysProps {
  showPerfect: boolean;
  showBonus: boolean;
  lastBonus: number;
  lastImpactTime: number;
}

export const Overlays = ({
  showPerfect,
  showBonus,
  lastBonus,
  lastImpactTime,
}: OverlaysProps) => {
  return (
    <>
      <AnimatePresence>
        {showPerfect && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 0.6, y: -200, scale: 1.1 }}
            exit={{ opacity: 0, y: -250, scale: 1.3 }}
            className="absolute inset-x-0 bottom-1/2 pointer-events-none  flex items-center justify-center text-center z-40"
          >
            <div className="text-amber-500 font-black italic tracking-widest text-5xl drop-shadow-[0_4px_20px_rgba(245,158,11,0.8)]">
              PERFECT!
            </div>
          </motion.div>
        )}

        {showBonus && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute inset-x-0 top-20 pointer-events-none flex flex-col items-center justify-center text-center z-40"
          >
            <div className="text-amber-400 font-black italic tracking-tighter text-4xl drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
              +{lastBonus}m
            </div>
            <div className="text-white font-black text-sm uppercase tracking-[0.2em] -mt-1 drop-shadow-md">
              COMBO BONUS
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          key={lastImpactTime}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-white pointer-events-none z-40"
        />
      </AnimatePresence>
    </>
  );
};
