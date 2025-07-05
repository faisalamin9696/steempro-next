import { client } from "@/libs/steem/condenser";
import parseAsset from "@/utils/helper/parse-asset";
import { getSettings } from "@/utils/user";
import { useQuery } from "@tanstack/react-query";

interface OrderBookEntry {
  steem: number;
  sbd: number;
  price: number;
}

interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export const useOrderBook = () => {
  const {
    data: orderBookData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orderBook"],
    queryFn: async () => {
      const result = await client.call("condenser_api", "get_order_book", [20]); // correct format: array, not object

      if (!result || !result.bids || !result.asks) {
        throw new Error("Invalid order book data received from condenser API.");
      }

      const parseOrder = (
        order: any,
        type: "bids" | "asks"
      ): OrderBookEntry => {
        const order_price = order.order_price;
        const base = parseAsset(order_price.base);
        const quote = parseAsset(order_price.quote);
        const steem = base.symbol === "STEEM" ? base.amount : quote.amount;
        const sbd = base.symbol === "SBD" ? base.amount : quote.amount;

        // Correct price calculation based on actual base/quote direction
        const price = Number((sbd / steem)?.toFixed(6));

        return { steem, sbd, price };
      };

      const bids = result.bids.map((b: any) => parseOrder(b, "bids"));
      const asks = result.asks.map((a: any) => parseOrder(a, "asks"));

      return { bids, asks } as OrderBookData;
    },
    staleTime: 45 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 2,
  });

  const totalOpenOrders =
    orderBookData?.bids.length && orderBookData?.asks.length
      ? orderBookData.bids.length + orderBookData.asks.length
      : 0;

  return {
    orderBookData,
    isLoading,
    error: error?.message || null,
    totalOpenOrders,
  };
};
