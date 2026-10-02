import { mapSds, sdsFetcher } from "@/constants/functions";
import { sdsApi } from "@/libs/sds";
import { Role } from "@/utils/community";

/**
 * Server-side data layer for the community Stats tab.
 *
 * Builds a full statistical picture of a community over a time window by
 * paging the community's posts + comments feeds, then aggregating:
 * daily activity/reward series, engagement rates, a per-author leaderboard
 * (the "race"), the window's top rewarded content, and leadership stats.
 *
 * Everything is wrapped in an in-process memo so the API route and the
 * server-side first render share one set of SDS fetches.
 */

// ---------------------------------------------------------------------------
// Memo helpers (promise-cached so concurrent callers share one fetch)
// ---------------------------------------------------------------------------

interface MemoEntry {
  expires: number;
  value: Promise<unknown>;
}

const memoStore = new Map<string, MemoEntry>();

async function memo<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = memoStore.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;

  const promise = fn();
  memoStore.set(key, { expires: Date.now() + ttlMs, value: promise });
  try {
    return await promise;
  } catch (error) {
    // Never cache failures — the next caller should be able to retry.
    memoStore.delete(key);
    throw error;
  } finally {
    if (memoStore.size > 200) {
      const now = Date.now();
      for (const [k, v] of memoStore) if (v.expires <= now) memoStore.delete(k);
    }
  }
}

/** A dead section renders as empty data instead of failing the whole tab. */
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.warn("[communityStats] section fallback:", error);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CommunityRange = "7d" | "30d" | "90d";

export const COMMUNITY_RANGES: CommunityRange[] = ["7d", "30d", "90d"];

export const COMMUNITY_RANGE_SECONDS: Record<CommunityRange, number> = {
  "7d": 604800,
  "30d": 2592000,
  "90d": 7776000,
};

export const COMMUNITY_RANGE_DAYS: Record<CommunityRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/** One UTC-day bucket of community activity. */
export interface CommunitySeriesPoint {
  t: number;
  posts: number;
  comments: number;
  /** author rewards (USD) for content created that day */
  payout: number;
  /** upvotes received by content created that day */
  votes: number;
}

/** type (not interface) — DataTable requires a Record-compatible shape. */
export type CommunityAuthorStats = {
  author: string;
  posts: number;
  comments: number;
  postPayout: number;
  commentPayout: number;
  /** total author rewards in the window (USD) */
  rewards: number;
  /** upvotes received across the author's posts + comments */
  votesReceived: number;
  /** replies received on the author's posts */
  commentsReceived: number;
  /** votesReceived + commentsReceived — how engaging their content is */
  engagement: number;
  lastActive: number;
}

export interface CommunityStatsTotals {
  posts: number;
  comments: number;
  /** distinct root-post authors */
  uniqueAuthors: number;
  /** distinct commenters */
  uniqueCommenters: number;
  /** distinct members with any content in the window */
  activeMembers: number;
  postPayout: number;
  commentPayout: number;
  rewards: number;
  avgPostPayout: number;
  commentsPerPost: number;
  votesPerPost: number;
  /** interactions (comments + upvotes) per post */
  engagementRate: number;
  /** up / (up + down) across posts + comments, 0..1 */
  upvoteRatio: number;
  /** share of posts that received at least one reply, 0..1 */
  discussedPct: number;
  words: number;
  /** true when the page cap stopped us before covering the full window */
  partial: boolean;
  /** oldest content timestamp the aggregation actually covers */
  oldestCovered: number;
}

export interface CommunityTopPost {
  author: string;
  permlink: string;
  title: string;
  payout: number;
  comments: number;
  votes: number;
  created: number;
}

export interface CommunityTopComment {
  author: string;
  permlink: string;
  root_author: string;
  root_title: string;
  payout: number;
  created: number;
}

export interface CommunityTagStat {
  tag: string;
  /** posts in the window carrying this tag */
  posts: number;
  /** comments those posts received */
  comments: number;
  /** upvotes those posts received */
  votes: number;
  /** author payout summed across those posts (USD) */
  rewards: number;
}

export interface CommunityTagStats {
  /** top 10 user tags by usage (the community's own tag excluded) */
  top: CommunityTagStat[];
  /** distinct user tags across the window */
  unique: number;
  /** total tag uses across every user tag, not just the top 10 */
  usage: number;
  /** posts carrying at least one user tag */
  taggedPosts: number;
}

export interface CommunityLeaderStats {
  account: string;
  role: string;
  reputation?: number;
  followers?: number;
  posts: number;
  comments: number;
  rewards: number;
  engagement: number;
}

export interface CommunityViewerStats {
  author: string;
  posts: number;
  comments: number;
  rewards: number;
  engagement: number;
  /** global per-metric rank among the window's active members */
  ranks: {
    rewards: number;
    posts: number;
    comments: number;
    engagement: number;
  };
  /** total members with content in the window */
  total: number;
}

export interface CommunityStats {
  community: {
    account: string;
    title: string;
    rank: number;
    count_subs: number;
    count_authors: number;
    count_pending: number;
    sum_pending: number;
    created: number;
  };
  range: CommunityRange;
  from: number;
  to: number;
  series: CommunitySeriesPoint[];
  totals: CommunityStatsTotals;
  /** top 50 members by rewards in the window (the race pool) */
  authors: CommunityAuthorStats[];
  topPosts: CommunityTopPost[];
  topComments: CommunityTopComment[];
  /** top-10 user tags by usage + window tag totals */
  tags: CommunityTagStats;
  leaders: CommunityLeaderStats[];
  viewer: CommunityViewerStats | null;
}

// ---------------------------------------------------------------------------
// Feed window paging
// ---------------------------------------------------------------------------

const FEED_PAGE = 1000;
const MAX_POST_PAGES = 6;
const MAX_COMMENT_PAGES = 8;
const MAX_LEADERS = 12;
const AUTHOR_LIMIT = 50;
const TAG_LIMIT = 10;

interface FeedWindowRow {
  author: string;
  permlink: string;
  created: number;
  payout: number | string;
  children: number;
  upvote_count: number;
  downvote_count: number;
  word_count?: number;
  title?: string;
  root_author?: string;
  root_title?: string;
  /** first tag / community tag of the post */
  category?: string;
  /** post metadata — carries the `tags` array */
  json_metadata?: string;
}

function num(v: number | string | undefined): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Tags carried by a post: `category` plus `json_metadata.tags`, lowercased. */
function postTags(row: FeedWindowRow): string[] {
  const out: string[] = [];
  if (row.category) out.push(String(row.category).toLowerCase());
  if (row.json_metadata) {
    try {
      const meta =
        typeof row.json_metadata === "string"
          ? JSON.parse(row.json_metadata)
          : row.json_metadata;
      for (const tag of meta?.tags ?? []) {
        if (typeof tag === "string" && tag) out.push(tag.toLowerCase());
      }
    } catch {
      // Malformed metadata — the category tag still counts.
    }
  }
  return out;
}

interface WindowResult {
  rows: FeedWindowRow[];
  /** oldest timestamp the fetch actually reached */
  oldest: number;
  /** true when the window (or the whole feed) is fully covered */
  covered: boolean;
  fetched: number;
}

async function fetchCommunityWindow(
  kind: "Posts" | "Comments",
  community: string,
  from: number,
  maxPages: number,
): Promise<WindowResult> {
  const apiPath = `getCommunity${kind}ByCreated`;
  const collected: FeedWindowRow[] = [];
  let oldest = Math.floor(Date.now() / 1000);
  let covered = false;

  for (let page = 0; page < maxPages; page++) {
    const rows = await sdsFetcher<FeedWindowRow[]>(
      `/feeds_api/${apiPath}/${community}/steem/${FEED_PAGE}/${FEED_PAGE}/${
        page * FEED_PAGE
      }`,
    );
    if (!rows || rows.length === 0) {
      // End of feed — there is nothing older to cover.
      covered = true;
      break;
    }
    collected.push(...rows);
    oldest = Math.min(oldest, ...rows.map((r) => num(r.created)));
    if (oldest < from) {
      covered = true;
      break;
    }
    if (rows.length < FEED_PAGE) {
      covered = true;
      break;
    }
  }

  return {
    rows: collected.filter((r) => num(r.created) >= from),
    oldest,
    covered,
    fetched: collected.length,
  };
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/**
 * Top-10 user tags by usage. The community's own tag (its account — every
 * post's `category`) is excluded: it's invariant and would drown the ranking.
 * Each post counts once per distinct user tag; per-tag engagement/rewards
 * aggregate the posts carrying that tag.
 */
function aggregateTags(
  rows: FeedWindowRow[],
  community: string,
): CommunityTagStats {
  const own = community.toLowerCase();
  const byTag = new Map<string, CommunityTagStat>();
  let usage = 0;
  let taggedPosts = 0;

  for (const row of rows) {
    const seen = new Set<string>();
    for (const tag of postTags(row)) {
      if (!tag || tag === own || seen.has(tag)) continue;
      seen.add(tag);
      let e = byTag.get(tag);
      if (!e) {
        e = { tag, posts: 0, comments: 0, votes: 0, rewards: 0 };
        byTag.set(tag, e);
      }
      e.posts += 1;
      e.comments += num(row.children);
      e.votes += num(row.upvote_count);
      e.rewards += num(row.payout);
      usage += 1;
    }
    if (seen.size > 0) taggedPosts += 1;
  }

  const top = [...byTag.values()]
    .sort((a, b) => b.posts - a.posts || b.rewards - a.rewards)
    .slice(0, TAG_LIMIT);

  return { top, unique: byTag.size, usage, taggedPosts };
}

function isLeader(role: string): boolean {
  try {
    return Role.atLeast(role, "mod");
  } catch {
    return false;
  }
}

function metricRank(
  authors: CommunityAuthorStats[],
  key: "rewards" | "posts" | "comments" | "engagement",
  value: number,
): number {
  let rank = 1;
  for (const a of authors) {
    if (a[key] > value) rank += 1;
  }
  return rank;
}

export function getCommunityStats(
  community: string,
  range: CommunityRange,
  viewer?: string,
): Promise<CommunityStats> {
  const bucketKey = Math.floor(Date.now() / 900_000); // 15-min memo window
  return memo(
    `community-stats-${community}-${range}-${bucketKey}`,
    10 * 60_000,
    async () => {
      const to = Math.floor(Date.now() / 1000);
      // Day-aligned window: the first bucket IS the window's first midnight,
      // so every counted row lands in a bucket and the series sums to the
      // totals exactly (a mid-day `from` would strand a partial first bucket
      // in the totals but not in the chart).
      const today = Math.floor(to / 86400) * 86400;
      const dayCount = COMMUNITY_RANGE_DAYS[range];
      const start = today - (dayCount - 1) * 86400;
      const observer = viewer || "steem";

      const [comm, postWin, commentWin] = await Promise.all([
        safe(sdsApi.getCommunity(community, observer), null as Community | null),
        fetchCommunityWindow("Posts", community, start, MAX_POST_PAGES),
        fetchCommunityWindow("Comments", community, start, MAX_COMMENT_PAGES),
      ]);

      // Effective cutoff: if a feed hit the page cap before reaching the
      // window start, drop every day it cannot fully account for — from the
      // chart AND the totals alike, so sum(series) === totals always holds.
      const firstFullDay = (oldest: number) =>
        oldest % 86400 === 0
          ? oldest
          : Math.floor(oldest / 86400) * 86400 + 86400;
      const from = Math.max(
        postWin.covered ? start : firstFullDay(postWin.oldest),
        commentWin.covered ? start : firstFullDay(commentWin.oldest),
      );
      const partial = from > start;
      const postRows = postWin.rows.filter((r) => num(r.created) >= from);
      const commentRows = commentWin.rows.filter(
        (r) => num(r.created) >= from,
      );
      const tags = aggregateTags(postRows, community);

      // ---- per-author aggregation -----------------------------------------
      const byAuthor = new Map<string, CommunityAuthorStats>();
      const entry = (author: string): CommunityAuthorStats => {
        let e = byAuthor.get(author);
        if (!e) {
          e = {
            author,
            posts: 0,
            comments: 0,
            postPayout: 0,
            commentPayout: 0,
            rewards: 0,
            votesReceived: 0,
            commentsReceived: 0,
            engagement: 0,
            lastActive: 0,
          };
          byAuthor.set(author, e);
        }
        return e;
      };

      let postPayout = 0;
      let commentPayout = 0;
      let postVotes = 0;
      let up = 0;
      let down = 0;
      let words = 0;
      let discussed = 0;
      let postsFetched = 0;
      let commentsFetched = 0;

      for (const row of postRows) {
        const payout = num(row.payout);
        const e = entry(row.author);
        e.posts += 1;
        e.postPayout += payout;
        e.rewards += payout;
        e.votesReceived += num(row.upvote_count);
        e.commentsReceived += num(row.children);
        e.engagement += num(row.upvote_count) + num(row.children);
        e.lastActive = Math.max(e.lastActive, num(row.created));

        postPayout += payout;
        postVotes += num(row.upvote_count);
        up += num(row.upvote_count);
        down += num(row.downvote_count);
        words += num(row.word_count);
        if (num(row.children) > 0) discussed += 1;
        postsFetched += 1;
      }

      for (const row of commentRows) {
        const payout = num(row.payout);
        const e = entry(row.author);
        e.comments += 1;
        e.commentPayout += payout;
        e.rewards += payout;
        e.votesReceived += num(row.upvote_count);
        e.engagement += num(row.upvote_count);
        e.lastActive = Math.max(e.lastActive, num(row.created));

        commentPayout += payout;
        up += num(row.upvote_count);
        down += num(row.downvote_count);
        words += num(row.word_count);
        commentsFetched += 1;
      }

      const authors = [...byAuthor.values()]
        .sort((a, b) => b.rewards - a.rewards || b.engagement - a.engagement)
        .slice(0, AUTHOR_LIMIT);

      // ---- daily series ----------------------------------------------------
      const seriesMap = new Map<number, CommunitySeriesPoint>();
      for (let d = 0; d < dayCount; d++) {
        seriesMap.set(start + d * 86400, {
          t: start + d * 86400,
          posts: 0,
          comments: 0,
          payout: 0,
          votes: 0,
        });
      }
      const bump = (row: FeedWindowRow, kind: "posts" | "comments") => {
        const day = Math.floor(num(row.created) / 86400) * 86400;
        const bucket = seriesMap.get(day);
        if (!bucket) return;
        bucket[kind] += 1;
        bucket.payout += num(row.payout);
        bucket.votes += num(row.upvote_count);
      };
      postRows.forEach((r) => bump(r, "posts"));
      commentRows.forEach((r) => bump(r, "comments"));

      // Keep only fully covered days (see `from` above).
      const series = [...seriesMap.values()].filter((p) => p.t >= from);

      // ---- totals ----------------------------------------------------------
      const activeMembers = byAuthor.size;
      const uniqueAuthors = postRows.length
        ? new Set(postRows.map((r) => r.author)).size
        : 0;
      const uniqueCommenters = commentRows.length
        ? new Set(commentRows.map((r) => r.author)).size
        : 0;
      const rewards = postPayout + commentPayout;
      const commentsPerPost = postsFetched ? commentsFetched / postsFetched : 0;
      const votesPerPost = postsFetched ? postVotes / postsFetched : 0;
      const engagementRate = commentsPerPost + votesPerPost;
      const upvoteRatio = up + down > 0 ? up / (up + down) : 0;
      const discussedPct = postsFetched ? discussed / postsFetched : 0;
      const oldestCovered = from;

      // ---- top content in the window --------------------------------------
      const topPosts: CommunityTopPost[] = postRows
        .filter((r) => num(r.payout) > 0 || num(r.children) > 0)
        .sort((a, b) => num(b.payout) - num(a.payout))
        .slice(0, 8)
        .map((r) => ({
          author: r.author,
          permlink: r.permlink,
          title: r.title || r.permlink,
          payout: num(r.payout),
          comments: num(r.children),
          votes: num(r.upvote_count),
          created: num(r.created),
        }));

      const topComments: CommunityTopComment[] = commentRows
        .filter((r) => num(r.payout) > 0)
        .sort((a, b) => num(b.payout) - num(a.payout))
        .slice(0, 6)
        .map((r) => ({
          author: r.author,
          permlink: r.permlink,
          root_author: r.root_author || "",
          root_title: r.root_title || "",
          payout: num(r.payout),
          created: num(r.created),
        }));

      // ---- leaders (roles ≥ mod, enriched with their window performance) --
      type RoleRow = { account: string; role: string; title?: string };
      const levelOf = (role: string): number => {
        try {
          return Role.level(role);
        } catch {
          return -1;
        }
      };
      const roles: RoleRow[] = comm?.roles
        ? (mapSds(comm.roles) as RoleRow[])
        : [];
      const leaderRows = roles
        .filter((r) => r?.account && isLeader(r.role))
        .sort((a, b) => levelOf(b.role) - levelOf(a.role));
      const leaderAccounts = [
        ...new Set(leaderRows.map((r) => r.account)),
      ].slice(0, MAX_LEADERS);

      const roleByAccount = new Map<string, string>();
      for (const r of leaderRows) roleByAccount.set(r.account, r.role);

      let leaderExt: AccountExt[] = [];
      if (leaderAccounts.length) {
        leaderExt = await safe(
          sdsApi.getAccountsExt(leaderAccounts, observer, [
            "name",
            "reputation",
            "count_followers",
          ]),
          [],
        );
      }
      const extByAccount = new Map(
        (leaderExt || []).map((a) => [a.name, a]),
      );

      const leaders: CommunityLeaderStats[] = leaderAccounts.map((account) => {
        const e = byAuthor.get(account);
        const ext = extByAccount.get(account);
        return {
          account,
          role: roleByAccount.get(account) || "mod",
          reputation: ext?.reputation,
          followers: ext?.count_followers,
          posts: e?.posts ?? 0,
          comments: e?.comments ?? 0,
          rewards: e?.rewards ?? 0,
          engagement: e?.engagement ?? 0,
        };
      });

      // ---- viewer race position -------------------------------------------
      let viewerStats: CommunityViewerStats | null = null;
      if (viewer) {
        const e = byAuthor.get(viewer);
        const all = [...byAuthor.values()];
        const v = {
          author: viewer,
          posts: e?.posts ?? 0,
          comments: e?.comments ?? 0,
          rewards: e?.rewards ?? 0,
          engagement: e?.engagement ?? 0,
        };
        viewerStats = {
          ...v,
          ranks: {
            rewards: metricRank(all, "rewards", v.rewards),
            posts: metricRank(all, "posts", v.posts),
            comments: metricRank(all, "comments", v.comments),
            engagement: metricRank(all, "engagement", v.engagement),
          },
          total: activeMembers,
        };
      }

      return {
        community: {
          account: community,
          title: comm?.title || community,
          rank: comm?.rank ?? 0,
          count_subs: comm?.count_subs ?? 0,
          count_authors: comm?.count_authors ?? 0,
          count_pending: comm?.count_pending ?? 0,
          sum_pending: comm?.sum_pending ?? 0,
          created: comm?.created ?? 0,
        },
        range,
        from,
        to,
        series,
        totals: {
          posts: postsFetched,
          comments: commentsFetched,
          uniqueAuthors,
          uniqueCommenters,
          activeMembers,
          postPayout,
          commentPayout,
          rewards,
          avgPostPayout: postsFetched ? postPayout / postsFetched : 0,
          commentsPerPost,
          votesPerPost,
          engagementRate,
          upvoteRatio,
          discussedPct,
          words,
          partial,
          oldestCovered,
        },
        authors,
        topPosts,
        topComments,
        tags,
        leaders,
        viewer: viewerStats,
      };
    },
  );
}
