import { useQuery } from "@tanstack/react-query";
import { client } from "@/libs/steem/condenser";

interface MarketPriceData {
  symbol: string;
  last_price: number;
  high_24h: number;
  low_24h: number;
  open_24h: number;
  close_24h: number;
  volume_24h: number;
  change_24h: number;
}

export const useMarketPrice = () => {
  const {
    data: priceData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["marketPrice"],
    queryFn: async (): Promise<MarketPriceData> => {
      const result = await client.call("market_history_api", "get_ticker", {});

      const latest = parseFloat(result.latest);
      const high = parseFloat(result.highest_bid);
      const low = parseFloat(result.lowest_ask);
      const volume = parseFloat(result.steem_volume);
      const open = parseFloat(result.open);
      const close = latest;

      const change = open ? ((latest - open) / open) * 100 : 0;

      return {
        symbol: "STEEM/SBD",
        last_price: latest,
        high_24h: high,
        low_24h: low,
        open_24h: open,
        close_24h: close,
        volume_24h: volume,
        change_24h: change,
      };
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 2,
  });

  return { priceData, isLoading, error: error?.message || null };
};
