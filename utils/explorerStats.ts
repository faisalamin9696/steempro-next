import { sdsFetcher } from "@/constants/functions";
import {
  condenserApi,
  type DynamicGlobalProperties,
  type MedianPrice,
  type RewardFund,
} from "@/libs/consenser";
import { sdsApi } from "@/libs/sds";
import { summarizeMarket, type MarketSummary } from "@/utils/marketSummary";

export type { MarketSummary };

/**
 * Server-side data layer for the blockchain explorer dashboard.
 *
 * Every fetcher is wrapped in a small in-process memo (keyed + TTL) because
 * several dashboard sections fan out into many parallel SDS requests (block
 * sampling, paged content feeds). The memo keeps a warm process cheap and
 * makes the /api/explorer range endpoints safe to poll.
 */

// ---------------------------------------------------------------------------
// Memo helpers
// ---------------------------------------------------------------------------

interface MemoEntry {
  expires: number;
  value: unknown;
}

const memoStore = new Map<string, MemoEntry>();

async function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = memoStore.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await fn();
  memoStore.set(key, { expires: Date.now() + ttlMs, value });
  // Bound the store so long-lived processes don't accumulate stale keys.
  if (memoStore.size > 200) {
    const now = Date.now();
    for (const [k, v] of memoStore) if (v.expires <= now) memoStore.delete(k);
  }
  return value;
}

/**
 * Degrade gracefully: a transient SDS/RPC failure renders the section empty
 * instead of taking down the whole dashboard.
 */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.warn("[explorerStats] section fallback:", error);
    return fallback;
  }
}

/** Run `fn` over `items` with a bounded concurrency pool. */
async function pooled<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ExplorerRange = "24h" | "7d" | "30d";
export type AuthorRange = "6h" | "24h";

export const RANGE_SECONDS: Record<ExplorerRange, number> = {
  "24h": 86400,
  "7d": 604800,
  "30d": 2592000,
};

export const AUTHOR_RANGE_SECONDS: Record<AuthorRange, number> = {
  "6h": 21600,
  "24h": 86400,
};

export interface ChainStats {
  count_transactions: number;
  count_operations: number;
  count_virtual_operations: number;
  count_accounts: number;
  count_witnesses: number;
  count_posts: number;
  count_comments: number;
  count_deleted_posts: number;
  count_deleted_comments: number;
}

export interface OperationStat {
  id: number;
  name: string;
  is_virtual: 0 | 1;
  first_block: number;
  total_count: number;
}

export interface TagStat {
  tag: string;
  count: number;
}

export interface AccountRow {
  name: string;
  created?: number;
  creator?: string;
  reputation?: number;
  balance_steem?: number | string;
  balance_sbd?: number | string;
  vests_own?: number | string;
  count_followers?: number;
  count_following?: number;
}

export interface WitnessRow {
  name: string;
  rank: number;
  created: number;
  received_votes: number;
  produced_blocks: number;
  missed_blocks: number;
  reported_price?: unknown;
}

export interface MissedBlockRow {
  time: number;
  witness: string;
}

export interface CommunityRow {
  account: string;
  title?: string;
  lang?: string;
  count_authors?: number;
  count_pending?: number;
  count_subs?: number;
  sum_pending?: number;
}

export interface ActivitySample {
  t: number;
  block: number;
  trx: number;
  ops: number;
  witness: string;
}

export interface AuthorStatRow {
  author: string;
  posts: number;
  comments: number;
  total: number;
  payout: number;
}

export interface AuthorBucket {
  t: number;
  posts: number;
  comments: number;
}

export interface AuthorActivity {
  range: AuthorRange;
  from: number;
  to: number;
  buckets: AuthorBucket[];
  topAuthors: AuthorStatRow[];
  totals: {
    posts: number;
    comments: number;
    uniqueAuthors: number;
    payout: number;
    postsFetched: number;
    commentsFetched: number;
    /** oldest fetched content timestamp – shows how far back we actually cover */
    oldestCovered: number;
  };
}

export interface ShareRatePoint {
  t: number;
  rate: number;
}

export interface ChainParameters {
  headBlock: number;
  lastIrreversible: number;
  accountCount: number;
  hardfork: string;
  nextHardfork: string | null;
  nextHardforkTime: string | null;
  blockInterval: number;
  sbdPrintRate: number;
  sbdInterestRate: number;
  accountCreationFee: string;
  maxBlockSize: number;
  vestingWithdrawPercent: number;
  rewardFundBalance: string;
  rewardFundRecentClaims: string;
  medianPrice: string;
}

export const EMPTY_CHAIN_STATS: ChainStats = {
  count_transactions: 0,
  count_operations: 0,
  count_virtual_operations: 0,
  count_accounts: 0,
  count_witnesses: 0,
  count_posts: 0,
  count_comments: 0,
  count_deleted_posts: 0,
  count_deleted_comments: 0,
};

export const DEFAULT_CHAIN_PARAMS: ChainParameters = {
  headBlock: 0,
  lastIrreversible: 0,
  accountCount: 0,
  hardfork: "—",
  nextHardfork: null,
  nextHardforkTime: null,
  blockInterval: 3,
  sbdPrintRate: 0,
  sbdInterestRate: 0,
  accountCreationFee: "—",
  maxBlockSize: 65536,
  vestingWithdrawPercent: 10000,
  rewardFundBalance: "—",
  rewardFundRecentClaims: "—",
  medianPrice: "—",
};

// ---------------------------------------------------------------------------
// Static-ish stats (long TTL)
// ---------------------------------------------------------------------------

export function getChainStats(): Promise<ChainStats> {
  return memo("chain-stats", 10 * 60_000, () =>
    sdsFetcher<ChainStats>("/chain_api/getChainStats"),
  );
}

export function getOperationStats(): Promise<OperationStat[]> {
  return memo("op-stats", 6 * 60 * 60_000, () =>
    sdsFetcher<OperationStat[]>("/chain_api/getOperationStats"),
  );
}

export function getTopTags(limit = 12): Promise<TagStat[]> {
  return memo(`top-tags-${limit}`, 60 * 60_000, () =>
    sdsFetcher<TagStat[]>(`/post_tags_api/getTopPostTags/${limit}`),
  );
}

export function getTopActiveTags(limit = 12): Promise<TagStat[]> {
  return memo(`top-active-tags-${limit}`, 15 * 60_000, () =>
    sdsFetcher<TagStat[]>(`/post_tags_api/getTopActivePostTags/${limit}`),
  );
}

export function getNewestAccounts(limit = 10): Promise<AccountRow[]> {
  return memo(`newest-accounts-${limit}`, 10 * 60_000, () =>
    sdsFetcher<AccountRow[]>(
      `/accounts_api/getAccountsSortedBy/created/DESC/steem/name,created,creator/${limit}/0`,
    ),
  );
}

export function getTopBalances(limit = 10): Promise<AccountRow[]> {
  return memo(`top-balances-${limit}`, 10 * 60_000, () =>
    sdsFetcher<AccountRow[]>(
      `/accounts_api/getAccountsSortedBy/balance_steem/DESC/steem/name,balance_steem,balance_sbd,vests_own/${limit}/0`,
    ),
  );
}

export function getTopWitnesses(limit = 15): Promise<WitnessRow[]> {
  return memo(`top-witnesses-${limit}`, 10 * 60_000, () =>
    sdsFetcher<WitnessRow[]>(`/witnesses_api/getWitnessesByRank/steem/${limit}/0`),
  );
}

export function getRecentlyMissedBlocks(limit = 8): Promise<MissedBlockRow[]> {
  return memo(`missed-${limit}`, 2 * 60_000, () =>
    sdsFetcher<MissedBlockRow[]>(`/witnesses_api/getRecentlyMissedBlocks/${limit}/0`),
  );
}

export function getTopCommunities(limit = 10): Promise<CommunityRow[]> {
  return memo(`top-communities-${limit}`, 30 * 60_000, () =>
    sdsFetcher<CommunityRow[]>(
      `/communities_api/getCommunitiesByCountActivePosts/steem/${limit}/0`,
    ),
  );
}

/** Last `days` daily average share-rate points (the feed is a full daily series). */
export function getShareRates(days = 90): Promise<ShareRatePoint[]> {
  return memo(`share-rates-${days}`, 6 * 60 * 60_000, async () => {
    const rows = await sdsFetcher<{ time: number; avg_rate: number }[]>(
      "/chain_api/getDailyAverageShareRates",
    );
    const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
    return rows
      .filter((r) => r.time >= cutoff)
      .map((r) => ({ t: r.time, rate: r.avg_rate }));
  });
}

// ---------------------------------------------------------------------------
// Network activity sampling (getBlockInfoByTime per bucket)
// ---------------------------------------------------------------------------

/**
 * Samples one block per time bucket to chart transactions/ops over a range.
 * 24h → every 30 min (48 pts), 7d → every 2h (84 pts), 30d → every 6h (120 pts).
 */
export function getActivitySeries(range: ExplorerRange): Promise<ActivitySample[]> {
  const step = range === "24h" ? 1800 : range === "7d" ? 7200 : 21600;
  const bucket = Math.floor(Date.now() / 600_000); // 10-minute memo window
  return memo(`activity-${range}-${bucket}`, 10 * 60_000, async () => {
    const now = Math.floor(Date.now() / 1000);
    const from = now - RANGE_SECONDS[range];
    const stamps: number[] = [];
    for (let t = from; t <= now; t += step) stamps.push(t);
    const samples = await pooled(stamps, 10, (t) =>
      sdsFetcher<{ time: number; block_num: number; trans_count: number; op_count: number; witness: string }>(
        `/chain_api/getBlockInfoByTime/${t}`,
      ),
    );
    return samples.map((s) => ({
      t: s.time,
      block: s.block_num,
      trx: s.trans_count,
      ops: s.op_count,
      witness: s.witness,
    }));
  });
}

// ---------------------------------------------------------------------------
// Author activity (paged active content feeds, filtered to the range)
// ---------------------------------------------------------------------------

const FEED_PAGE = 1000;
const MAX_POST_PAGES = 6;
const MAX_COMMENT_PAGES = 10;

interface FeedRow {
  author: string;
  permlink: string;
  created: number;
  payout: number | string;
}

function num(v: number | string | undefined): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

async function fetchFeedWindow(
  apiPath: "getActivePostsByCreated" | "getActiveCommentsByCreated",
  from: number,
  maxPages: number,
): Promise<FeedRow[]> {
  const collected: FeedRow[] = [];
  let oldest = Math.floor(Date.now() / 1000);
  for (let page = 0; page < maxPages; page++) {
    const rows = await sdsFetcher<FeedRow[]>(
      `/feeds_api/${apiPath}/steem/${FEED_PAGE}/${FEED_PAGE}/${page * FEED_PAGE}`,
    );
    if (!rows || rows.length === 0) break;
    collected.push(...rows);
    oldest = Math.min(oldest, ...rows.map((r) => num(r.created)));
    if (oldest < from) break;
  }
  return collected.filter((r) => num(r.created) >= from);
}

/**
 * Aggregates the newest posts + comments into per-bucket counts and a
 * top-author leaderboard for the given time window.
 */
export function getAuthorActivity(range: AuthorRange): Promise<AuthorActivity> {
  const bucketKey = Math.floor(Date.now() / 900_000); // 15-min memo window
  return memo(`author-activity-${range}-${bucketKey}`, 15 * 60_000, async () => {
    const to = Math.floor(Date.now() / 1000);
    const from = to - AUTHOR_RANGE_SECONDS[range];

    const [posts, comments] = await Promise.all([
      fetchFeedWindow("getActivePostsByCreated", from, MAX_POST_PAGES),
      fetchFeedWindow("getActiveCommentsByCreated", from, MAX_COMMENT_PAGES),
    ]);

    // 12 evenly sized time buckets across the window.
    const bucketCount = 12;
    const span = (to - from) / bucketCount;
    const buckets: AuthorBucket[] = Array.from({ length: bucketCount }, (_, i) => ({
      t: Math.round(from + i * span),
      posts: 0,
      comments: 0,
    }));

    const byAuthor = new Map<string, AuthorStatRow>();
    const bump = (row: FeedRow, kind: "posts" | "comments") => {
      const created = num(row.created);
      const idx = Math.min(bucketCount - 1, Math.max(0, Math.floor((created - from) / span)));
      buckets[idx][kind] += 1;
      let entry = byAuthor.get(row.author);
      if (!entry) {
        entry = { author: row.author, posts: 0, comments: 0, total: 0, payout: 0 };
        byAuthor.set(row.author, entry);
      }
      entry[kind] += 1;
      entry.total += 1;
      entry.payout += num(row.payout);
    };

    posts.forEach((r) => bump(r, "posts"));
    comments.forEach((r) => bump(r, "comments"));

    const topAuthors = [...byAuthor.values()]
      .sort((a, b) => b.total - a.total || b.payout - a.payout)
      .slice(0, 25);

    const all = [...posts, ...comments];
    const oldestCovered = all.length
      ? Math.min(...all.map((r) => num(r.created)))
      : to;

    return {
      range,
      from,
      to,
      buckets,
      topAuthors,
      totals: {
        posts: posts.length,
        comments: comments.length,
        uniqueAuthors: byAuthor.size,
        payout: all.reduce((sum, r) => sum + num(r.payout), 0),
        postsFetched: posts.length,
        commentsFetched: comments.length,
        oldestCovered,
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Chain parameters (dgp + config + hardfork + reward fund)
// ---------------------------------------------------------------------------

export function getChainParameters(): Promise<ChainParameters> {
  return memo("chain-params", 10 * 60_000, async () => {
    const [globals, rewardFund, medianPrice, config, hardfork, nextHardfork, chainProps, accountCount] =
      await Promise.all([
        condenserApi.getDynamicGlobalProperties(),
        condenserApi.getRewardFund(),
        condenserApi.getCurrentMedianHistoryPrice(),
        condenserApi.getConfig(),
        condenserApi.getHardforkVersion(),
        condenserApi.getNextScheduledHardfork(),
        condenserApi.getChainProperties(),
        condenserApi.getAccountCount(),
      ]);

    const cfg = (config ?? {}) as Record<string, unknown>;

    return {
      headBlock: globals.head_block_number,
      lastIrreversible: globals.last_irreversible_block_num,
      accountCount,
      hardfork: String(hardfork ?? "—"),
      nextHardfork: nextHardfork?.hf_version ?? null,
      nextHardforkTime: nextHardfork?.live_time ?? null,
      blockInterval: Number(cfg.STEEM_BLOCK_INTERVAL ?? 3),
      sbdPrintRate: globals.sbd_print_rate,
      sbdInterestRate: Number(chainProps?.sbd_interest_rate ?? 0),
      accountCreationFee: String(
        chainProps?.account_creation_fee ?? "3.000 STEEM",
      ),
      maxBlockSize: Number(globals.maximum_block_size ?? 65536),
      vestingWithdrawPercent: Number(cfg.STEEM_VESTING_WITHDRAW_PERCENTAGE ?? 10000),
      rewardFundBalance: String(rewardFund.reward_balance ?? "—"),
      rewardFundRecentClaims: String(rewardFund.recent_claims ?? "—"),
      medianPrice: `${medianPrice.base} / ${medianPrice.quote}`,
    } satisfies ChainParameters;
  });
}

// ---------------------------------------------------------------------------
// Market summary (internal market buckets → headline numbers)
// ---------------------------------------------------------------------------

export function getMarketSummary(
  hours = 24,
  bucketSeconds = 3600,
): Promise<MarketSummary> {
  return memo(`market-summary-${hours}-${bucketSeconds}`, 10 * 60_000, async () => {
    const history = await sdsApi.getMarketHistory(bucketSeconds, hours);
    return summarizeMarket(history, hours);
  });
}

// ---------------------------------------------------------------------------
// Account growth (paged newest-first until the window is fully covered)
// ---------------------------------------------------------------------------

export interface GrowthDay {
  /** UTC midnight of the day */
  t: number;
  count: number;
}

export interface GrowthStats {
  /** one bucket per UTC day, ascending, fully covering the window */
  perDay: GrowthDay[];
  /** exact rolling-window counts (only accurate if coverage is complete) */
  last24h: number;
  last7d: number;
  /** how far back the fetched account window actually reaches */
  coverageHours: number;
  /** true when we hit the page cap before covering the full window */
  partial: boolean;
}

const CREATED_PAGE = 1000;
const CREATED_MAX_PAGES = 5;

export function getAccountGrowth(days = 14): Promise<GrowthStats> {
  return memo(`account-growth-${days}`, 15 * 60_000, async () => {
    const now = Math.floor(Date.now() / 1000);
    const from = now - days * 86400;
    const created: number[] = [];
    let oldest = now;

    for (let page = 0; page < CREATED_MAX_PAGES; page++) {
      const rows = await sdsFetcher<{ name: string; created: number }[]>(
        `/accounts_api/getAccountsSortedBy/created/DESC/steem/name,created/${CREATED_PAGE}/${page * CREATED_PAGE}`,
      );
      if (!rows || rows.length === 0) break;
      created.push(...rows.map((r) => num(r.created)));
      oldest = Math.min(oldest, ...rows.map((r) => num(r.created)));
      if (oldest < from || rows.length < CREATED_PAGE) break;
    }

    const partial = oldest >= from;
    const coverageHours = Math.max(0, (now - oldest) / 3600);

    // One bucket per UTC day across the window (oldest day first).
    const firstDay = Math.floor((now - (days - 1) * 86400) / 86400) * 86400;
    const buckets = new Map<number, number>();
    for (let d = 0; d < days; d++) buckets.set(firstDay + d * 86400, 0);

    let last24h = 0;
    let last7d = 0;
    for (const c of created) {
      if (c < from) continue;
      const day = Math.floor(c / 86400) * 86400;
      if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
      if (c >= now - 86400) last24h += 1;
      if (c >= now - 604800) last7d += 1;
    }

    // If the window is partial, drop the earliest (partially covered) days so
    // the chart never shows under-counted days as if they were real.
    const perDay = [...buckets.entries()]
      .filter(([t]) => (partial ? t >= Math.floor(oldest / 86400) * 86400 : true))
      .map(([t, count]) => ({ t, count }));

    return {
      perDay,
      last24h,
      last7d,
      coverageHours: Math.round(coverageHours),
      partial,
    };
  });
}

// ---------------------------------------------------------------------------
// Extra leaderboards
// ---------------------------------------------------------------------------

export function getTopStakeholders(limit = 10): Promise<AccountRow[]> {
  return memo(`top-stakeholders-${limit}`, 10 * 60_000, () =>
    sdsFetcher<AccountRow[]>(
      `/accounts_api/getAccountsSortedBy/vests_own/DESC/steem/name,vests_own,balance_steem,balance_sbd/${limit}/0`,
    ),
  );
}

export function getMostFollowed(limit = 10): Promise<AccountRow[]> {
  return memo(`most-followed-${limit}`, 10 * 60_000, () =>
    sdsFetcher<AccountRow[]>(
      `/accounts_api/getAccountsSortedBy/count_followers/DESC/steem/name,count_followers,count_following/${limit}/0`,
    ),
  );
}

// ---------------------------------------------------------------------------
// Tab bundles — one composed Promise per explorer tab so /api/explorer can
// serve exactly the data that tab needs and nothing else.
// ---------------------------------------------------------------------------

export interface StatisticsResponse {
  ops: OperationStat[];
  shareRates: ShareRatePoint[];
  growth: GrowthStats;
}

export interface ContentResponse {
  top: TagStat[];
  active: TagStat[];
}

export interface LeaderboardsResponse {
  witnesses: WitnessRow[];
  missed: MissedBlockRow[];
  topBalances: AccountRow[];
  stakeholders: AccountRow[];
  followed: AccountRow[];
  newest: AccountRow[];
  communities: CommunityRow[];
}

export function getOverviewBundle(): Promise<{
  chainStats: ChainStats;
  market: MarketSummary;
}> {
  return Promise.all([getChainStats(), getMarketSummary(24, 3600)]).then(
    ([chainStats, market]) => ({ chainStats, market }),
  );
}

export function getStatisticsBundle(): Promise<StatisticsResponse> {
  return Promise.all([getOperationStats(), getShareRates(90), getAccountGrowth(14)]).then(
    ([ops, shareRates, growth]) => ({ ops, shareRates, growth }),
  );
}

export function getContentBundle(): Promise<ContentResponse> {
  return Promise.all([getTopTags(12), getTopActiveTags(12)]).then(
    ([top, active]) => ({ top, active }),
  );
}

export function getLeaderboardsBundle(): Promise<LeaderboardsResponse> {
  return Promise.all([
    getTopWitnesses(15),
    getRecentlyMissedBlocks(8),
    getTopBalances(10),
    getTopStakeholders(10),
    getMostFollowed(10),
    getNewestAccounts(10),
    getTopCommunities(10),
  ]).then(
    ([witnesses, missed, topBalances, stakeholders, followed, newest, communities]) => ({
      witnesses,
      missed,
      topBalances,
      stakeholders,
      followed,
      newest,
      communities,
    }),
  );
}

// ---------------------------------------------------------------------------
// Live snapshot + recent blocks — SSR seeds for the two live widgets
// (passed to the client components as SWR fallbackData so the initial HTML
// carries real KPI values and block links instead of loading skeletons).
// ---------------------------------------------------------------------------

function getDgp(): Promise<DynamicGlobalProperties> {
  return memo("explorer-dgp", 15_000, () =>
    condenserApi.getDynamicGlobalProperties(),
  );
}

export interface LiveSnapshot {
  globals: DynamicGlobalProperties;
  rewardFund: RewardFund;
  medianPrice: MedianPrice;
}

export interface RecentBlock {
  num: number;
  timestamp: string;
  witness: string;
  txCount: number;
}

export function getLiveSnapshot(): Promise<LiveSnapshot> {
  return memo("explorer-live-snapshot", 15_000, async () => {
    const [globals, rewardFund, medianPrice] = await Promise.all([
      getDgp(),
      condenserApi.getRewardFund(),
      condenserApi.getCurrentMedianHistoryPrice(),
    ]);
    return { globals, rewardFund, medianPrice };
  });
}

export function getRecentBlocks(count = 10): Promise<RecentBlock[]> {
  return memo(`explorer-recent-blocks-${count}`, 15_000, async () => {
    const g = await getDgp();
    const nums = Array.from({ length: count }, (_, i) => g.head_block_number - i);
    const blocks = await Promise.all(nums.map((num) => condenserApi.getBlock(num)));
    return blocks.map((b, i) => ({
      num: nums[i],
      timestamp: b.timestamp,
      witness: b.witness,
      txCount: b.transactions?.length || 0,
    }));
  });
}
