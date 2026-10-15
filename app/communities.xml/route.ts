import { connection } from "next/server";
import { renderCommunitiesXml, serveSitemap } from "@/utils/sitemap";

/**
 * `/communities.xml` — one URL per community, at its canonical
 * `/trending/hive-…`.
 *
 * Only the `trending` tab is listed; the other sort orders are near-duplicates
 * of the same page and are linked from each community's own tab bar instead.
 * See `SITEMAP_TABS`.
 */
export async function GET(): Promise<Response> {
  await connection();

  return serveSitemap("communities", renderCommunitiesXml);
}
