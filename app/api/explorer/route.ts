import { NextRequest } from "next/server";
import { connection } from "next/server";
import {
  getActivitySeries,
  getAuthorActivity,
  getChainParameters,
  getContentBundle,
  getLeaderboardsBundle,
  getStatisticsBundle,
  AUTHOR_RANGE_SECONDS,
  RANGE_SECONDS,
  type AuthorRange,
  type ExplorerRange,
} from "@/utils/explorerStats";

/**
 * Dynamic data endpoint for the explorer dashboard's tabbed sections.
 *
 * Each tab requests exactly one section — nothing is fetched until its panel
 * mounts. Server-side results are memoized in-process (see utils/explorerStats)
 * and responses carry CDN caching headers so repeated polls stay cheap.
 */
export async function GET(request: NextRequest) {
  // cacheComponents: opt this route into per-request rendering.
  await connection();

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");
  const range = searchParams.get("range") ?? "";

  try {
    if (section === "activity" && range in RANGE_SECONDS) {
      const series = await getActivitySeries(range as ExplorerRange);
      return Response.json(
        { range, series },
        { headers: cacheHeaders(300) },
      );
    }

    if (section === "authors" && range in AUTHOR_RANGE_SECONDS) {
      const activity = await getAuthorActivity(range as AuthorRange);
      return Response.json(activity, { headers: cacheHeaders(600) });
    }

    if (section === "statistics") {
      const data = await getStatisticsBundle();
      return Response.json(data, { headers: cacheHeaders(600) });
    }

    if (section === "content") {
      const data = await getContentBundle();
      return Response.json(data, { headers: cacheHeaders(600) });
    }

    if (section === "leaderboards") {
      const data = await getLeaderboardsBundle();
      return Response.json(data, { headers: cacheHeaders(300) });
    }

    if (section === "parameters") {
      const data = await getChainParameters();
      return Response.json(data, { headers: cacheHeaders(600) });
    }

    return Response.json({ error: "unknown section or range" }, { status: 400 });
  } catch (error) {
    console.error("[explorer api]", section, range, error);
    return Response.json({ error: "failed to load stats" }, { status: 502 });
  }
}

function cacheHeaders(seconds: number): Record<string, string> {
  return {
    "Cache-Control": `public, max-age=${Math.min(seconds, 60)}, s-maxage=${seconds}, stale-while-revalidate=${seconds * 10}`,
  };
}
