import { NextRequest } from "next/server";
import { connection } from "next/server";
import {
  COMMUNITY_RANGES,
  getCommunityStats,
  type CommunityRange,
} from "@/utils/communityStats";

/**
 * Dynamic data endpoint for the community Stats tab.
 *
 * One request returns the whole statistical bundle for a range (daily
 * series, totals, author race, top content, leaders, viewer position).
 * Server-side aggregation is memoized in-process (see utils/communityStats)
 * so the server-rendered first paint and this endpoint share SDS fetches.
 */
export async function GET(request: NextRequest) {
  // cacheComponents: opt this route into per-request rendering.
  await connection();

  const { searchParams } = new URL(request.url);
  const community = searchParams.get("community") ?? "";
  const range = searchParams.get("range") ?? "";
  const observer = searchParams.get("observer");

  const communityOk = /^[a-z][a-z0-9.-]{2,19}$/.test(community);
  const rangeOk = COMMUNITY_RANGES.includes(range as CommunityRange);
  const observerOk =
    !observer || /^[a-z0-9.-]{2,20}$/.test(observer);

  if (!communityOk || !rangeOk || !observerOk) {
    return Response.json({ error: "invalid community or range" }, { status: 400 });
  }

  try {
    const stats = await getCommunityStats(
      community,
      range as CommunityRange,
      observer || undefined,
    );
    return Response.json(stats, { headers: cacheHeaders(300) });
  } catch (error) {
    console.error("[community stats api]", community, range, error);
    return Response.json({ error: "failed to load stats" }, { status: 502 });
  }
}

function cacheHeaders(seconds: number): Record<string, string> {
  return {
    "Cache-Control": `public, max-age=${Math.min(seconds, 60)}, s-maxage=${seconds}, stale-while-revalidate=${seconds * 10}`,
  };
}
