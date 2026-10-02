"use client";

import type { LeaderboardsResponse } from "@/utils/explorerStats";
import { useExplorerSection } from "./useExplorerSection";
import SectionError from "./SectionError";
import { TableSkeleton } from "./Skeleton";
import ExplorerLeaderboards from "./ExplorerLeaderboards";

/**
 * Leaderboards tab container: one section request fetches all six boards
 * server-side; while loading each board shows its own table skeleton.
 */
export default function ExplorerLeaderboardsSection() {
  const { data, error, isLoading, retry } =
    useExplorerSection<LeaderboardsResponse>("leaderboards");

  if (error) {
    return (
      <SectionError onRetry={retry} message="Leaderboards failed to load." />
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <TableSkeleton key={i} rows={8} />
        ))}
      </div>
    );
  }

  return <ExplorerLeaderboards {...data} />;
}
