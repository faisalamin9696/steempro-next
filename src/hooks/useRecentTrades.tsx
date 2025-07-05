import parseAsset from "@/utils/helper/parse-asset";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const CONDENSER_API = "https://api.steemit.com"; // Or your custom node

interface RecentTrade {
  timestamp: string;
  price: number;
  amount: number;
  total: number;
  type: "buy" | "sell";
}

interface CondenserTrade {
  date: string;
  current_pays: string;
  open_pays: string;
}

export const useRecentTrades = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["recentTrades"],
    queryFn: async () => {
      const end = new Date();
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

      const body = {
        jsonrpc: "2.0",
        method: "market_history_api.get_trade_history",
        params: {
          start: start.toISOString().split(".")[0], // e.g. "2025-06-28T12:00:00"
          end: end.toISOString().split(".")[0],
          limit: 50,
        },
        id: 1,
      };

      const res = await fetch(CONDENSER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      return json.result?.trades || [];
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const trades: RecentTrade[] = useMemo(() => {
    if (!data) return [];

    return data.map((trade: CondenserTrade) => {
      const priceParts = parseMarketPrice(trade);
      return {
        timestamp: trade.date,
        price: priceParts.price,
        amount: priceParts.amount,
        total: priceParts.total,
        type: priceParts.type,
      };
    });
  }, [data]);

  return {
    trades:trades.reverse(),
    isLoading,
    error: error?.message || null,
  };
};

function parseMarketPrice(trade: CondenserTrade): {
  price: number;
  amount: number;
  total: number;
  type: "buy" | "sell";
} {
  // STEEM received, SBD paid (buy order)
  const current_pays = parseAsset(trade.current_pays);
  const open_pays = parseAsset(trade.open_pays);

  if (current_pays.symbol === "SBD" && open_pays.symbol === "STEEM") {
    const sbd = current_pays.amount;
    const steem = open_pays.amount;
    return {
      price: sbd / steem,
      amount: steem,
      total: sbd,
      type: "buy",
    };
  }

  // STEEM sold for SBD (sell order)
  if (current_pays.symbol === "STEEM" && open_pays.symbol === "SBD") {
    const steem = current_pays.amount;
    const sbd = open_pays.amount;
    return {
      price: sbd / steem,
      amount: steem,
      total: sbd,
      type: "sell",
    };
  }

  return {
    price: 0,
    amount: 0,
    total: 0,
    type: "buy",
  };
}
