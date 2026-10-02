"use client";

import { ChevronDown, ChevronUp, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { compact } from "@/components/explorer/format";

/**
 * Period-over-period progress chip ("▲ 12.4% vs previous 30d").
 *
 * Renders nothing when both periods are zero. When the previous period is 0
 * a percentage is mathematically undefined — the chip then shows the plain
 * gain instead of a misleading figure.
 */
export default function ProgressDelta({
  current,
  previous,
  title,
  className = "",
}: {
  current: number;
  previous: number;
  /** tooltip override — callers pass "vs previous 30d"-style text */
  title?: string;
  className?: string;
}) {
  const t = useTranslations("Dashboard.delta");

  if (previous === 0 && current === 0) return null;

  const diff = current - previous;
  const pct = previous > 0 ? (diff / previous) * 100 : null;
  const flat = pct !== null && Math.abs(pct) < 0.5;
  const up = diff >= 0;

  const tone = flat
    ? "bg-default-500/10 text-default-500"
    : up
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : "bg-rose-500/10 text-rose-600 dark:text-rose-400";
  const Icon = flat ? Minus : up ? ChevronUp : ChevronDown;

  const label =
    pct !== null
      ? `${Math.abs(pct) >= 100 ? Math.round(Math.abs(pct)) : Math.abs(pct).toFixed(1)}%`
      : `${up ? "+" : "-"}${compact(Math.abs(diff))}`;

  const srLabel = flat ? t("flat") : up ? t("up") : t("down");

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono ${tone} ${className}`}
      title={title}
    >
      <Icon size={11} aria-hidden />
      <span>
        {label}
        <span className="sr-only"> {srLabel}</span>
      </span>
    </span>
  );
}
