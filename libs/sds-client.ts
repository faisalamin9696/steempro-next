import { Constants } from "@/constants";
import { SDS, mapSds, type FetchLike } from "@steempro/sds-api";

/**
 * How long SDS responses backing the sitemaps stay in Next's Data Cache.
 * Sitemaps describe a chain that moves slowly, so an hour of staleness is
 * invisible to SEO but turns every repeat render into a cache hit.
 */
const SITEMAP_REVALIDATE_SECONDS = 3600;

/**
 * Steem Blockchain Data Services client, backed by `@steempro/sds-api`.
 *
 * The library talks to one instance per client, but SteemPro has always kept
 * three mirrors available (sds0 → sds1 → sds, see `Constants.sds_endpoints`).
 * A custom `fetch` restores that rotation: mirrors are tried in order and a
 * failure only moves on to the next one. Network errors, 5xx and 429 are
 * retryable; any other status (404/400/…) is a real answer, so it is handed
 * straight back to the library, which raises the matching `SDSHttpError`.
 *
 * The library's own `retries` option then re-runs this whole rotation, which
 * is how the previous hand-rolled `sdsFetcher` behaved (retries × endpoints).
 */
const failoverFetch: FetchLike = async (input, init) => {
  const { pathname, search } = new URL(input);

  let lastError: unknown;
  let lastResponse: Response | undefined;

  for (const host of Constants.sds_endpoints) {
    try {
      const response = await globalThis.fetch(
        `${host}${pathname}${search}`,
        init,
      );

      if (response.ok || (response.status < 500 && response.status !== 429)) {
        return response;
      }

      lastResponse = response;
    } catch (error) {
      lastError = error;
    }
  }

  // Every mirror answered with a server error. Return the last response so the
  // library reports a real SDSHttpError (status + body) instead of a generic
  // network failure that hides what actually went wrong.
  if (lastResponse) return lastResponse;

  throw lastError ?? new Error("SDS request failed on every instance");
};

export const sds = new SDS({
  fetch: failoverFetch,
  timeout: 30_000,
  retries: 2,
  retryDelay: 500,
});

/**
 * Derived client for the handful of endpoints the whole site hammers — global
 * chain props are read by `AppLayout` on every navigation, so the response is
 * pinned in Next's Data Cache.
 *
 * `SDSCallOptions` only forwards timeout/retries/headers/signal/validate, so
 * `RequestInit.next` has to be injected inside the fetch implementation.
 */
const cachedFetch: FetchLike = (input, init) =>
  failoverFetch(input, {
    ...init,
    next: { revalidate: 60 },
  } as RequestInit);

export const sdsCached = sds.withOptions({ fetch: cachedFetch });

/**
 * Client for sitemap generation.
 *
 * A sitemap is assembled *inside the crawler's own request* — Googlebot asks,
 * and the server has to go to the blockchain and come back before the crawler
 * gives up. That makes a cold instance expensive at exactly the wrong moment:
 * `tags.xml` and `profiles.xml` each need twenty post pages plus a
 * page-count probe, which is what made them the slowest files on the site and
 * the ones GSC reported as "Sitemap could not be read".
 *
 * Pinning the responses in Next's Data Cache is the layer that survives
 * serverless, where an in-process `Map` is cleared between invocations and a
 * `"use cache"` entry may not be reused at all. An hour is plenty — a sitemap
 * that lags the chain costs nothing, a five-second render costs the crawl.
 */
const sitemapFetch: FetchLike = (input, init) =>
  failoverFetch(input, {
    ...init,
    next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
  } as RequestInit);

export const sdsSitemap = sds.withOptions({ fetch: sitemapFetch });

/**
 * Feed tabs are stored as *data-driven* SDS path fragments in `constants`
 * (`HOME_FEED_APIS`, `COMMUNITY_FEED_APIS`, `tagFeedApi(…)`, `tab.api`) and
 * are passed around as props, so they cannot be routed through a generated
 * method. This only assembles the documented
 * `/feeds_api/:path/:observer/:bodyLength/:limit/:offset` shape and hands it to
 * `sds.request` — failover, `{ code, result }` unwrapping and structured
 * errors still apply, and no fetch logic of our own is involved.
 *
 * `client` defaults to the plain, uncached `sds` because every live feed on
 * the site wants fresh data. Sitemap generation passes `sdsSitemap` instead:
 * it runs inside the crawler's own request, so it needs the responses pinned
 * in the Data Cache rather than re-fetched every time.
 */
export const getFeedByApiPath = async (
  apiPath: string,
  observer: string | null = "steem",
  limit: number = 50,
  offset: number = 0,
  length: number = 500,
  client: SDS = sds,
) =>
  mapSds<Feed[]>(
    await client.request(
      `/feeds_api/${apiPath}/${observer}/${length}/${limit}/${offset}`,
    ),
  );
