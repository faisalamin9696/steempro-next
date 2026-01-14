import { Spinner } from "@heroui/spinner";

const MarketCandleChart = ({ data }: { data: MarketHistory[] | undefined }) => {
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );

  // Filter out empty buckets to avoid division by zero and invalid candles
  const validData = data.filter((d) => d.high_steem > 0 && d.open_steem > 0);

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-default-400 text-sm">
        No trade data available for the last 24h
      </div>
    );
  }

  const chartWidth = 1200;
  const chartHeight = 400;
  const paddingY = 40;
  const paddingX = 60;

  const getPrice = (sbd: number, steem: number) =>
    steem > 0 ? sbd / steem : 0;

  const prices = validData.flatMap((d) => [
    getPrice(d.high_sbd, d.high_steem),
    getPrice(d.low_sbd, d.low_steem),
  ]);

  const maxHigh = Math.max(...prices);
  const minLow = Math.min(...prices);
  const range = maxHigh - minLow || maxHigh * 0.1 || 0.0001;

  const getX = (index: number) =>
    (index * (chartWidth - paddingX * 2)) / (validData.length - 1) + paddingX;
  const getY = (price: number) =>
    chartHeight -
    paddingY -
    ((price - minLow) / range) * (chartHeight - paddingY * 2);

  return (
    <div className="w-full h-full min-h-[350px] relative group p-4 flex flex-col">
      <div className="flex-1 w-full relative">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="overflow-visible absolute inset-0"
        >
          {/* Grid lines & Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const price = maxHigh - p * range;
            const y = getY(price);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.05"
                  strokeDasharray="4"
                />
                <text
                  x={chartWidth - paddingX + 5}
                  y={y + 4}
                  fill="currentColor"
                  className="text-[10px] opacity-40 font-mono"
                >
                  {price.toFixed(4)}
                </text>
              </g>
            );
          })}

          {validData.map((d, i) => {
            const open = getPrice(d.open_sbd, d.open_steem);
            const close = getPrice(d.close_sbd, d.close_steem);
            const high = getPrice(d.high_sbd, d.high_steem);
            const low = getPrice(d.low_sbd, d.low_steem);
            const isUp = close >= open;
            const x = getX(i);
            const candleWidth =
              ((chartWidth - paddingX * 2) / validData.length) * 0.7;

            return (
              <g key={i} className="hover:opacity-80 cursor-crosshair">
                <title>{`Time: ${new Date(
                  d.time * 1000
                ).toLocaleString()}\nPrice: ${close.toFixed(6)}`}</title>
                {/* Wick */}
                <line
                  x1={x}
                  y1={getY(high)}
                  x2={x}
                  y2={getY(low)}
                  stroke={isUp ? "#17c964" : "#f31260"}
                  strokeWidth="1.5"
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={isUp ? getY(close) : getY(open)}
                  width={candleWidth}
                  height={Math.max(Math.abs(getY(close) - getY(open)), 1)}
                  fill={isUp ? "#17c964" : "#f31260"}
                  rx="1"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-6 flex gap-6 items-center bg-content1/80 backdrop-blur-sm p-2 rounded-lg border border-divider">
        <div className="flex flex-col">
          <span className="text-[10px] text-default-400 font-bold uppercase tracking-widest">
            24h High
          </span>
          <span className="text-sm font-black text-success">
            {maxHigh.toFixed(6)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-default-400 font-bold uppercase tracking-widest">
            24h Low
          </span>
          <span className="text-sm font-black text-danger">
            {minLow.toFixed(6)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketCandleChart;
