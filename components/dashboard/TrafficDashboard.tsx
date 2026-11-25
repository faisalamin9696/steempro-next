"use client";

import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Activity,
  Ban,
  CheckCircle2,
  Filter,
  RefreshCw,
  ShieldAlert,
  ShieldOff,
  Trash2,
  Users,
} from "lucide-react";
import type { Snapshot } from "@/libs/analytics/store";

/**
 * Operator console for incoming traffic.
 *
 * Not translated on purpose — see `app/dashboard/traffic/page.tsx`.
 */

type Payload = Snapshot & { viewerIp: string };

const WINDOWS = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
];

const CARD =
  "rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4";

const fetcher = async (url: string): Promise<Payload> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
};

const num = (n: number) => n.toLocaleString("en-US");

/**
 * Absolute UTC time, not "5m ago": relative labels depend on `Date.now()` at
 * render time, which differs between the server and the hydrating client and
 * makes React complain. A fixed clock is stable in both.
 */
function clock(seconds: number): string {
  return `${new Date(seconds * 1000).toISOString().slice(11, 16)} UTC`;
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-default-400">
        <Icon size={12} />
        {label}
      </div>
      <p className={`text-2xl font-bold mt-1 ${tone ?? ""}`}>{value}</p>
      {hint && <p className="text-[11px] text-default-400 mt-0.5">{hint}</p>}
    </div>
  );
}

export default function TrafficDashboard({
  initial,
  viewerIp,
}: {
  initial: Payload;
  viewerIp: string;
}) {
  const [hours, setHours] = useState(24);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [pendingIp, setPendingIp] = useState<string | null>(null);
  const [pendingReason, setPendingReason] = useState("");
  const [pendingHours, setPendingHours] = useState("24");

  const [manualIp, setManualIp] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualHours, setManualHours] = useState("24");

  const { data, error: loadError, isLoading, mutate } = useSWR<Payload>(
    `/api/admin/traffic?hours=${hours}`,
    fetcher,
    {
      fallbackData: initial,
      refreshInterval: 15_000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  const blockedSet = useMemo(
    () => new Set((data?.blocked ?? []).map((b) => b.ip)),
    [data],
  );

  const call = useCallback(
    async (method: "POST" | "DELETE", body?: unknown, query?: string) => {
      setError(null);
      setBusy(query ?? "manual");
      try {
        const res = await fetch(`/api/admin/traffic${query ? `?${query}` : ""}`, {
          method,
          headers: body ? { "content-type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status})`);
        await mutate();
        return true;
      } catch (err) {
        setError((err as Error).message);
        return false;
      } finally {
        setBusy(null);
      }
    },
    [mutate],
  );

  const confirmBlock = async () => {
    if (!pendingIp) return;
    const hoursValue = Number(pendingHours);
    const ok = await call(
      "POST",
      {
        ip: pendingIp,
        reason: pendingReason || "manual block",
        hours: Number.isFinite(hoursValue) ? hoursValue : 0,
      },
      pendingIp,
    );
    if (ok) {
      setPendingIp(null);
      setPendingReason("");
    }
  };

  const submitManual = async () => {
    const hoursValue = Number(manualHours);
    const ok = await call(
      "POST",
      {
        ip: manualIp,
        reason: manualReason || "manual block",
        hours: Number.isFinite(hoursValue) ? hoursValue : 0,
      },
      manualIp,
    );
    if (ok) {
      setManualIp("");
      setManualReason("");
    }
  };

  const snapshot = data ?? initial;
  const { overview } = snapshot;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert size={18} className="text-primary" />
            Traffic
          </h1>
          <p className="text-xs text-default-400 mt-0.5">
            Requests seen by the proxy, aggregated by minute. Blocked and
            deflected requests never reach the app.
          </p>
          <p className="text-[10px] text-default-400/80 mt-1 font-mono break-all">
            store: {snapshot.dbPath}
          </p>
          {snapshot.dbInReleaseDir && (
            <p className="text-[10px] text-amber-500 mt-0.5">
              This file is inside the release directory, so a fresh deploy starts
              empty. Set <code>ANALYTICS_DB_PATH</code> to a path outside it to
              keep counters and blocks.
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-default-400" />
          {WINDOWS.map((w) => (
            <button
              key={w.hours}
              onClick={() => setHours(w.hours)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                hours === w.hours
                  ? "bg-primary text-white"
                  : "bg-default-100 dark:bg-default-50/10 text-default-500 hover:text-primary"
              }`}
            >
              {w.label}
            </button>
          ))}
          <button
            onClick={() => mutate()}
            disabled={isLoading}
            className="ml-1 p-1.5 rounded-lg bg-default-100 dark:bg-default-50/10 text-default-500 hover:text-primary disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {!snapshot.available && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          Analytics is unavailable on this host. It needs Node 22.5+ for the
          built-in <code>node:sqlite</code> module, or set{" "}
          <code>ANALYTICS_DB_PATH</code> to a writable file.
        </div>
      )}

      {(error || loadError) && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300">
          {error ?? (loadError as Error).message}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat icon={Activity} label="Requests" value={num(overview.total)} />
        <Stat icon={Users} label="Unique IPs" value={num(overview.uniqueIps)} />
        <Stat
          icon={CheckCircle2}
          label="Served"
          value={num(overview.passedHits)}
          hint="handed to the app"
          tone="text-emerald-600 dark:text-emerald-400"
        />
        <Stat
          icon={Filter}
          label="Deflected"
          value={num(overview.deflectedHits)}
          hint="malformed URL, zero SDS calls"
          tone="text-amber-600 dark:text-amber-400"
        />
        <Stat
          icon={Ban}
          label="Blocked"
          value={num(overview.blockedHits)}
          hint="refused at the edge"
          tone="text-red-600 dark:text-red-400"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* top routes */}
        <div className={CARD}>
          <p className="text-sm font-bold mb-2">Top routes</p>
          {snapshot.routes.length === 0 ? (
            <p className="text-xs text-default-400">No requests in this window.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {snapshot.routes.map((r) => {
                const pct = overview.total
                  ? Math.max(2, Math.round((r.hits / overview.total) * 100))
                  : 0;
                return (
                  <div key={r.route} className="text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <code className="truncate text-default-600 dark:text-default-300">
                        {r.route}
                      </code>
                      <span className="tabular-nums font-semibold shrink-0">
                        {num(r.hits)}
                      </span>
                    </div>
                    <div className="h-1 rounded bg-default-100 dark:bg-default-50/10 mt-0.5">
                      <div
                        className="h-1 rounded bg-primary/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* recent deflections */}
        <div className={CARD}>
          <p className="text-sm font-bold mb-2">Recently deflected</p>
          {snapshot.deflections.length === 0 ? (
            <p className="text-xs text-default-400">
              Nothing malformed has been rejected yet.
            </p>
          ) : (
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
              {snapshot.deflections.map((d) => (
                <div
                  key={d.path}
                  className="flex items-center justify-between gap-2 text-[11px]"
                >
                  <code className="truncate text-default-600 dark:text-default-300">
                    {d.path}
                  </code>
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {d.reason}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* top IPs */}
      <div className={CARD}>
        <p className="text-sm font-bold mb-2">Top addresses</p>
        {snapshot.ips.length === 0 ? (
          <p className="text-xs text-default-400">No requests in this window.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-default-400 text-left">
                <tr>
                  <th className="py-1 pr-2 font-semibold">Address</th>
                  <th className="py-1 pr-2 font-semibold text-right">Requests</th>
                  <th className="py-1 pr-2 font-semibold text-right">Routes</th>
                  <th className="py-1 pr-2 font-semibold">Most requested</th>
                  <th className="py-1 pr-2 font-semibold">Agent</th>
                  <th className="py-1 pr-2 font-semibold">Last seen</th>
                  <th className="py-1 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.ips.map((row) => {
                  const isSelf = row.ip === viewerIp;
                  const isBlocked = blockedSet.has(row.ip);
                  return (
                    <tr
                      key={row.ip}
                      className="border-t border-default-100 dark:border-default-50/10"
                    >
                      <td className="py-1.5 pr-2 font-mono whitespace-nowrap">
                        {row.ip}
                        {isSelf && (
                          <span className="ml-1 text-[9px] px-1 rounded bg-primary/10 text-primary">
                            you
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pr-2 text-right tabular-nums font-semibold">
                        {num(row.hits)}
                      </td>
                      <td className="py-1.5 pr-2 text-right tabular-nums text-default-400">
                        {num(row.routes)}
                      </td>
                      <td className="py-1.5 pr-2 font-mono text-default-400 max-w-[220px] truncate">
                        {row.topRoute}
                      </td>
                      <td className="py-1.5 pr-2 text-default-400 max-w-[200px] truncate">
                        {row.ua || "—"}
                      </td>
                      <td className="py-1.5 pr-2 text-default-400 whitespace-nowrap">
                        {clock(row.lastSeen)}
                      </td>
                      <td className="py-1.5 text-right whitespace-nowrap">
                        {isBlocked ? (
                          <button
                            onClick={() =>
                              call("DELETE", undefined, `ip=${encodeURIComponent(row.ip)}`)
                            }
                            disabled={busy !== null}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-default-100 dark:bg-default-50/10 text-default-500 hover:text-emerald-500 disabled:opacity-50"
                          >
                            <ShieldOff size={10} /> Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setPendingIp(row.ip);
                              setPendingReason("");
                            }}
                            disabled={busy !== null || isSelf}
                            title={
                              isSelf
                                ? "You cannot block the address you are connected from"
                                : undefined
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-40"
                          >
                            <Ban size={10} /> Block
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pendingIp && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3 flex flex-wrap items-end gap-2">
            <div className="text-[11px] font-semibold w-full">
              Block <code className="font-mono">{pendingIp}</code>
            </div>
            <label className="text-[10px] text-default-400 flex flex-col gap-0.5 flex-1 min-w-[160px]">
              Reason
              <input
                value={pendingReason}
                onChange={(e) => setPendingReason(e.target.value)}
                placeholder="e.g. enumerating profile URLs"
                maxLength={200}
                className="px-2 py-1 rounded bg-white dark:bg-content1 border border-default-200 dark:border-default-100/40 text-[11px]"
              />
            </label>
            <label className="text-[10px] text-default-400 flex flex-col gap-0.5">
              Duration
              <select
                value={pendingHours}
                onChange={(e) => setPendingHours(e.target.value)}
                className="px-2 py-1 rounded bg-white dark:bg-content1 border border-default-200 dark:border-default-100/40 text-[11px]"
              >
                <option value="1">1 hour</option>
                <option value="24">1 day</option>
                <option value="168">7 days</option>
                <option value="0">Permanent</option>
              </select>
            </label>
            <button
              onClick={confirmBlock}
              disabled={busy !== null}
              className="px-2.5 py-1 rounded bg-red-500 text-white text-[11px] font-bold disabled:opacity-50"
            >
              Confirm block
            </button>
            <button
              onClick={() => setPendingIp(null)}
              className="px-2.5 py-1 rounded bg-default-100 dark:bg-default-50/10 text-[11px] font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* blocklist + manual entry */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className={CARD}>
          <p className="text-sm font-bold mb-2">
            Blocked addresses{" "}
            <span className="text-default-400 font-normal">
              ({snapshot.blocked.length})
            </span>
          </p>
          {snapshot.blocked.length === 0 ? (
            <p className="text-xs text-default-400">Nothing is blocked.</p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
              {snapshot.blocked.map((b) => (
                <div
                  key={b.ip}
                  className="flex items-center justify-between gap-2 text-[11px]"
                >
                  <div className="min-w-0">
                    <code className="font-mono">{b.ip}</code>
                    <p className="text-[10px] text-default-400 truncate">
                      {b.reason}
                      {b.createdBy ? ` · ${b.createdBy}` : ""}
                      {b.expiresAt
                        ? ` · expires ${new Date(b.expiresAt).toISOString().slice(0, 10)}`
                        : " · permanent"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      call("DELETE", undefined, `ip=${encodeURIComponent(b.ip)}`)
                    }
                    disabled={busy !== null}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-default-100 dark:bg-default-50/10 text-default-500 hover:text-emerald-500 disabled:opacity-50"
                  >
                    <Trash2 size={10} /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={CARD}>
          <p className="text-sm font-bold mb-2">Block manually</p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-[10px] text-default-400 flex flex-col gap-0.5 flex-1 min-w-[160px]">
              IP or range
              <input
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                placeholder="203.0.113.7 or 203.0.113."
                className="px-2 py-1 rounded bg-white dark:bg-content1 border border-default-200 dark:border-default-100/40 text-[11px] font-mono"
              />
            </label>
            <label className="text-[10px] text-default-400 flex flex-col gap-0.5 flex-1 min-w-[140px]">
              Reason
              <input
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                placeholder="why"
                maxLength={200}
                className="px-2 py-1 rounded bg-white dark:bg-content1 border border-default-200 dark:border-default-100/40 text-[11px]"
              />
            </label>
            <label className="text-[10px] text-default-400 flex flex-col gap-0.5">
              Duration
              <select
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                className="px-2 py-1 rounded bg-white dark:bg-content1 border border-default-200 dark:border-default-100/40 text-[11px]"
              >
                <option value="1">1 hour</option>
                <option value="24">1 day</option>
                <option value="168">7 days</option>
                <option value="0">Permanent</option>
              </select>
            </label>
            <button
              onClick={submitManual}
              disabled={busy !== null || !manualIp.trim()}
              className="px-2.5 py-1 rounded bg-red-500 text-white text-[11px] font-bold disabled:opacity-50"
            >
              Block
            </button>
          </div>
          <p className="text-[10px] text-default-400 mt-2">
            Ranges use a trailing dot: <code>203.0.113.</code> covers the whole
            /24. A blocked address is refused within ~15 seconds and cannot be
            loopback or the address you are connected from ({viewerIp}).
          </p>
        </div>
      </div>
    </div>
  );
}
