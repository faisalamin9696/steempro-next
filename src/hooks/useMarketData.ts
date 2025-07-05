import { client } from "@/libs/steem/condenser";
import parseAsset from "@/utils/helper/parse-asset";
import { Asset } from "@steempro/dsteem";
import { useQuery } from "@tanstack/react-query";

export interface MarketTicker {
  latest: string;
  lowest_ask: string;
  highest_bid: string;
  percent_change: string;
  steem_volume: Asset;
  sbd_volume: Asset;
}
export const useMarketData = () => {
  const {
    data: marketData,
    isLoading,
    error,
  } = useQuery<MarketTicker>({
    queryKey: ["get_ticker"],
    queryFn: () => client.call("market_history_api", "get_ticker"),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  console.log("Market data hook result:", {
    marketData,
    // hourlyHistory,
    // dailyHistory,
    isLoading,
    error,
  });

  return {
    // orderBook: marketData?.orderBook,
    ticker: marketData,
    volume: marketData
      ? {
          steem_volume: parseAsset(marketData.steem_volume?.toString()),
          sbd_volume: parseAsset(marketData.sbd_volume?.toString()),
        }
      : null,
    // tradeHistory: marketData?.recentTrades || [],
    // hourlyHistory: hourlyHistory || [],
    // dailyHistory: dailyHistory || [],
    isLoading,
    error,
  };
};
