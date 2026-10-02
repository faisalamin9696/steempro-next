"use client";

import { full, usd } from "@/components/explorer/format";
import type { CommunityTagStats } from "@/utils/communityStats";
import { Hash, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

/**
 * "Top tags" card — the community's 10 most-used tags (its own invariant tag
 * excluded), each with an animated usage bar plus the engagement/rewards the
 * posts carrying that tag earned. Summary shows the window's tag totals.
 */

const MEDALS = [
  { chip: "bg-amber-500/15 text-amber-600", bar: "bg-amber-500" },
  {
    chip:
      "bg-default-500/15 text-default-600 dark:bg-default-400/15 dark:text-default-300",
    bar: "bg-default-400",
  },
  { chip: "bg-orange-500/15 text-orange-600", bar: "bg-orange-500" },
];
const DEFAULT_STYLE = { chip: "bg-primary/10 text-primary", bar: "bg-primary" };

function CommunityTagStats({
  tags,
  totalPosts,
  resetKey,
}: {
  tags: CommunityTagStats;
  totalPosts: number;
  resetKey: string;
}) {
  const t = useTranslations("Community.statsPanel");
  const [grown, setGrown] = useState(false);

  // Re-run the bar grow animation whenever the data set changes (range switch).
  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setGrown(true)),
    );
    return () => cancelAnimationFrame(raf);
  }, [resetKey]);

  const max = tags.top[0]?.posts || 1;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Hash size={16} className="text-primary" />
            {t("tags")}
          </h3>
          <p className="text-xs text-default-400 mt-0.5">{t("tagsSub")}</p>
        </div>
        <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-default-100/60 dark:bg-default-100/20 text-default-500 dark:text-default-400">
          {t("tagsSummary", {
            unique: tags.unique,
            usage: tags.usage,
            tagged: tags.taggedPosts,
            posts: totalPosts,
          })}
        </span>
      </div>

      {tags.top.length === 0 ? (
        <p className="text-sm text-default-400 py-6 text-center">
          {t("tagsEmpty")}
        </p>
      ) : (
        <div className="mt-3 flex flex-col">
          {tags.top.map((tag, i) => {
            const style = MEDALS[i] ?? DEFAULT_STYLE;
            return (
              <div
                key={tag.tag}
                className="flex items-center gap-2 sm:gap-3 py-2 border-b border-default-200/50 dark:border-default-100/20 last:border-0"
              >
                <span className="w-5 shrink-0 text-center text-[11px] font-bold text-default-400">
                  {i + 1}
                </span>
                <a
                  href={`/trending/${encodeURIComponent(tag.tag)}`}
                  className={`shrink-0 max-w-[130px] truncate px-2 py-0.5 rounded-md text-xs font-bold transition-opacity hover:opacity-75 ${style.chip}`}
                  title={tag.tag}
                >
                  #{tag.tag}
                </a>
                <div className="hidden sm:block flex-1 min-w-0">
                  <div className="h-1.5 rounded-full bg-default-200/70 dark:bg-default-100/15 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${style.bar}`}
                      style={{
                        width: grown
                          ? `${Math.max(2, (tag.posts / max) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-default-600 dark:text-default-300 shrink-0 sm:w-28 justify-end">
                  {full(tag.posts)}
                  <span className="text-default-400 dark:text-default-500 font-medium">
                    {t("colPosts")}
                  </span>
                </span>
                <span
                  className="hidden sm:flex items-center gap-1 text-xs text-default-500 w-16 justify-end shrink-0"
                  title={t("colComments")}
                >
                  <MessageSquare size={12} />
                  {full(tag.comments)}
                </span>
                <span className="w-16 text-right text-xs font-mono font-bold text-emerald-500 shrink-0">
                  {usd(tag.rewards)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CommunityTagStats;
