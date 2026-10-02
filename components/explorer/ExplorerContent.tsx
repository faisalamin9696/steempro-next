"use client";

import { Hash } from "lucide-react";
import type { ContentResponse } from "@/utils/explorerStats";
import { useExplorerSection } from "./useExplorerSection";
import SectionError from "./SectionError";
import { ChartSkeleton, Skeleton } from "./Skeleton";
import ExplorerAuthorActivity from "./ExplorerAuthorActivity";
import ExplorerTags from "./ExplorerTags";

/**
 * Content tab: active authors/payouts for the selected window (its own
 * range-scoped request) plus top/active tags (one section request). Each
 * block shows its own skeleton while loading and its own retry on failure.
 */
export default function ExplorerContent() {
  const tags = useExplorerSection<ContentResponse>("content");

  return (
    <div className="space-y-8">
      {/* authors + content volume */}
      <ExplorerAuthorActivity />

      {/* tags */}
      <section>
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Hash size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-lg leading-tight">Tags</h2>
            <p className="text-xs text-default-500 dark:text-default-400 mt-0.5">
              Most used tags all time + tags with posts currently earning
            </p>
          </div>
        </div>

        {tags.error ? (
          <SectionError
            onRetry={tags.retry}
            message="Tag statistics failed to load."
          />
        ) : tags.isLoading || !tags.data ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ChartSkeleton height={280} />
            </div>
            <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
              <div className="flex flex-wrap gap-2" aria-busy>
                {Array.from({ length: 10 }, (_, i) => (
                  <Skeleton
                    key={i}
                    className={`h-7 rounded-full ${i % 3 === 0 ? "w-28" : "w-20"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ExplorerTags top={tags.data.top} active={tags.data.active} />
        )}
      </section>
    </div>
  );
}
