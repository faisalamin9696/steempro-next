"use client";

import { useEffect, useState } from "react";

/**
 * Live milliseconds remaining until `expiresAt` (ms epoch), or null before a
 * session exists.
 *
 * The clock is the only state: `remaining` is derived from it, so the effect
 * only ever arms a timer and never writes state synchronously — which is also
 * what keeps it out of the `set-state-in-effect` lint rule a naive
 * `setRemaining(tick())` would trip.
 */
export function useExpiryCountdown(expiresAt: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;
  return Math.max(0, expiresAt - now);
}

/** Format a remaining duration as `4:07`. */
export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
