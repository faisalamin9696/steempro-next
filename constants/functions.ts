import { Constants } from "@/constants";

// SDS endpoints with automatic failover (sds0 → sds1 → sds)
const SDS_ENDPOINTS = Constants.sds_endpoints;

/**
 * Staleness budgets for SDS reads, matched against the request path.
 *
 * Every endpoint here returns public chain data, but not equally perishable:
 * a published post changes only when it is edited, while a balance, an order
 * book or a notification list changes the instant it is touched. Anything not
 * listed stays uncached — the safe default, because a missed rule costs
 * performance while a wrong one costs correctness.
 *
 * Why this matters: Next's `fetch` is uncached by default since v15, so every
 * dynamic route was re-fetching SDS on every render. Passing `revalidate`
 * opts back into the Data Cache, which is shared across requests — the route
 * still renders dynamically, it just stops paying for the same read twice.
 */
const SDS_CACHE: { pattern: RegExp; revalidate: number }[] = [
  // Listings and search: new items appear, so keep the window short.
  { pattern: /\/feeds_api\//, revalidate: 60 },
  { pattern: /\/content_search_api\//, revalidate: 60 },
  // Reference content: changes only on edit or administration.
  { pattern: /\/posts_api\/getPost(WithReplies)?\//, revalidate: 600 },
  { pattern: /\/communities_api\//, revalidate: 600 },
  { pattern: /\/witnesses_api\//, revalidate: 600 },
  // Deliberately absent: accounts_api (balances), notifications_api,
  // account_history_api (fresh transactions), posts_api/getVotes (live vote
  // counts), followers/delegations/content_history — all must be current.
];

/**
 * The cache option for one path, or `{}` when nothing matches. Applied
 * before `...opts` so a caller can still override it explicitly.
 */
function cacheOption(api: string): RequestInit {
  const rule = SDS_CACHE.find((r) => r.pattern.test(api));
  return rule ? ({ next: { revalidate: rule.revalidate } } as RequestInit) : {};
}

export const sdsFetcher = async <T>(
  api: string,
  opts?: RequestInit,
  retries: number = 2,
  delayMs: number = 500,
): Promise<T> => {
  if (!api) throw new Error(`Invalid HTTP request`);

  let lastError: Error | null = null;

  for (const baseUrl of SDS_ENDPOINTS) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(baseUrl + api, {
          ...cacheOption(api),
          ...opts,
        });

        if (!res.ok) {
          if (res.status >= 500 || res.status === 429) {
            lastError = new Error(`HTTP ${res.status}`);
            if (attempt < retries) {
              await new Promise((r) => setTimeout(r, delayMs * attempt));
              continue;
            }
            break; // move to next endpoint
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.code !== 0) throw new Error(data.error || "SDS error");
        return mapSds(data) as T;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs * attempt));
        }
      }
    }
  }

  throw lastError ?? new Error("SDS request failed after all retries");
};

export const mapSds = (data: any): any => {
  const { cols, rows } = data.result ?? data ?? {};
  return cols
    ? (rows?.map((r: any) =>
        Object.fromEntries(
          Object.keys(cols).map((k, i) => [k, Object.values(r)[i]]),
        ),
      ) ?? [])
    : (data.result ?? data);
};
