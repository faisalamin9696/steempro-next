import { useOrderBook } from "@/hooks/useOrderBook";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTooltip } from "../ui/chart";

const DepthChart = () => {
  const { orderBookData, isLoading, error } = useOrderBook();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading depth chart...
        </div>
      </div>
    );
  }

  if (error || !orderBookData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Failed to load depth chart</div>
      </div>
    );
  }

  // Process order book data for depth chart
  const processDepthData = () => {
    const bids = orderBookData.bids.sort((a, b) => b.price - a.price);

    const asks = orderBookData.asks.sort((a, b) => a.price - b.price);

    // Calculate cumulative volumes for bids (buy orders)
    let cumulativeBidVolume = 0;
    const bidDepth = bids
      .map((bid) => {
        cumulativeBidVolume += bid.steem;
        return {
          price: bid.price,
          buyVolume: cumulativeBidVolume,
          sellVolume: null,
          side: "buy",
          amount: bid.steem,
        };
      })
      .reverse();

    // Calculate cumulative volumes for asks (sell orders)
    let cumulativeAskVolume = 0;
    const askDepth = asks.map((ask) => {
      cumulativeAskVolume += ask.steem;
      return {
        price: ask.price,
        buyVolume: null,
        sellVolume: cumulativeAskVolume,
        side: "sell",
        amount: ask.steem,
      };
    });

    // Combine and sort by price
    const combinedData = [...bidDepth, ...askDepth].sort(
      (a, b) => a.price - b.price
    );

    return combinedData;
  };

  const depthData = processDepthData();

  const chartConfig = {
    buyVolume: {
      label: "Buy Volume",
      color: "hsl(142, 76%, 36%)", // Green
    },
    sellVolume: {
      label: "Sell Volume",
      color: "hsl(0, 84%, 60%)", // Red
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <div className="text-sm space-y-1">
            <div className="font-medium">
              Price:{" "}
              <span className="font-mono">{Number(label).toFixed(6)} SBD</span>
            </div>
            <div
              className={`${
                data.side === "buy" ? "text-green-400" : "text-red-400"
              }`}
            >
              Side: {data.side === "buy" ? "Buy" : "Sell"}
            </div>
            <div>
              Amount:{" "}
              <span className="font-mono">
                {data.amount.toLocaleString()} STEEM
              </span>
            </div>
            <div>
              Cumulative:{" "}
              <span className="font-mono">
                {(data.buyVolume || data.sellVolume).toLocaleString()} STEEM
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full relative">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          data={depthData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(229, 231, 235, 0.2)"
          />
          <XAxis
            dataKey="price"
            tickFormatter={(value) => parseFloat(value).toFixed(4)}
            className="text-xs"
          />
          <YAxis
            tickFormatter={(value) => `${value.toFixed(0)}`}
            className="text-xs"
          />
          <ChartTooltip content={<CustomTooltip />} />
          {/* Reference line for current price */}
          {/* <ReferenceLine
            x={currentPrice}
            stroke="rgba(229, 231, 235, 0.2)"
            strokeWidth={2}
            strokeDasharray="4 4"
            label={{ value: "Current Price", position: "top" }}
          /> */}
          {/* Buy orders (green area) */}
          <Area
            type="stepAfter"
            dataKey="buyVolume"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.3}
            strokeWidth={2}
            connectNulls={false}
            name="Buy Orders"
          />
          {/* Sell orders (red area) */}
          <Area
            type="stepBefore"
            dataKey="sellVolume"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
            strokeWidth={2}
            connectNulls={false}
            name="Sell Orders"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default DepthChart;
