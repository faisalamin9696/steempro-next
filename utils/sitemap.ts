import type { MetadataRoute } from "next";
import { sdsApi } from "@/libs/sds";

/**
 * Sitemap plumbing shared by the standalone `*.xml` routes.
 *
 * `/sitemap.xml` is a sitemap **index** (see `app/sitemap.xml/route.ts`) that
 * only lists four child files and does no I/O at all. That is deliberate: the
 * previous index ran three page-count probes inside the crawler's own request
 * and Search Console reported it — and every child — as "Sitemap could not be
 * read", while `static.xml`, the one file needing no data, read fine. The fix
 * is structural: the index is a constant, and the work that remains is pushed
 * into children that render once and are then reused.
 *
 * Each data-backed child renders through `serveSitemap`, which memoises the
 * finished XML for six hours, so a cold render happens at most twice a day and
 * every later hit is a string lookup. Failures never surface as a 5xx: a stale
 * render is served if one exists, otherwise a valid but empty `<urlset>` under
 * a short cache header.
 *
 * Server-only — `libs/sds` pulls in the blockchain client, so never import
 * this from a component.
 */

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

/* ------------------------------------------------------------------------- */
/* Static pages                                                              */
/* ------------------------------------------------------------------------- */

/**
 * A sitemap row: the site-relative `path` plus everything the static child
 * passes to the XML writer. Typing it against Next's own type keeps
 * `changeFrequency` and `priority` from drifting outside the protocol's values,
 * even though `app/sitemap.ts` no longer consumes it.
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

/* ------------------------------------------------------------------------- */
/* Protocol limits and SDS tuning                                            */
/* ------------------------------------------------------------------------- */

/** The sitemaps.org protocol allows 50k URLs / 50MB per file — stay under both. */
export const MAX_URLS_PER_FILE = 45_000;

/**
 * SDS hard-caps `limit` at 1000 (`'limit' must be <= 1000`), so covering N rows
 * always costs `ceil(N / 1000)` requests no matter how they are batched.
 */
export const POST_SITEMAP_PAGE_SIZE = 1000;
export const COMMUNITY_SITEMAP_PAGE_SIZE = 1000;

const MAX_POST_PAGES = Math.ceil(MAX_URLS_PER_FILE / POST_SITEMAP_PAGE_SIZE);
const MAX_COMMUNITY_PAGES = Math.ceil(
  MAX_URLS_PER_FILE / COMMUNITY_SITEMAP_PAGE_SIZE,
);

/** Pages of one file are requested together rather than one after another. */
const SDS_CONCURRENCY = 6;

/**
 * `bodyLength: 0`. The sitemap only reads `author`, `permlink` and the
 * timestamps, and asking for no body text trims roughly a third off every page
 * without losing a single field it uses.
 */
const SDS_BODY_LENGTH = 0;

/** How long a finished render is reused before SDS is asked again. */
const RENDER_TTL_MS = 6 * 60 * 60 * 1000;

export const SITEMAP_CACHE_CONTROL =
  "public, max-age=1800, s-maxage=86400, stale-while-revalidate=604800";

/**
 * Shorter header for the degraded (empty) body: a CDN must not hold a
 * fallback in place while SDS is recovering.
 */
export const SITEMAP_DEGRADED_CACHE_CONTROL =
  "public, max-age=60, s-maxage=300";

/* ------------------------------------------------------------------------- */
/* Which listing tabs are advertised                                         */
/* ------------------------------------------------------------------------- */

/** Public listing tabs that exist as their own indexable URL (see next.config.ts rewrites). */
export const DISCOVERY_TABS = [
  "trending",
  "popular",
  "created",
  "hot",
  "payout",
] as const;

/**
 * Which of `DISCOVERY_TABS` the sitemap actually advertises — `trending` only.
 *
 * Emitting all five put the same tag or community into the file five times:
 * five sort orders of one page. On a site with only a handful of pages indexed
 * that spends the crawl budget on near-duplicates instead of on the pages
 * themselves. The other four tabs stay reachable — every community page renders
 * its own tab bar linking to them — so Google can find and canonicalise them
 * without the sitemap vouching for all five. Widen the predicate to put one
 * back.
 */
export const SITEMAP_TABS: readonly string[] = DISCOVERY_TABS.filter(
  (tab) => tab === "trending",
);

/* ------------------------------------------------------------------------- */
/* XML                                                                       */
/* ------------------------------------------------------------------------- */

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function urlSet(entries: SitemapEntry[]): string {
  const body = entries
    .map((entry) => {
      let row = `  <url><loc>${escapeXml(entry.loc)}</loc>`;
      if (entry.lastmod) row += `<lastmod>${entry.lastmod}</lastmod>`;
      if (entry.changefreq) row += `<changefreq>${entry.changefreq}</changefreq>`;
      if (entry.priority) row += `<priority>${entry.priority}</priority>`;
      return `${row}</url>`;
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>\n`
  );
}

export function sitemapIndex(
  entries: { loc: string; lastmod?: string }[],
): string {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
      return `  <sitemap><loc>${escapeXml(entry.loc)}</loc>${lastmod}</sitemap>`;
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</sitemapindex>\n`
  );
}

export function xmlResponse(
  body: string,
  cacheControl: string = SITEMAP_CACHE_CONTROL,
): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}

/* ------------------------------------------------------------------------- */
/* Entry builders                                                            */
/* ------------------------------------------------------------------------- */

const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;

export function toIso(value?: number | string | null): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;

  let ms: number;
  if (typeof value === "number") {
    // Steem timestamps are unix seconds; guard against millisecond values.
    ms = value > 1e12 ? value : value * 1000;
  } else {
    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed)) return undefined;
    ms = parsed;
  }

  if (!Number.isFinite(ms) || ms <= 0) return undefined;
  const date = new Date(ms);
  // Reject dates that are obviously broken (0, NaN, year 3000+).
  if (Number.isNaN(date.getTime())) return undefined;
  if (date.getTime() > Date.now() + MAX_AGE_MS) return undefined;
  return date.toISOString();
}

/** The three fields a sitemap needs from a post — kept light because ~12k of them are cached. */
export type PostRef = Pick<Feed, "author" | "permlink" | "created" | "last_update">;

export function postUrl(post: PostRef): string {
  return `${BASE_URL}/@${post.author}/${post.permlink}`;
}

/** Newest date on a post, best effort. */
export function postLastmod(post: PostRef): string | undefined {
  return toIso(post.last_update || post.created);
}

/**
 * Profile root, which is the canonical for every profile tab — `wallet`,
 * `notifications`, `settings` and `feed` are noindex and must not appear as
 * separate URLs (see `app/profile/[username]/[tab]/layout.tsx`).
 */
export function profileUrl(username: string): string {
  return `${BASE_URL}/@${username.toLowerCase()}`;
}

const COMMUNITY_TAG_PATTERN = /^hive-[a-z0-9-]+$/;

/**
 * Non-`hive-…` accounts do not resolve through the `/trending/hive-:tag`
 * rewrite, so listing them would publish URLs that do not route anywhere.
 */
export function isCommunityAccount(
  account: string | null | undefined,
): boolean {
  return !!account && COMMUNITY_TAG_PATTERN.test(account);
}

export function take<T>(items: T[], limit: number): T[] {
  return items.length > limit ? items.slice(0, limit) : items;
}

/** `STATIC_PAGES` in protocol form: `changefreq` as written, `priority` as `0.9`. */
export function staticEntries(): SitemapEntry[] {
  return STATIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    loc: `${BASE_URL}${path}`,
    ...(changeFrequency ? { changefreq: changeFrequency } : {}),
    ...(priority === undefined ? {} : { priority: priority.toFixed(1) }),
  }));
}

/* ------------------------------------------------------------------------- */
/* Rendering: one cached XML body per file                                   */
/* ------------------------------------------------------------------------- */

type CachedRender = { value: string; expires: number };
const renderCache = new Map<string, CachedRender>();

async function renderCached(
  key: string,
  produce: () => Promise<string>,
): Promise<string> {
  const now = Date.now();
  const hit = renderCache.get(key);
  if (hit && hit.expires > now) return hit.value;

  try {
    const value = await produce();
    renderCache.set(key, { value, expires: now + RENDER_TTL_MS });
    return value;
  } catch (error) {
    // Stale beats empty. Leave `expires` in the past so the next request
    // retries instead of cementing a six-hour-old failure.
    if (hit) {
      console.error(
        `[sitemap] ${key} refresh failed, serving last good render`,
        error,
      );
      return hit.value;
    }
    throw error;
  }
}

/**
 * The one entry point every data-backed child uses: render, cache, and never
 * let a bad upstream turn into a non-2xx the crawler reports as unreadable.
 */
export async function serveSitemap(
  key: string,
  produce: () => Promise<string>,
): Promise<Response> {
  try {
    return xmlResponse(await renderCached(key, produce));
  } catch (error) {
    console.error(
      `[sitemap] ${key} render failed, serving an empty urlset`,
      error,
    );
    return xmlResponse(urlSet([]), SITEMAP_DEGRADED_CACHE_CONTROL);
  }
}

/* ------------------------------------------------------------------------- */
/* Fetchers                                                                  */
/* ------------------------------------------------------------------------- */

async function mapConcurrent<T>(
  count: number,
  limit: number,
  produce: (index: number) => Promise<T>,
): Promise<T[]> {
  const results = new Array<T>(count);
  let cursor = 0;

  const workers = Array.from(
    { length: Math.max(1, Math.min(limit, count)) },
    async () => {
      for (;;) {
        const index = cursor++;
        if (index >= count) return;
        results[index] = await produce(index);
      }
    },
  );

  await Promise.all(workers);
  return results;
}

/**
 * Walks pages of `fetchPage` a wave at a time, stopping as soon as a page
 * comes back short — that page is the last one the API has, so any later page
 * in the wave is known to be empty.
 *
 * Probing the total first would cost ~8 extra round trips of its own; letting
 * the wave itself discover the end is both cheaper and self-limiting.
 */
async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<T[]>,
  pageSize: number,
  maxPages: number,
): Promise<T[]> {
  const rows: T[] = [];

  for (let start = 1; start <= maxPages; start += SDS_CONCURRENCY) {
    const end = Math.min(start + SDS_CONCURRENCY - 1, maxPages);
    const wave = await mapConcurrent(end - start + 1, SDS_CONCURRENCY, (i) =>
      fetchPage(start + i),
    );

    let exhausted = false;
    for (const pageRows of wave) {
      rows.push(...pageRows);
      if (pageRows.length < pageSize) exhausted = true;
    }
    if (exhausted) break;
  }

  return rows;
}

export async function fetchPostPage(page: number): Promise<Feed[]> {
  const posts = await sdsApi.getFeedByApiPath(
    "getActivePostsByCreated",
    "steem",
    POST_SITEMAP_PAGE_SIZE,
    (page - 1) * POST_SITEMAP_PAGE_SIZE,
    SDS_BODY_LENGTH,
  );
  return Array.isArray(posts) ? posts : [];
}

export async function fetchCommunityPage(page: number): Promise<Community[]> {
  const communities = await sdsApi.getCommunities(
    "steem",
    COMMUNITY_SITEMAP_PAGE_SIZE,
    (page - 1) * COMMUNITY_SITEMAP_PAGE_SIZE,
  );
  return Array.isArray(communities) ? communities : [];
}

/* ------------------------------------------------------------------------- */
/* Sources, shared between children                                          */
/* ------------------------------------------------------------------------- */

type Sources = { posts?: PostRef[]; communities?: Community[] };
const sources: Sources = {};

/**
 * Recent posts as light refs, shared by `posts.xml` and `profiles.xml` so the
 * second file to render costs nothing extra. Duplicated by `author/permlink`
 * because new posts arriving mid-render shift every offset by a row.
 */
export async function recentPostRefs(): Promise<PostRef[]> {
  if (sources.posts) return sources.posts;

  const feeds = await fetchAllPages(
    fetchPostPage,
    POST_SITEMAP_PAGE_SIZE,
    MAX_POST_PAGES,
  );

  const seen = new Set<string>();
  const refs: PostRef[] = [];
  for (const post of feeds) {
    const key = `${post.author}/${post.permlink}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push({
      author: post.author,
      permlink: post.permlink,
      created: post.created,
      last_update: post.last_update,
    });
  }

  sources.posts = refs;
  return refs;
}

export async function recentCommunities(): Promise<Community[]> {
  if (sources.communities) return sources.communities;

  const communities = await fetchAllPages(
    fetchCommunityPage,
    COMMUNITY_SITEMAP_PAGE_SIZE,
    MAX_COMMUNITY_PAGES,
  );

  sources.communities = communities;
  return communities;
}

/* ------------------------------------------------------------------------- */
/* Renderers                                                                 */
/* ------------------------------------------------------------------------- */

export async function renderStaticXml(): Promise<string> {
  return urlSet(staticEntries());
}

export async function renderPostsXml(): Promise<string> {
  const posts = await recentPostRefs();
  return urlSet(
    take(posts, MAX_URLS_PER_FILE).map((post) => ({
      loc: postUrl(post),
      lastmod: postLastmod(post),
      changefreq: "weekly",
      priority: "0.6",
    })),
  );
}

export async function renderProfilesXml(): Promise<string> {
  const posts = await recentPostRefs();

  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];
  for (const post of posts) {
    const username = post.author.toLowerCase();
    if (seen.has(username)) continue;
    seen.add(username);
    if (entries.length >= MAX_URLS_PER_FILE) break;
    entries.push({
      loc: profileUrl(username),
      changefreq: "daily",
      priority: "0.5",
    });
  }

  return urlSet(entries);
}

export async function renderCommunitiesXml(): Promise<string> {
  const communities = await recentCommunities();

  const entries: SitemapEntry[] = [];
  for (const community of communities) {
    if (entries.length >= MAX_URLS_PER_FILE) break;
    if (!isCommunityAccount(community.account)) continue;
    // One URL per community — see SITEMAP_TABS.
    for (const tab of SITEMAP_TABS) {
      entries.push({ loc: `${BASE_URL}/${tab}/${community.account}` });
    }
  }

  return urlSet(entries);
}
