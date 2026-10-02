import { NextRequest } from "next/server";
import { connection } from "next/server";
import { getMyCommunities } from "@/utils/communityStats";

/**
 * Dashboard data endpoint: communities where the user holds a staff role
 * (mod or above) — entry points to the per-community admin panel.
 */
export async function GET(request: NextRequest) {
  // cacheComponents: opt this route into per-request rendering.
  await connection();

  const { searchParams } = new URL(request.url);
  const author = searchParams.get("author") ?? "";

  if (!/^[a-z][a-z0-9.-]{2,15}$/.test(author)) {
    return Response.json({ error: "invalid author" }, { status: 400 });
  }

  try {
    const communities = await getMyCommunities(author);
    return Response.json(communities, {
      headers: {
        "Cache-Control":
          "public, max-age=60, s-maxage=300, stale-while-revalidate=3000",
      },
    });
  } catch (error) {
    console.error("[dashboard communities api]", author, error);
    return Response.json({ error: "failed to load communities" }, { status: 502 });
  }
}
