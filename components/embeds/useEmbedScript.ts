"use client";

import { useEffect } from "react";

/**
 * Loads a third-party embed script — or asks it to re-scan — once the
 * blockquote is actually in the document.
 *
 * The two vendors we use behave differently, and neither is documented
 * anywhere in this repo:
 *
 * - **Instagram** ships `instgrm.Embeds.process()`, so after the first load
 *   it only needs to be asked to re-run. Re-injecting `embed.js` instead
 *   would re-render every other Instagram post already on the page.
 * - **TikTok** has no such API. Its `embed.js` only picks up
 *   `blockquote.tiktok-embed` elements that exist when it executes, so the
 *   tag has to be removed and re-appended with a cache-buster to force it to
 *   look again. That is exactly what the npm package this replaces did.
 *
 * Schedules made in the same tick collapse into a single append, so a post
 * with three TikTok videos injects one script rather than three.
 */

type Pending = {
  src: string;
  cacheBust: boolean;
  timer: ReturnType<typeof setTimeout>;
};

const pending = new Map<string, Pending>();

function flush(id: string) {
  const entry = pending.get(id);
  if (!entry) return;
  pending.delete(id);

  document.getElementById(id)?.remove();

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = entry.cacheBust ? `${entry.src}?t=${Date.now()}` : entry.src;
  document.head.appendChild(script);
}

function schedule(id: string, src: string, cacheBust: boolean) {
  const existing = pending.get(id);
  if (existing) clearTimeout(existing.timer);
  pending.set(id, { src, cacheBust, timer: setTimeout(() => flush(id), 0) });
}

function cancel(id: string) {
  const entry = pending.get(id);
  if (!entry) return;
  clearTimeout(entry.timer);
  pending.delete(id);
}

export type EmbedScriptOptions = {
  /**
   * Returns `true` if the vendor's own processor was already loaded and has
   * been asked to re-scan, meaning no script needs injecting. Must be a
   * stable (module-scope) reference — it sits in the effect's dependency
   * list.
   */
  rescan?: () => boolean;
  /**
   * Force a re-run by re-appending the tag with a fresh timestamp. Required
   * for vendors that only read the DOM at execution time.
   */
  cacheBust?: boolean;
};

export function useEmbedScript(
  id: string,
  src: string,
  { rescan, cacheBust = false }: EmbedScriptOptions = {},
) {
  useEffect(() => {
    if (rescan?.()) return;
    schedule(id, src, cacheBust);
    return () => cancel(id);
  }, [id, src, cacheBust, rescan]);
}
