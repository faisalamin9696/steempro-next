import type { MetadataRoute } from "next";
import { BASE_URL, STATIC_PAGES } from "@/utils/sitemap";

/**
 * `/sitemap.xml` — the site's only sitemap.
 *
 * This is Next's file convention rather than the hand-rolled route handlers it
 * replaces. Those handlers assembled posts, tags, profiles, communities,
 * shorts and proposals from live blockchain queries *inside the crawler's own
 * request*, which made them the slowest files on the site — GSC reported every
 * one of them as "Sitemap could not be read" while `static.xml`, the only file
 * needing no data, read fine.
 *
 * Because this module reads no request-time API it is prerendered and cached
 * by default, so `/sitemap.xml` is emitted once at build time and served as
 * static XML with no per-request work and no possible network failure.
 *
 * `/submit` and `/trending` are deliberately absent; see `STATIC_PAGES`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Frozen by Next's prerender Date instrumentation, so every entry shares the
  // build timestamp and the output stays byte-identical across a rebuild of an
  // unchanged tree.
  const lastModified = new Date();

  return STATIC_PAGES.map(({ path, ...entry }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    ...entry,
  }));
}
