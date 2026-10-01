import { connection } from "next/server";
import {
  BASE_URL,
  countCommunityPages,
  countPostPages,
  countShortsPages,
  sitemapIndex,
  xmlResponse,
} from "@/utils/sitemap";

/**
 * Sitemap index.
 *
 * Registered as a directory (`app/sitemap.xml/route.ts`) rather than the usual
 * `app/sitemap.ts` because the index needs to list child sitemaps whose URLs
 * live under `/sitemap/…`, and `MetadataRoute.Sitemap` can only emit `<urlset>`.
 *
 * `connection()` must run before any I/O: with `cacheComponents` enabled it is
 * what tells Next the response can only be produced per request, so none of the
 * SDS probes below execute during `next build`.
 */
export async function GET(): Promise<Response> {
  await connection();

  const lastmod = new Date().toISOString();

  // All three probes run concurrently — each is ~8 requests of `limit=1`.
  const [postPages, communityPages, shortsPages] = await Promise.all([
    countPostPages().catch(() => 0),
    countCommunityPages().catch(() => 0),
    countShortsPages().catch(() => 0),
  ]);

  const children: { loc: string; lastmod: string }[] = [
    { loc: `${BASE_URL}/sitemap/static.xml`, lastmod },
  ];

  for (let page = 1; page <= postPages; page++) {
    children.push({ loc: `${BASE_URL}/sitemap/posts/${page}.xml`, lastmod });
  }

  children.push(
    { loc: `${BASE_URL}/sitemap/tags.xml`, lastmod },
    { loc: `${BASE_URL}/sitemap/profiles.xml`, lastmod },
  );

  for (let page = 1; page <= communityPages; page++) {
    children.push({
      loc: `${BASE_URL}/sitemap/communities/${page}.xml`,
      lastmod,
    });
  }

  for (let page = 1; page <= shortsPages; page++) {
    children.push({ loc: `${BASE_URL}/sitemap/shorts/${page}.xml`, lastmod });
  }

  children.push({ loc: `${BASE_URL}/sitemap/proposals.xml`, lastmod });

  return xmlResponse(sitemapIndex(children));
}
