"use client";

import type { ChainParameters } from "@/utils/explorerStats";
import { useExplorerSection } from "./useExplorerSection";
import SectionError from "./SectionError";
import { RowListSkeleton } from "./Skeleton";
import ExplorerChainParameters from "./ExplorerChainParameters";

/**
 * Parameters tab container: lazy reference-data fetch on first activation.
 */
export default function ExplorerParametersSection() {
  const { data, error, isLoading, retry } =
    useExplorerSection<ChainParameters>("parameters");

  if (error) {
    return (
      <SectionError onRetry={retry} message="Chain parameters failed to load." />
    );
  }

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
        <RowListSkeleton rows={14} />
      </div>
    );
  }

  return <ExplorerChainParameters params={data} />;
}
