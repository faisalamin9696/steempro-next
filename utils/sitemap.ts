import { sdsApi } from "@/libs/sds";

/**
 * Sitemap plumbing.
 *
 * Everything in here runs inside route handlers only (`app/sitemap.xml/route.ts`
 * and `app/sitemap/[...path]/route.ts`) — never import this from a client
 * component, it pulls in the SDS API client.
 *
 * The handlers call `connection()` first (required by `cacheComponents`) so none
 * of these fetches run at build time; results are memoised in-process so a cold
 * sitemap index costs ~20 tiny requests, then nothing for `PROBE_CACHE_TTL_MS`.
 */

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

/** Public listing tabs that exist as their own indexable URL (see next.config.ts rewrites). */
export const DISCOVERY_TABS = [
  "trending",
  "popular",
  "created",
  "hot",
  "payout",
] as const;

export const POST_SITEMAP_PAGE_SIZE = 1000;
export const COMMUNITY_SITEMAP_PAGE_SIZE = 1000;
export const SHORTS_SITEMAP_PAGE_SIZE = 500;

/** Safety cap so a bad count can never generate an unbounded number of children. */
export const MAX_CHILD_PAGES = 1000;
/** The sitemaps.org protocol allows 50k URLs / 50MB per file — stay under both. */
const MAX_URLS_PER_FILE = 45_000;
const PROBE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export const SITEMAP_CACHE_CONTROL =
  "public, max-age=1800, s-maxage=86400, stale-while-revalidate=604800";

/* ------------------------------------------------------------------------- */
/* Static pages                                                              */
/* ------------------------------------------------------------------------- */

type StaticPage = { path: string; changefreq: string; priority: string };

export const STATIC_PAGES: StaticPage[] = [
  { path: "/", changefreq: "always", priority: "1.0" },
  { path: "/hot", changefreq: "always", priority: "0.9" },
  { path: "/created", changefreq: "always", priority: "0.9" },
  { path: "/popular", changefreq: "always", priority: "0.85" },
  { path: "/payout", changefreq: "always", priority: "0.85" },
  { path: "/shorts", changefreq: "always", priority: "0.9" },
  { path: "/explorer", changefreq: "daily", priority: "0.8" },
  { path: "/market", changefreq: "hourly", priority: "0.8" },
  { path: "/witnesses", changefreq: "daily", priority: "0.7" },
  { path: "/communities", changefreq: "daily", priority: "0.7" },
  { path: "/proposals", changefreq: "daily", priority: "0.7" },
  { path: "/games", changefreq: "weekly", priority: "0.6" },
  { path: "/games/steem-heights", changefreq: "weekly", priority: "0.6" },
  { path: "/tools", changefreq: "weekly", priority: "0.6" },
  { path: "/tools/account-creation", changefreq: "weekly", priority: "0.6" },
  {
    path: "/tools/account-health-check",
    changefreq: "weekly",
    priority: "0.6",
  },
  {
    path: "/tools/author-statistic-report",
    changefreq: "weekly",
    priority: "0.6",
  },
  { path: "/tools/batch-commenting", changefreq: "weekly", priority: "0.6" },
  { path: "/tools/batch-transfer", changefreq: "weekly", priority: "0.6" },
  { path: "/tools/batch-voting", changefreq: "weekly", priority: "0.6" },
  { path: "/tools/community-report", changefreq: "weekly", priority: "0.6" },
  { path: "/submit", changefreq: "weekly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.2" },
];

/** `/trending` is intentionally absent: its canonical is `/` (see getMetadata.home). */

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

export function sitemapIndex(entries: { loc: string; lastmod?: string }[]): string {
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

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": SITEMAP_CACHE_CONTROL,
    },
  });
}

export function sitemapNotFound(): Response {
  return new Response("Not found", { status: 404 });
}

/* ------------------------------------------------------------------------- */
/* Shared entry builders                                                     */
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
  const now = Date.now();
  if (date.getTime() > now + MAX_AGE_MS) return undefined;
  return date.toISOString();
}

export function postUrl(post: Feed): string {
  return `${BASE_URL}/@${post.author}/${post.permlink}`;
}

export function shortUrl(post: Feed): string {
  return `${BASE_URL}/shorts/@${post.author}/${post.permlink}`;
}

export function profileUrl(username: string): string {
  return `${BASE_URL}/@${username}`;
}

/** Tags carried by a post: its category (first tag) plus `json_metadata.tags`. */
export function tagsOf(post: Feed): string[] {
  const tags = new Set<string>();
  if (post.category) tags.add(post.category);

  if (post.json_metadata) {
    try {
      const meta =
        typeof post.json_metadata === "string"
          ? JSON.parse(post.json_metadata)
          : post.json_metadata;
      for (const tag of meta?.tags ?? []) {
        if (typeof tag === "string" && tag) tags.add(tag);
      }
    } catch {
      // Malformed metadata should never break the sitemap.
    }
  }

  return [...tags];
}

const COMMUNITY_TAG_PATTERN = /^hive-[a-z0-9-]+$/;

/**
 * `hive-…` tags are community accounts, not tag pages — `/trending/hive-x`
 * rewrites to the community route, so listing them here would publish URLs
 * whose canonical points somewhere else.
 */
export function isIndexableTag(tag: string): boolean {
  if (!tag) return false;
  if (tag.startsWith("hive-")) return false;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(tag)) return false;
  return true;
}

export function isCommunityAccount(account: string | null | undefined): boolean {
  return !!account && COMMUNITY_TAG_PATTERN.test(account);
}

/** Newest date on a post, best effort. */
export function postLastmod(post: Feed): string | undefined {
  return toIso(post.last_update || post.created);
}

export function take<T>(items: T[], limit: number): T[] {
  return items.length > limit ? items.slice(0, limit) : items;
}

/* ------------------------------------------------------------------------- */
/* Fetchers                                                                  */
/* ------------------------------------------------------------------------- */

export async function fetchPostPage(page: number): Promise<Feed[]> {
  const posts = await sdsApi.getFeedByApiPath(
    "getActivePostsByCreated",
    "steem",
    POST_SITEMAP_PAGE_SIZE,
    (page - 1) * POST_SITEMAP_PAGE_SIZE,
    POST_SITEMAP_PAGE_SIZE,
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

export async function fetchShortsPage(page: number): Promise<Feed[]> {
  const shorts = await sdsApi.getSteemShorts(
    "steem",
    SHORTS_SITEMAP_PAGE_SIZE,
    (page - 1) * SHORTS_SITEMAP_PAGE_SIZE,
  );
  return Array.isArray(shorts) ? shorts : [];
}

export async function fetchProposals(): Promise<Proposal[]> {
  try {
    const proposals = await sdsApi.getProposals(1000);
    return Array.isArray(proposals) ? proposals : [];
  } catch {
    return [];
  }
}

/**
 * Walks the first `pages` post pages and returns the tags + authors they
 * mention. One pass, reused by both `/sitemap/tags.xml` and `/sitemap/profiles.xml`.
 */
export async function collectTagsAndAuthors(
  pages: number,
): Promise<{ tags: string[]; authors: string[] }> {
  const tags = new Set<string>();
  const authors = new Set<string>();

  for (let page = 1; page <= pages; page++) {
    let posts: Feed[];
    try {
      posts = await fetchPostPage(page);
    } catch {
      break;
    }
    if (posts.length === 0) break;

    for (const post of posts) {
      if (post.author) authors.add(post.author);
      for (const tag of tagsOf(post)) {
        if (isIndexableTag(tag)) tags.add(tag.toLowerCase());
      }
    }
  }

  return {
    tags: [...tags].sort(),
    authors: [...authors].sort(),
  };
}

/* ------------------------------------------------------------------------- */
/* Page-count probing                                                        */
/* ------------------------------------------------------------------------- */

type ProbeCacheEntry = { value: number; expires: number };

const probeCache = new Map<string, ProbeCacheEntry>();

/**
 * Finds how many `pageSize`-sized pages are reachable by asking the API
 * "is there an item at offset N?". Exponential growth then binary search keeps
 * it to roughly `2 * log2(total / pageSize)` requests.
 */
async function computePageCount(
  hasItemAt: (offset: number) => Promise<boolean>,
  pageSize: number,
  maxPages: number,
): Promise<number> {
  if (!(await hasItemAt(0))) return 0;

  let lo = 0;
  let hi = -1;
  let step = pageSize;

  while (step <= pageSize * maxPages) {
    if (await hasItemAt(step)) {
      lo = step;
      step *= 2;
    } else {
      hi = step;
      break;
    }
  }

  if (hi < 0) return maxPages;

  while (hi - lo > pageSize) {
    const mid = lo + Math.floor((hi - lo) / (2 * pageSize)) * pageSize;
    if (mid <= lo) break;
    if (await hasItemAt(mid)) lo = mid;
    else hi = mid;
  }

  return lo / pageSize + 1;
}

async function probePageCount(
  key: string,
  hasItemAt: (offset: number) => Promise<boolean>,
  pageSize: number,
): Promise<number> {
  const cached = probeCache.get(key);
  const now = Date.now();
  if (cached && cached.expires > now) return cached.value;

  // A failed probe is not cached so the next request retries.
  const value = await computePageCount(hasItemAt, pageSize, MAX_CHILD_PAGES);
  probeCache.set(key, { value, expires: now + PROBE_CACHE_TTL_MS });
  return value;
}

export function countPostPages(): Promise<number> {
  return probePageCount(
    "posts",
    async (offset) => {
      const rows = await sdsApi.getFeedByApiPath(
        "getActivePostsByCreated",
        "steem",
        1,
        offset,
        POST_SITEMAP_PAGE_SIZE,
      );
      return Array.isArray(rows) && rows.length > 0;
    },
    POST_SITEMAP_PAGE_SIZE,
  );
}

export function countCommunityPages(): Promise<number> {
  return probePageCount(
    "communities",
    async (offset) => {
      const rows = await sdsApi.getCommunities("steem", 1, offset);
      return Array.isArray(rows) && rows.length > 0;
    },
    COMMUNITY_SITEMAP_PAGE_SIZE,
  );
}

export function countShortsPages(): Promise<number> {
  return probePageCount(
    "shorts",
    async (offset) => {
      const rows = await sdsApi.getSteemShorts("steem", 1, offset);
      return Array.isArray(rows) && rows.length > 0;
    },
    SHORTS_SITEMAP_PAGE_SIZE,
  );
}
