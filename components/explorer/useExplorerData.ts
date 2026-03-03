"use client";

import useSWR from "swr";
import {
  condenserApi,
  DynamicGlobalProperties,
  RewardFund,
  MedianPrice,
  SteemBlock,
} from "@/libs/consenser";

const REFRESH_INTERVAL = 3000;

async function fetchGlobalData() {
  const [globals, rewardFund, medianPrice] = await Promise.all([
    condenserApi.getDynamicGlobalProperties(),
    condenserApi.getRewardFund(),
    condenserApi.getCurrentMedianHistoryPrice(),
  ]);
  return { globals, rewardFund, medianPrice };
}

export function useGlobalProps() {
  return useSWR<{
    globals: DynamicGlobalProperties;
    rewardFund: RewardFund;
    medianPrice: MedianPrice;
  }>("explorer-global-props", fetchGlobalData, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  });
}

async function fetchRecentBlocks() {
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

export interface RecentBlock {
  num: number;
  timestamp: string;
  witness: string;
  txCount: number;
}

export function useRecentBlocks() {
  return useSWR<RecentBlock[]>("explorer-recent-blocks", fetchRecentBlocks, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: false,
    dedupingInterval: 2000,
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
