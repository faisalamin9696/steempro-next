import { Constants } from "@/constants";

// SDS endpoints with automatic failover (sds0 → sds1 → sds)
const SDS_ENDPOINTS = Constants.sds_endpoints;

/** One attempt may not outlive this, or a hung endpoint stalls a whole render. */
const REQUEST_TIMEOUT_MS = 8_000;

/** After this many transport failures an endpoint is rested for the cooldown. */
const BREAKER_THRESHOLD = 3;
const BREAKER_COOLDOWN_MS = 30_000;

/** A name that does not exist is not going to exist 30 s later either. */
const NOT_FOUND_TTL_MS = 5 * 60_000;
const NOT_FOUND_MAX_ENTRIES = 5_000;

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
  // Public account reads only — the path pins `observer` to `steem`, so the
  // response is the same for every visitor and safe to share for a minute.
  // Observer-relative paths (any other observer, plus the entries below the
  // comment) stay uncached: the same account genuinely looks different to
  // every logged-in viewer.
  {
    pattern: /^\/accounts_api\/(getAccountExt|getAccountsExt)\/[^/]+\/steem(\/|$)/,
    revalidate: 60,
  },
  // Deliberately absent: notifications_api, account_history_api (fresh
  // transactions), posts_api/getVotes (live vote counts), followers and
  // delegations — all must be current.
];

export type SdsErrorKind =
  | "invalid"
  | "not_found"
  | "rate_limited"
  | "unavailable"
  | "network";

/**
 * A classified SDS failure.
 *
 * The distinction that matters is `retryable`: a 502 or a socket reset is worth
 * another attempt, but `code: -1` from a malformed or missing parameter is the
 * upstream's final answer. Retrying those is what turned one bad URL into six
 * upstream requests.
 */
export class SdsError extends Error {
  readonly kind: SdsErrorKind;
  readonly status?: number;
  readonly code?: number;
  readonly endpoint?: string;

  constructor(
    message: string,
    kind: SdsErrorKind,
    detail: { status?: number; code?: number; endpoint?: string } = {},
  ) {
    super(message);
    this.name = "SdsError";
    this.kind = kind;
    this.status = detail.status;
    this.code = detail.code;
    this.endpoint = detail.endpoint;
  }

  /** Only transport-shaped failures are worth repeating. */
  get retryable(): boolean {
    return (
      this.kind === "network" ||
      this.kind === "rate_limited" ||
      this.kind === "unavailable"
    );
  }
}

/** Thrown before any network call when a caller passes an impossible value. */
export const invalidParam = (what: string, value: unknown): SdsError =>
  new SdsError(`Invalid ${what}: ${JSON.stringify(value)}`, "invalid");

const breaker = new Map<string, { failures: number; until: number }>();
const notFoundCache = new Map<string, number>();

function isKnownMissing(api: string): boolean {
  const until = notFoundCache.get(api);
  if (until === undefined) return false;
  if (until > Date.now()) return true;
  notFoundCache.delete(api);
  return false;
}

function rememberMissing(api: string): void {
  if (notFoundCache.size >= NOT_FOUND_MAX_ENTRIES) notFoundCache.clear();
  notFoundCache.set(api, Date.now() + NOT_FOUND_TTL_MS);
}

/** Endpoints in preference order, minus the ones currently resting. */
function liveEndpoints(): string[] {
  const now = Date.now();
  const live = SDS_ENDPOINTS.filter((e) => (breaker.get(e)?.until ?? 0) <= now);
  // Everything is tripped: forget the history rather than fail without trying.
  if (live.length === 0) {
    breaker.clear();
    return [...SDS_ENDPOINTS];
  }
  return live;
}

function noteFailure(endpoint: string): void {
  const state = breaker.get(endpoint) ?? { failures: 0, until: 0 };
  state.failures += 1;
  if (state.failures >= BREAKER_THRESHOLD) {
    state.until = Date.now() + BREAKER_COOLDOWN_MS;
    state.failures = 0;
  }
  breaker.set(endpoint, state);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The cache option for one path, or `{}` when nothing matches. Applied
 * before `...opts` so a caller can still override it explicitly.
 */
function cacheOption(api: string): RequestInit {
  const rule = SDS_CACHE.find((r) => r.pattern.test(api));
  return rule ? ({ next: { revalidate: rule.revalidate } } as RequestInit) : {};
}

/** Map an SDS `code !== 0` body onto the failure it actually represents. */
function classFromBody(
  data: { error?: unknown; code?: unknown } | null | undefined,
  endpoint: string,
): SdsError {
  const message = String(data?.error ?? "SDS error");
  const kind: SdsErrorKind = /could not be found|does not exist|not found/i.test(
    message,
  )
    ? "not_found"
    : "invalid";
  const code = typeof data?.code === "number" ? data.code : undefined;
  return new SdsError(message, kind, { endpoint, code });
}

async function requestOnce<T>(
  baseUrl: string,
  api: string,
  opts?: RequestInit,
): Promise<T> {
  const res = await fetch(baseUrl + api, {
    ...cacheOption(api),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    ...opts,
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new SdsError("HTTP 429", "rate_limited", {
        status: res.status,
        endpoint: baseUrl,
      });
    }
    if (res.status >= 500 || res.status === 408) {
      throw new SdsError(`HTTP ${res.status}`, "unavailable", {
        status: res.status,
        endpoint: baseUrl,
      });
    }
    // 4xx is deterministic: the request itself is wrong, another endpoint
    // would answer the same way.
    throw new SdsError(`HTTP ${res.status}`, "invalid", {
      status: res.status,
      endpoint: baseUrl,
    });
  }

  const data = await res.json();
  if (data.code !== 0) throw classFromBody(data, baseUrl);
  return mapSds(data) as T;
}

/**
 * Read one SDS path.
 *
 * Failover is only for endpoints that failed *in transit*. A malformed or
 * missing parameter throws immediately, and the answer is remembered for a few
 * minutes so a crawler walking a wordlist costs one upstream request per name
 * instead of one per hit.
 */
export const sdsFetcher = async <T>(
  api: string,
  opts?: RequestInit,
  retries: number = 2,
  delayMs: number = 400,
): Promise<T> => {
  if (!api) throw invalidParam("api", api);
  if (isKnownMissing(api)) {
    throw new SdsError(`Known missing: ${api}`, "not_found");
  }

  let lastError: SdsError | null = null;

  for (const baseUrl of liveEndpoints()) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await requestOnce<T>(baseUrl, api, opts);
        breaker.delete(baseUrl);
        return result;
      } catch (error) {
        const failure =
          error instanceof SdsError
            ? error
            : new SdsError(
                (error as Error)?.message ?? "network error",
                "network",
                { endpoint: baseUrl },
              );

        if (!failure.retryable) {
          if (failure.kind === "not_found") rememberMissing(api);
          throw failure;
        }

        noteFailure(baseUrl);
        lastError = failure;
        if (attempt < retries) await sleep(delayMs * attempt);
      }
    }
  }

  throw lastError ?? new SdsError("SDS request failed", "unavailable");
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
