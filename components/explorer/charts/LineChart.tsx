"use client";

/**
 * Lightweight SVG line/area chart used by the explorer dashboard.
 *
 * Deliberately dependency-free: the app already ships raw-SVG charts
 * (MarketCandleChart) and adding a charting library for a few plots would
 * inflate the client bundle.
 */

export interface LinePoint {
  x: number; // unix seconds
  y: number;
}

export interface LineSeries {
  name: string;
  color: string;
  points: LinePoint[];
  /** render the stroke dashed (used for previous-period comparison lines) */
  dash?: boolean;
}

/**
 * Formatting presets — string-typed so the server can pass them across the
 * server→client boundary (functions cannot be serialized into client props).
 */
export type LineChartFormat = "auto" | "int" | "usd" | "usd0" | "rate";

const FORMATTERS: Record<LineChartFormat, (v: number) => string> = {
  auto: (v) => v.toLocaleString(),
  int: (v) => v.toFixed(0),
  usd: (v) => "$" + v.toFixed(4),
  usd0: (v) => "$" + v.toFixed(2),
  rate: (v) => (v >= 0.01 ? v.toFixed(3) : v.toFixed(6)),
};

const formatX = (v: number) =>
  new Date(v * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

interface LineChartProps {
  series: LineSeries[];
  height?: number;
  area?: boolean;
  yFormat?: LineChartFormat;
  yTickCount?: number;
  emptyText?: string;
}

const W = 1200;

export default function LineChart({
  series,
  height = 320,
  area = true,
  yFormat = "auto",
  yTickCount = 4,
  emptyText = "No data available",
}: LineChartProps) {
  const yFormatValue = FORMATTERS[yFormat];
  const xFormatValue = formatX;
  const points = series.flatMap((s) => s.points);
  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-default-400 h-40">
        {emptyText}
      </div>
    );
  }

  const H = height;
  // HTML row under the plot that carries the x labels — keeping text out of
  // the stretched SVG is what makes the axis readable (the
  // preserveAspectRatio="none" scaling would squash SVG <text> glyphs).
  const BOTTOM = 26;
  const plotH = Math.max(80, H - BOTTOM);
  const padX = 8;
  const padTop = 20;
  const padBottom = 8;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  if (minY === maxY) {
    // Flat series: give the plot some vertical breathing room.
    const delta = Math.abs(minY) * 0.1 || 1;
    minY -= delta;
    maxY += delta;
  }
  // Leave headroom above the peak.
  maxY += (maxY - minY) * 0.08;

  const spanX = maxX - minX || 1;
  const getX = (x: number) => padX + ((x - minX) / spanX) * (W - padX * 2);
  const getY = (y: number) =>
    plotH - padBottom - ((y - minY) / (maxY - minY)) * (plotH - padTop - padBottom);

  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => {
    const value = minY + ((maxY - minY) * i) / yTickCount;
    return { value, y: getY(value) };
  }).reverse();

  // Snap x ticks to actual distinct data timestamps (evenly spaced indices),
  // so labels show real dates instead of interpolated, possibly duplicate ones.
  const uniqXs = [...new Set(xs)].sort((a, b) => a - b);
  const xTickCount = Math.min(5, uniqXs.length);
  const xTicks: { value: number; x: number }[] = [];
  for (let i = 0; i < xTickCount; i++) {
    const idx =
      xTickCount === 1
        ? 0
        : Math.round((i * (uniqXs.length - 1)) / (xTickCount - 1));
    const value = uniqXs[idx];
    if (xTicks.length && xTicks[xTicks.length - 1].value === value) continue;
    xTicks.push({ value, x: getX(value) });
  }

  const gradientIds = series.map((_, i) => `linechart-fill-${i}`);

  return (
    <div className="w-full" style={{ height: H }}>
      <div className="flex w-full" style={{ height: plotH }}>
        {/* plot area — grid + series only; every label lives in the HTML
            layers beside/below so the non-uniform SVG scaling can never
            squash the text */}
        <div className="relative flex-1 min-w-0 h-full">
          <svg
            viewBox={`0 0 ${W} ${plotH}`}
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
            role="img"
            aria-label={series.map((s) => s.name).join(", ")}
          >
            <defs>
              {series.map((s, i) => (
                <linearGradient
                  key={gradientIds[i]}
                  id={gradientIds[i]}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>

            {/* horizontal grid */}
            {yTicks.map((t, i) => (
              <line
                key={`y-${i}`}
                x1={padX}
                y1={t.y}
                x2={W - padX}
                y2={t.y}
                stroke="currentColor"
                strokeOpacity="0.06"
                strokeDasharray="4"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* series */}
            {series.map((s, i) => {
              if (s.points.length === 0) return null;
              const sorted = [...s.points].sort((a, b) => a.x - b.x);
              const linePath = sorted
                .map((p, j) => `${j === 0 ? "M" : "L"}${getX(p.x)},${getY(p.y)}`)
                .join(" ");
              const areaPath = `${linePath} L${getX(sorted[sorted.length - 1].x)},${plotH - padBottom} L${getX(sorted[0].x)},${plotH - padBottom} Z`;
              return (
                <g key={s.name}>
                  {area && (
                    <path d={areaPath} fill={`url(#${gradientIds[i]})`} />
                  )}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2"
                    strokeDasharray={s.dash ? "6 5" : undefined}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* hover targets: invisible hit circles with native tooltips */}
                  {sorted.map((p) => (
                    <circle
                      key={`${s.name}-${p.x}`}
                      cx={getX(p.x)}
                      cy={getY(p.y)}
                      r="6"
                      fill="transparent"
                    >
                      <title>{`${s.name}\n${new Date(p.x * 1000).toLocaleString()}\n${yFormatValue(p.y)}`}</title>
                    </circle>
                  ))}
                </g>
              );
            })}
          </svg>

          {/* legend (HTML, unaffected by SVG stretching) */}
          <div className="absolute -top-1 left-2 flex items-center gap-3">
            {series.map((s) => (
              <span
                key={s.name}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-default-500 dark:text-default-400"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* y-axis values — plain HTML text, vertically centered on each grid
            line (viewBox height === CSS height, so Y maps 1:1) */}
        <div className="relative w-[68px] shrink-0 h-full pl-2">
          {yTicks.map((t, i) => (
            <span
              key={`yl-${i}`}
              className="absolute right-0 -translate-y-1/2 whitespace-nowrap font-mono text-[11px] font-medium text-default-500 dark:text-default-400"
              style={{ top: t.y }}
            >
              {yFormatValue(t.value)}
            </span>
          ))}
        </div>
      </div>

      {/* x-axis values — own HTML row under the plot, edge labels clamped
          inside so nothing clips */}
      <div className="flex w-full" style={{ height: BOTTOM }}>
        <div className="relative flex-1 min-w-0 h-full">
          {xTicks.map((t, i) => (
            <span
              key={`xl-${i}`}
              className={
                "absolute top-1 whitespace-nowrap text-[11px] font-medium text-default-500 dark:text-default-400 " +
                (i === 0
                  ? ""
                  : i === xTicks.length - 1
                    ? "-translate-x-full"
                    : "-translate-x-1/2")
              }
              style={{ left: `${(t.x / W) * 100}%` }}
            >
              {xFormatValue(t.value)}
            </span>
          ))}
        </div>
        <div className="w-[68px] shrink-0" />
      </div>
    </div>
  );
}
