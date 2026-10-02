"use client";

import useSWR from "swr";
import { condenserApi, type SteemBlock } from "@/libs/consenser";
import type { LiveSnapshot, RecentBlock } from "@/utils/explorerStats";

export type { LiveSnapshot, RecentBlock };

const REFRESH_INTERVAL = 3000;

async function fetchGlobalData(): Promise<LiveSnapshot> {
  const [globals, rewardFund, medianPrice] = await Promise.all([
    condenserApi.getDynamicGlobalProperties(),
    condenserApi.getRewardFund(),
    condenserApi.getCurrentMedianHistoryPrice(),
  ]);
  return { globals, rewardFund, medianPrice };
}

/**
 * Live chain snapshot (3s refresh). `initialData` lets the server component
 * seed the first render so the SSR HTML carries real values (and crawlers
 * see them) instead of a loading skeleton.
 */
export function useGlobalProps(initialData?: LiveSnapshot) {
  return useSWR<LiveSnapshot>("explorer-global-props", fetchGlobalData, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: false,
    dedupingInterval: 2000,
    fallbackData: initialData,
  });
}

async function fetchRecentBlocks(): Promise<RecentBlock[]> {
  const g = await condenserApi.getDynamicGlobalProperties();
  const headBlock = g.head_block_number;
  const blockNums = Array.from({ length: 10 }, (_, i) => headBlock - i);
  const blocks = await Promise.all(
    blockNums.map((num) => condenserApi.getBlock(num)),
  );
  return blocks.map((b, i) => ({
    num: blockNums[i],
    timestamp: b.timestamp,
    witness: b.witness,
    txCount: b.transactions?.length || 0,
  }));
}

export function useRecentBlocks(initialData?: RecentBlock[]) {
  return useSWR<RecentBlock[]>("explorer-recent-blocks", fetchRecentBlocks, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: false,
    dedupingInterval: 2000,
    fallbackData: initialData,
  });
}

export function useBlock(blockNum: number | null) {
  return useSWR<SteemBlock>(
    blockNum ? `explorer-block-${blockNum}` : null,
    () => condenserApi.getBlock(blockNum!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    },
  );
}
