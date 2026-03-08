"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { memo } from "react";

interface Props {
  score: number;
}

export const SceneBackground = memo(({ score }: Props) => {
  const altitude = score;

  // Scene transitions based on altitude (meters)
  // 0-20: Earth/Ground
  // 20-50: Atmosphere/Clouds
  // 50-100: Stratosphere/Deep Blue
  // 100+: Space/Stars

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic Night Sky Gradient */}
      <motion.div
        className="absolute inset-0 transition-colors duration-1000"
        animate={{
          background:
            altitude < 30
              ? "linear-gradient(to bottom, #020617, #0f172a, #1e1b4b)" // Deep Midnight
              : altitude < 80
                ? "linear-gradient(to bottom, #020617, #020617, #0f172a)" // Dark Space Edge
                : "linear-gradient(to bottom, #000000, #020617, #020617)", // Absolute Space
        }}
      />

      {/* The Moon */}
      <motion.div
        className="absolute top-20 right-10 w-32 h-32 rounded-full bg-white/90 shadow-[0_0_80px_rgba(255,255,255,0.4)] z-1"
        animate={{
          y: altitude * 2,
          opacity: altitude > 100 ? 0.4 : 0.9,
          scale: altitude > 100 ? 0.8 : 1,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-transparent via-zinc-200/20 to-zinc-400/40 rounded-full" />
        {/* Moon Craters */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-zinc-800/10 rounded-full blur-sm" />
        <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-zinc-800/10 rounded-full blur-sm" />
      </motion.div>

      {/* Stars (Visible throughout, intensity increases with altitude) */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 2,
              height: Math.random() * 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: altitude > 50 ? 1.2 : 0.8,
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Ground Scene (Night Silence) */}
      {altitude < 25 && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-black/60 to-transparent"
          animate={{ y: altitude * 10 }}
        >
          <div className="absolute bottom-4 left-10 w-24 h-12 bg-indigo-950/30 blur-2xl rounded-full" />
          <div className="absolute bottom-6 right-20 w-36 h-18 bg-blue-950/20 blur-3xl rounded-full" />
        </motion.div>
      )}

      {/* Moonlight Silver Clouds */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute bg-indigo-100/10 blur-3xl rounded-full border-t border-white/5"
            style={{
              width: 150 + Math.random() * 250,
              height: 50 + Math.random() * 80,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 40, -40, 0],
              y: altitude * -4 + i * 120,
            }}
            transition={{
              x: { duration: 15 + i * 5, repeat: Infinity, ease: "linear" },
              y: { type: "tween", ease: "linear" },
            }}
          />
        ))}
      </div>

      {/* Atmosphere Depth Glow */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-indigo-950/20 pointer-events-none" />
    </div>
  );
});

SceneBackground.displayName = "SceneBackground";
