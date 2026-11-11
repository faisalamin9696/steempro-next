import { connection } from "next/server";
import { renderSitemapXml, serveSitemap } from "@/utils/sitemap";

/**
 * `/sitemap.xml` — every advertised URL in one `<urlset>`.
 *
 * Flat on purpose: no index, no `static.xml`/`posts.xml`/`profiles.xml`/
 * `communities.xml` children. One URL to submit, one file to read, one place
 * for a broken fetch to do damage — and `serveSitemap` already makes that
 * damage survivable (six-hour render cache, stale-before-empty, never a 5xx).
 *
 * `connection()` runs before any I/O: with `cacheComponents` enabled it tells
 * Next the SDS reads below can only happen per request, so none of them execute
 * during `next build`.
 */
export async function GET(): Promise<Response> {
  await connection();

  return serveSitemap("sitemap", renderSitemapXml);
}
