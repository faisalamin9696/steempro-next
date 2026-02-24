"use client";

import { useCallback, useRef } from "react";

export const useHeightsSound = (isMuted: boolean, perfectStreak: number) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(
    (type: "stack" | "perfect" | "gameover" | "combo") => {
      if (isMuted) return;
      if (typeof window === "undefined") return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === "stack") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "perfect") {
        osc.type = "sine";
        const frequency = 880 * Math.pow(1.059463, Math.min(perfectStreak, 12));
        osc.frequency.setValueAtTime(frequency, now);
        osc.frequency.exponentialRampToValueAtTime(frequency * 2, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "gameover") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === "combo") {
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = i === notes.length - 1 ? "sine" : "triangle";
          o.frequency.setValueAtTime(freq, now + i * 0.06);
          o.frequency.exponentialRampToValueAtTime(
            freq * 1.05,
            now + i * 0.06 + 0.1,
          );

          o.connect(g);
          g.connect(ctx.destination);

          const volume = i === notes.length - 1 ? 0.15 : 0.1;
          g.gain.setValueAtTime(volume, now + i * 0.06);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.2);

          o.start(now + i * 0.06);
          o.stop(now + i * 0.06 + 0.25);
        });
      }
    },
    [isMuted, perfectStreak],
  );

  return { playSound };
};
