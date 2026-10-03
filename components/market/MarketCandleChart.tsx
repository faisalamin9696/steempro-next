"use client";

import { useState } from "react";
import { Spinner } from "@heroui/spinner";

/**
 * Raw-SVG candlestick chart for the market page.
 *
 * Interactive: hovering (or dragging a finger) snaps to the nearest candle,
 * draws a crosshair and shows an OHLC tooltip in HTML — the old native
 * `<title>` popups took ~1s to appear and never worked on touch.
 */
const MarketCandleChart = ({ data }: { data: MarketHistory[] | undefined }) => {
  // Hooks first: the two early returns below must not skip them.
  const [hover, setHover] = useState<{
    i: number;
    xPct: number;
    yPct: number;
  } | null>(null);

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

  // Stale hover index (data refreshed on a 5s poll) → ignore it.
  const hoverCandle =
    hover && hover.i >= 0 && hover.i < validData.length
      ? validData[hover.i]
      : null;

  const trackPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const svgX = (xPct / 100) * chartWidth;
    const step = (chartWidth - paddingX * 2) / (validData.length - 1);
    const i = Math.min(
      validData.length - 1,
      Math.max(0, Math.round((svgX - paddingX) / step)),
    );
    setHover({ i, xPct, yPct: Math.min(88, Math.max(12, yPct)) });
  };

  const ohlc = hoverCandle
    ? {
        open: getPrice(hoverCandle.open_sbd, hoverCandle.open_steem),
        high: getPrice(hoverCandle.high_sbd, hoverCandle.high_steem),
        low: getPrice(hoverCandle.low_sbd, hoverCandle.low_steem),
        close: getPrice(hoverCandle.close_sbd, hoverCandle.close_steem),
      }
    : null;
  const changePct =
    ohlc && ohlc.open > 0 ? ((ohlc.close - ohlc.open) / ohlc.open) * 100 : 0;
  const isUp = (ohlc?.close ?? 0) >= (ohlc?.open ?? 0);

  return (
    <div className="w-full h-full min-h-[350px] relative group p-4 flex flex-col">
      <div className="flex-1 w-full relative flex">
        <div
          className="relative flex-1 min-w-0 cursor-crosshair"
          onPointerMove={trackPointer}
          onPointerLeave={() => setHover(null)}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            className="overflow-visible absolute inset-0"
          >
            {/* Grid lines — labels live in the HTML gutter beside the plot so
                the non-uniform SVG scaling cannot squash them */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const price = maxHigh - p * range;
              const y = getY(price);
              return (
                <line
                  key={i}
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.05"
                  strokeDasharray="4"
                />
              );
            })}

            {validData.map((d, i) => {
              const open = getPrice(d.open_sbd, d.open_steem);
              const close = getPrice(d.close_sbd, d.close_steem);
              const high = getPrice(d.high_sbd, d.high_steem);
              const low = getPrice(d.low_sbd, d.low_steem);
              const isUpCandle = close >= open;
              const x = getX(i);
              const candleWidth =
                ((chartWidth - paddingX * 2) / validData.length) * 0.7;

              return (
                <g
                  key={i}
                  className={`transition-opacity ${
                    hover && hoverCandle
                      ? i === hover.i
                        ? "opacity-100"
                        : "opacity-45"
                      : "hover:opacity-80"
                  }`}
                >
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={getY(high)}
                    x2={x}
                    y2={getY(low)}
                    stroke={isUpCandle ? "#17c964" : "#f31260"}
                    strokeWidth="1.5"
                  />
                  {/* Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={isUpCandle ? getY(close) : getY(open)}
                    width={candleWidth}
                    height={Math.max(Math.abs(getY(close) - getY(open)), 1)}
                    fill={isUpCandle ? "#17c964" : "#f31260"}
                    rx="1"
                  />
                </g>
              );
            })}

            {/* crosshair at the hovered candle */}
            {hover && hoverCandle && (
              <line
                x1={getX(hover.i)}
                y1={paddingY / 2}
                x2={getX(hover.i)}
                y2={chartHeight - paddingY / 2}
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="1"
                strokeDasharray="4"
                /* the plot scales with preserveAspectRatio="none", so without
                   this the 1px stroke is multiplied by the x-scale (0.45px in
                   a 545px-wide plot) and the crosshair all but disappears */
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* OHLC tooltip (HTML so the stretched SVG can't distort it) */}
          {hover && hoverCandle && ohlc && (
            <div
              className="pointer-events-none absolute z-20 min-w-[178px] rounded-lg border border-default-200/60 dark:border-divider bg-content1/95 backdrop-blur px-2.5 py-2 shadow-lg"
              style={{
                left: `${hover.xPct}%`,
                top: `${hover.yPct}%`,
                transform:
                  hover.xPct > 58
                    ? "translate(calc(-100% - 14px), -50%)"
                    : "translate(14px, -50%)",
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                {/* default-700 clears 4.5:1 on this surface in both themes —
                    HeroUI inverts default-* in dark mode, so 500/600 and any
                    `dark:` variant land far too dim here. */}
                <span className="text-[10px] font-bold uppercase tracking-wide text-default-700">
                  {new Date(hoverCandle.time * 1000).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span
                  className={`text-[11px] font-black tabular-nums ${
                    isUp ? "text-success" : "text-danger"
                  }`}
                >
                  {changePct >= 0 ? "+" : ""}
                  {changePct.toFixed(2)}%
                </span>
              </div>
              {(
                [
                  ["Open", ohlc.open],
                  ["High", ohlc.high],
                  ["Low", ohlc.low],
                  ["Close", ohlc.close],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 text-[11px] leading-5"
                >
                  <span className="font-semibold text-default-700">
                    {label}
                  </span>
                  <span className="font-mono font-bold text-foreground tabular-nums">
                    {value.toFixed(6)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* price axis — HTML text, vertically centered on each grid line */}
        <div className="relative w-[64px] shrink-0 pl-1.5">
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const price = maxHigh - p * range;
            return (
              <span
                key={i}
                className="absolute right-0 -translate-y-1/2 whitespace-nowrap font-mono text-[11px] font-medium text-default-500 dark:text-default-400"
                style={{ top: `${(getY(price) / chartHeight) * 100}%` }}
              >
                {price.toFixed(4)}
              </span>
            );
          })}
        </div>
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
