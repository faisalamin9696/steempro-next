import type { LucideIcon } from "lucide-react";
import Link from "@/components/ui/CustomLink";

/**
 * KPI stat card used across every explorer panel. Server-safe (no directive):
 * callers pass icon components from their own tree (server→server or
 * client→client — icons never cross the RSC boundary themselves).
 */

const TONES = {
  primary: "bg-primary/10 text-primary",
  blue: "bg-blue-500/10 text-blue-500",
  emerald: "bg-emerald-500/10 text-emerald-500",
  violet: "bg-violet-500/10 text-violet-500",
  amber: "bg-amber-500/10 text-amber-500",
  rose: "bg-rose-500/10 text-rose-500",
  sky: "bg-sky-500/10 text-sky-500",
  green: "bg-green-500/10 text-green-500",
  red: "bg-red-500/10 text-red-500",
} as const;

export type StatTone = keyof typeof TONES;

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  title,
  tone = "primary",
  href,
  delta,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  /** tooltip for the exact (uncompacted) value */
  title?: string;
  tone?: StatTone;
  href?: string;
  /** progress chip rendered beside the value (e.g. ProgressDelta) */
  delta?: React.ReactNode;
}) {
  const body = (
    <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4 h-full transition-all duration-300 hover:border-primary/30 dark:hover:border-default-200/60 hover:shadow-sm group">
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`p-2.5 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${TONES[tone]}`}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-default-500 dark:text-default-400 uppercase tracking-wider font-semibold">
            {label}
          </p>
          <div className="flex items-center gap-2 min-w-0 mt-0.5">
            <p
              className="text-lg font-bold font-mono leading-tight text-foreground truncate"
              title={title}
            >
              {value}
            </p>
            {delta ? <span className="shrink-0">{delta}</span> : null}
          </div>
          {sub ? (
            <p className="text-[11px] text-default-400 mt-1 truncate">{sub}</p>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {body}
      </Link>
    );
  }
  return body;
}
