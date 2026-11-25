import { NextRequest, NextResponse } from "next/server";
import { analyticsAdmin } from "@/libs/analytics/auth";
import { clientIp, isProtectedIp } from "@/libs/analytics/request";
import {
  blockIp,
  normalizeRule,
  snapshotFor,
  unblockIp,
} from "@/libs/analytics/store";

/**
 * Operator endpoint behind `/dashboard/traffic`.
 *
 * Reads the aggregated counters and edits the IP blocklist. Every handler
 * re-checks the allowlist: the page hides itself from non-operators, but hiding
 * a page is not access control.
 */

export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" } as const;

function forbidden() {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

function parseWindow(value: string | null): number {
  const hours = Number(value ?? 24);
  if (!Number.isFinite(hours)) return 24;
  return Math.min(Math.max(Math.round(hours), 1), 24 * 30);
}

export async function GET(request: NextRequest) {
  if (!(await analyticsAdmin())) return forbidden();

  const { searchParams } = new URL(request.url);
  const snapshot = snapshotFor(parseWindow(searchParams.get("hours")));

  return NextResponse.json(
    {
      ...snapshot,
      // Echoed so the UI can warn before an operator blocks their own address.
      viewerIp: clientIp(request.headers),
    },
    { headers: NO_STORE },
  );
}

export async function POST(request: NextRequest) {
  const admin = await analyticsAdmin();
  if (!admin) return forbidden();

  let body: { ip?: unknown; reason?: unknown; hours?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const rule = normalizeRule(String(body.ip ?? ""));
  if (!rule) {
    return NextResponse.json(
      { error: "not an IP address or range (e.g. 203.0.113.7 or 203.0.113.)" },
      { status: 400 },
    );
  }

  const viewer = clientIp(request.headers);
  if (isProtectedIp(rule) || rule === viewer) {
    return NextResponse.json(
      {
        error:
          "refusing to block this address: it is loopback or the address you are connected from",
      },
      { status: 400 },
    );
  }

  const hours = Number(body.hours ?? 0);
  const reason = String(body.reason ?? "").trim().slice(0, 200) || "manual block";

  try {
    blockIp({
      ip: rule,
      reason,
      createdBy: admin,
      hours: Number.isFinite(hours) && hours > 0 ? Math.min(hours, 24 * 365) : null,
    });
  } catch (error) {
    console.error("[traffic] block failed", error);
    return NextResponse.json({ error: "store unavailable" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, ip: rule }, { headers: NO_STORE });
}

export async function DELETE(request: NextRequest) {
  if (!(await analyticsAdmin())) return forbidden();

  const { searchParams } = new URL(request.url);
  const ip = searchParams.get("ip")?.trim();
  if (!ip) return NextResponse.json({ error: "ip required" }, { status: 400 });

  unblockIp(ip);
  return NextResponse.json({ ok: true, ip }, { headers: NO_STORE });
}
