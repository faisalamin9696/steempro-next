/** Shared formatting helpers for explorer dashboard components (SSR-safe). */

export function compact(value: number | string): string {
  const n =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 10_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("en-US");
}

export function full(n: number): string {
  return n.toLocaleString("en-US");
}

/** "12.345 STEEM" → 12.345 */
export function asset(amount: unknown): number {
  const n = parseFloat(String(amount ?? "").split(" ")[0]);
  return Number.isFinite(n) ? n : 0;
}

export function usd(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function timeAgo(unixSeconds: number): string {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "producer_reward" → "producer reward" */
export function opLabel(name: string): string {
  return name.replace(/_/g, " ");
}
