"use client";

/**
 * Lightweight SVG line/area chart used by the explorer dashboard.
 *
 * Deliberately dependency-free: the app already ships raw-SVG charts
 * (MarketCandleChart) and adding a charting library for a few plots would
 * inflate the client bundle.
 *
 * Interactive: moving the pointer (or dragging a finger) snaps to the nearest
 * data point and shows a crosshair + tooltip with every series' value there,
 * and legend entries toggle their series on/off.
 */

import { useState } from "react";

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
  // Hooks first — the empty-data early return below must not skip them.
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<{
    i: number; // index into the distinct x ticks
    xPct: number; // pointer position inside the plot, 0–100
    yPct: number; // clamped so the tooltip never leaves the plot
  } | null>(null);

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

  const visible = series.filter((s) => !hidden.has(s.name));

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
  // Scale from the visible series only, so hiding one rescales the axis.
  // (If everything is hidden the plot keeps its frame with no strokes.)
  const scalePoints = visible.length
    ? visible.flatMap((s) => s.points)
    : points;
  const ys = scalePoints.map((p) => p.y);
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

  // Hover bookkeeping — `i` can go stale when the range/data changes, so it is
  // always validated against the current tick list before rendering.
  const hoverIdx =
    hover && hover.i >= 0 && hover.i < uniqXs.length ? hover.i : null;
  const hoverX = hoverIdx !== null ? uniqXs[hoverIdx] : null;

  const trackPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    // The legend lives inside the plot box; don't hijack its pointer moves.
    if ((e.target as HTMLElement).closest?.("[data-chart-legend]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const dataX =
      minX + ((xPct / 100) * W - padX) / (W - padX * 2) * spanX;
    let best = 0;
    let bestDist = Infinity;
    uniqXs.forEach((x, i) => {
      const d = Math.abs(x - dataX);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setHover({
      i: best,
      xPct,
      // keep the tooltip box inside the plot vertically
      yPct: Math.min(90, Math.max(10, yPct)),
    });
  };

  const toggleSeries = (name: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="w-full" style={{ height: H }}>
      <div className="flex w-full" style={{ height: plotH }}>
        {/* plot area — grid + series only; every label lives in the HTML
            layers beside/below so the non-uniform SVG scaling can never
            squash the text */}
        <div
          className="relative flex-1 min-w-0 h-full"
          onPointerMove={trackPointer}
          onPointerLeave={() => setHover(null)}
        >
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
              if (hidden.has(s.name) || s.points.length === 0) return null;
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
                </g>
              );
            })}

            {/* crosshair at the hovered timestamp */}
            {hoverX !== null && (
              <line
                x1={getX(hoverX)}
                y1={padTop - 10}
                x2={getX(hoverX)}
                y2={plotH - padBottom}
                stroke="currentColor"
                strokeOpacity="0.28"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Focus dots are HTML rather than SVG for the same reason the
              labels are: the plot scales with preserveAspectRatio="none", so
              an SVG <circle> is squashed by the x-scale (an 8px dot measured
              2.5×8px in a 379px-wide plot). CSS pixels never scale, so these
              stay perfectly round at any container width. */}
          {hoverX !== null && (
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              {visible.map((s) => {
                const p = s.points.find((pt) => pt.x === hoverX);
                if (!p) return null;
                // 9.5px total with a 1.5px border reproduces r=4 with a
                // straddling 1.5px stroke (outer radius 4.75). Set inline:
                // Tailwind v4 never emitted an arbitrary `border-[1.5px]`
                // utility here, and the base border-width is 1px. Chromium
                // also snaps fractional borders at DPR 1, so this measures
                // as 1px — that is rendering, not a missing rule.
                return (
                  <span
                    key={`dot-${s.name}`}
                    className="absolute block rounded-full"
                    style={{
                      left: `${(getX(p.x) / W) * 100}%`,
                      top: `${(getY(p.y) / plotH) * 100}%`,
                      width: 9.5,
                      height: 9.5,
                      boxSizing: "border-box",
                      border: "1.5px solid #fff",
                      backgroundColor: s.color,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* legend (HTML, unaffected by SVG stretching) — click to toggle */}
          <div
            className="absolute -top-1 left-2 flex flex-wrap items-center gap-3"
            data-chart-legend
          >
            {series.map((s) => {
              const off = hidden.has(s.name);
              return (
                <button
                  key={s.name}
                  type="button"
                  aria-pressed={!off}
                  onClick={() => toggleSeries(s.name)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold transition-opacity hover:opacity-70 cursor-pointer ${
                    off ? "opacity-40 line-through" : ""
                  }`}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </button>
              );
            })}
          </div>

          {/* tooltip (HTML, follows the pointer, flips near the right edge) */}
          {hoverX !== null && hover && (
            <div
              className="pointer-events-none absolute z-20 min-w-[150px] rounded-lg border border-default-200/60 dark:border-divider bg-content1/95 backdrop-blur px-2.5 py-2 shadow-lg"
              style={{
                left: `${hover.xPct}%`,
                top: `${hover.yPct}%`,
                transform:
                  hover.xPct > 55
                    ? "translate(calc(-100% - 12px), -50%)"
                    : "translate(12px, -50%)",
              }}
            >
              {/* HeroUI inverts its default-* ramp in dark mode (300 = 20%
                  lightness), so "dark:" variants darken text. default-700 is
                  the one shade that clears 4.5:1 on the tooltip surface in
                  both themes — 6.7:1 dark, 4.8:1 light. */}
              <div className="text-[10px] font-bold uppercase tracking-wide text-default-700 mb-1">
                {new Date(hoverX * 1000).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {visible.map((s) => {
                const p = s.points.find((pt) => pt.x === hoverX);
                return (
                  <div
                    key={s.name}
                    className="flex items-center justify-between gap-3 text-[11px] leading-5"
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="truncate font-semibold text-default-700">
                        {s.name}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-foreground tabular-nums">
                      {p ? yFormatValue(p.y) : "–"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
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
