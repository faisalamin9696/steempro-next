import { connection } from "next/server";
import {
  BASE_URL,
  DISCOVERY_TABS,
  MAX_CHILD_PAGES,
  STATIC_PAGES,
  collectTagsAndAuthors,
  countPostPages,
  fetchCommunityPage,
  fetchPostPage,
  fetchProposals,
  fetchShortsPage,
  isCommunityAccount,
  postLastmod,
  postUrl,
  profileUrl,
  sitemapNotFound,
  shortUrl,
  take,
  urlSet,
  xmlResponse,
  type SitemapEntry,
} from "@/utils/sitemap";

/**
 * Child sitemaps. `/sitemap.xml` is the index; everything below it is served
 * from here so a single catch-all handler can own the whole namespace.
 *
 * Route segment configs (`dynamic`, `revalidate`) are meaningless with
 * `cacheComponents` enabled — `connection()` is the supported way to say
 * "only ever render this with a real request".
 */

const MAX_URLS_PER_FILE = 45_000;
const TAG_SOURCING_PAGES = intFromEnv(
  "SEO_TAG_SOURCING_PAGES",
  20,
  1,
  MAX_CHILD_PAGES,
);

function intFromEnv(
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = Number.parseInt(process.env[name] ?? "", 10);
  if (!Number.isFinite(raw)) return fallback;
  return Math.min(Math.max(raw, min), max);
}

function parsePage(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = /^(\d+)\.xml$/.exec(raw);
  if (!match) return null;
  const page = Number.parseInt(match[1], 10);
  if (!Number.isFinite(page) || page < 1 || page > MAX_CHILD_PAGES) return null;
  return page;
}

async function postsFor(page: number): Promise<Feed[]> {
  try {
    return await fetchPostPage(page);
  } catch (error) {
    console.error(`[sitemap] posts page ${page} failed`, error);
    return [];
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  await connection();

  const { path } = await params;

  if (path.length === 1 && path[0] === "static.xml") {
    return xmlResponse(
      urlSet(
        STATIC_PAGES.map((page) => ({
          loc: `${BASE_URL}${page.path}`,
          changefreq: page.changefreq,
          priority: page.priority,
        })),
      ),
    );
  }

  if (path.length === 2 && path[0] === "posts") {
    const page = parsePage(path[1]);
    if (page === null) return sitemapNotFound();

    const entries: SitemapEntry[] = (await postsFor(page)).map((post) => ({
      loc: postUrl(post),
      lastmod: postLastmod(post),
      changefreq: "weekly",
      priority: "0.6",
    }));
    return xmlResponse(urlSet(entries));
  }

  if (path.length === 2 && path[0] === "communities") {
    const page = parsePage(path[1]);
    if (page === null) return sitemapNotFound();

    let communities: Community[] = [];
    try {
      communities = await fetchCommunityPage(page);
    } catch (error) {
      console.error(`[sitemap] communities page ${page} failed`, error);
    }

    const entries: SitemapEntry[] = [];
    for (const community of communities) {
      if (!isCommunityAccount(community.account)) continue;
      for (const tab of DISCOVERY_TABS) {
        if (entries.length >= MAX_URLS_PER_FILE) break;
        entries.push({ loc: `${BASE_URL}/${tab}/${community.account}` });
      }
    }
    return xmlResponse(urlSet(entries));
  }

  if (path.length === 2 && path[0] === "shorts") {
    const page = parsePage(path[1]);
    if (page === null) return sitemapNotFound();

    let shorts: Feed[] = [];
    try {
      shorts = await fetchShortsPage(page);
    } catch (error) {
      console.error(`[sitemap] shorts page ${page} failed`, error);
    }

    return xmlResponse(
      urlSet(
        shorts.map((post) => ({
          loc: shortUrl(post),
          lastmod: postLastmod(post),
          changefreq: "weekly",
          priority: "0.6",
        })),
      ),
    );
  }

  if (path.length === 1 && path[0] === "tags.xml") {
    const pages = Math.min(await countPostPages().catch(() => 0), TAG_SOURCING_PAGES);
    const { tags } = await collectTagsAndAuthors(pages);

    const entries: SitemapEntry[] = [];
    for (const tag of tags) {
      for (const tab of DISCOVERY_TABS) {
        if (entries.length >= MAX_URLS_PER_FILE) break;
        entries.push({
          loc: `${BASE_URL}/${tab}/${tag}`,
          changefreq: "hourly",
          priority: "0.7",
        });
      }
      if (entries.length >= MAX_URLS_PER_FILE) break;
    }
    return xmlResponse(urlSet(entries));
  }

  if (path.length === 1 && path[0] === "profiles.xml") {
    const pages = Math.min(await countPostPages().catch(() => 0), TAG_SOURCING_PAGES);
    const { authors } = await collectTagsAndAuthors(pages);

    const entries: SitemapEntry[] = take(authors, MAX_URLS_PER_FILE).map(
      (author) => ({
        loc: profileUrl(author),
        changefreq: "daily",
        priority: "0.5",
      }),
    );
    return xmlResponse(urlSet(entries));
  }

  if (path.length === 1 && path[0] === "proposals.xml") {
    const proposals = await fetchProposals();
    return xmlResponse(
      urlSet(
        proposals.map((proposal) => ({
          loc: `${BASE_URL}/proposals/${proposal.id}`,
          changefreq: "daily",
          priority: "0.5",
        })),
      ),
    );
  }

  return sitemapNotFound();
}
