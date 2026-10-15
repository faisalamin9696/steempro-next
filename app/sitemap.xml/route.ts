import { BASE_URL, sitemapIndex, xmlResponse } from "@/utils/sitemap";

/**
 * `/sitemap.xml` — the sitemap **index**.
 *
 * Registered as a directory (`app/sitemap.xml/route.ts`) rather than the usual
 * `app/sitemap.ts` because Next's metadata route can only emit `<urlset>`; it
 * has no way to express `<sitemapindex>`, which is what a file pointing at other
 * files has to be.
 *
 * It does no I/O, deliberately. The predecessor probed three page counts here,
 * inside the crawler's own request, and Search Console answered "Sitemap could
 * not be read" for it and for every child it listed. The data now lives entirely
 * in the children below; this file is a constant, so it can be neither slow nor
 * fail.
 *
 * No `connection()` and no `new Date()` — under `cacheComponents` reading the
 * clock is a dynamic access that would push this route into per-request
 * rendering, and there is nothing here worth re-rendering for. Staying
 * synchronous is what lets Next prerender it to a static file, which is exactly
 * the property that made `static.xml` the one sitemap Search Console could
 * always read.
 *
 * Entries carry no `<lastmod>` on purpose: one timestamp shared by four children
 * would claim they all changed together, and the ones that never change (the
 * static pages) would be reported as fresh. Per-URL `<lastmod>` lives in the
 * children, where it is actually true.
 */
const CHILDREN = [
  "static.xml", // the 23 static pages — no data
  "posts.xml", // recent posts
  "profiles.xml", // profile root for each of those authors
  "communities.xml", // one URL per community
] as const;

export function GET(): Response {
  return xmlResponse(
    sitemapIndex(CHILDREN.map((child) => ({ loc: `${BASE_URL}/${child}` }))),
  );
}
