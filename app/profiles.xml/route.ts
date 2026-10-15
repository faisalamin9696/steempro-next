import { connection } from "next/server";
import { renderProfilesXml, serveSitemap } from "@/utils/sitemap";

/**
 * `/profiles.xml` — the profile root of every author who posted recently.
 *
 * Only `/@username` is emitted: it is the canonical for all profile tabs, and
 * the personal tabs (`wallet`, `notifications`, `settings`, `feed`) are noindex
 * and must not enter the index as separate URLs.
 *
 * Shares `recentPostRefs()` with `posts.xml`, so whichever of the two the
 * crawler reaches first pays for the fetch and the other is served from the
 * in-process source cache. See `serveSitemap` for the render cache.
 */
export async function GET(): Promise<Response> {
  await connection();

  return serveSitemap("profiles", renderProfilesXml);
}
