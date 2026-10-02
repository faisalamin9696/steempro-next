import { NextRequest } from "next/server";
import { connection } from "next/server";
import {
  COMMUNITY_RANGES,
  getAuthorStats,
  type CommunityRange,
} from "@/utils/communityStats";

/**
 * Dashboard data endpoint: one author's own stats for a range.
 *
 * Public blockchain data (same policy as the community stats endpoint) —
 * the page-level session only decides whose stats the dashboard shows by
 * default, not whether this data may be read.
 */
export async function GET(request: NextRequest) {
  // cacheComponents: opt this route into per-request rendering.
  await connection();

  const { searchParams } = new URL(request.url);
  const author = searchParams.get("author") ?? "";
  const range = searchParams.get("range") ?? "";
  const compare = searchParams.get("compare") === "1";

  const authorOk = /^[a-z][a-z0-9.-]{2,15}$/.test(author);
  const rangeOk = COMMUNITY_RANGES.includes(range as CommunityRange);

  if (!authorOk || !rangeOk) {
    return Response.json({ error: "invalid author or range" }, { status: 400 });
  }

  try {
    const stats = await getAuthorStats(
      author,
      range as CommunityRange,
      compare,
    );
    return Response.json(stats, { headers: cacheHeaders(300) });
  } catch (error) {
    console.error("[dashboard author api]", author, range, error);
    return Response.json({ error: "failed to load stats" }, { status: 502 });
  }
}

function cacheHeaders(seconds: number): Record<string, string> {
  return {
    "Cache-Control": `public, max-age=${Math.min(seconds, 60)}, s-maxage=${seconds}, stale-while-revalidate=${seconds * 10}`,
  };
}
