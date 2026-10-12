import type { MetadataRoute } from "next";

/**
 * The site's static page list — the only thing `/sitemap.xml` advertises.
 *
 * This module deliberately touches **no** data source. The sitemaps previously
 * assembled posts, tags, profiles, communities, shorts and proposals from live
 * blockchain queries, which meant every one of those files was generated inside
 * the crawler's own request — and GSC reported them as "Sitemap could not be
 * read" while the static list, built from a constant, read fine. A constant
 * cannot be slow and cannot fail.
 *
 * `app/sitemap.ts` consumes `STATIC_PAGES` and hands the result to Next, which
 * emits the XML and prerenders the whole file, so `/sitemap.xml` costs nothing
 * at request time.
 */

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

/**
 * A sitemap row: the site-relative `path` plus everything `app/sitemap.ts`
 * passes straight through to `MetadataRoute.Sitemap`. Typing it against Next's
 * own type keeps `changeFrequency` and `priority` from drifting out of the
 * allowed values.
 */
export type StaticPage = Omit<MetadataRoute.Sitemap[number], "url"> & {
  path: string;
};

export const STATIC_PAGES: StaticPage[] = [
  { path: "/", changeFrequency: "always", priority: 1 },
  { path: "/hot", changeFrequency: "always", priority: 0.9 },
  { path: "/created", changeFrequency: "always", priority: 0.9 },
  { path: "/popular", changeFrequency: "always", priority: 0.85 },
  { path: "/payout", changeFrequency: "always", priority: 0.85 },
  { path: "/shorts", changeFrequency: "always", priority: 0.9 },
  { path: "/explorer", changeFrequency: "daily", priority: 0.8 },
  { path: "/market", changeFrequency: "hourly", priority: 0.8 },
  { path: "/witnesses", changeFrequency: "daily", priority: 0.7 },
  { path: "/communities", changeFrequency: "daily", priority: 0.7 },
  { path: "/proposals", changeFrequency: "daily", priority: 0.7 },
  { path: "/games", changeFrequency: "weekly", priority: 0.6 },
  { path: "/games/steem-heights", changeFrequency: "weekly", priority: 0.6 },
  { path: "/tools", changeFrequency: "weekly", priority: 0.6 },
  { path: "/tools/account-creation", changeFrequency: "weekly", priority: 0.6 },
  {
    path: "/tools/account-health-check",
    changeFrequency: "weekly",
    priority: 0.6,
  },
  {
    path: "/tools/author-statistic-report",
    changeFrequency: "weekly",
    priority: 0.6,
  },
  { path: "/tools/batch-commenting", changeFrequency: "weekly", priority: 0.6 },
  { path: "/tools/batch-transfer", changeFrequency: "weekly", priority: 0.6 },
  { path: "/tools/batch-voting", changeFrequency: "weekly", priority: 0.6 },
  { path: "/tools/community-report", changeFrequency: "weekly", priority: 0.6 },
  // /submit is intentionally absent: it is `noindex` in metadata.submit() and
  // Disallowed in robots.txt (posting page, auth required). Submitting a
  // noindex URL in the sitemap is the contradictory signal Search Console
  // reports as "submitted URL not indexed".
  { path: "/about", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
];

/** `/trending` is intentionally absent: its canonical is `/` (see getMetadata.home). */
