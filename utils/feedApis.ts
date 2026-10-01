/**
 * Feed endpoint names for the listing pages.
 *
 * Kept out of the `"use client"` tab components so the server pages can build
 * the same API path (for preloading the first page) without importing a client
 * module — calling into a `"use client"` module from a server component throws.
 */

/** Maps a home category (`/`, `/hot`, `/created`, …) to its feed endpoint. */
export const HOME_FEED_APIS: Record<string, string> = {
  trending: "getActivePostsByTrending",
  popular: "getActivePostsByInteraction",
  created: "getActivePostsByCreated",
  hot: "getActivePostsByHot",
  payout: "getActivePostsByPayout",
};

export const FALLBACK_HOME_FEED_API = HOME_FEED_APIS.trending;

/** Maps a tag page tab (`/trending/bitcoin`, …) to its feed endpoint prefix. */
export const TAG_FEED_APIS: Record<string, string> = {
  trending: "getActivePostsByTagTrending",
  popular: "getActivePostsByTagInteraction",
  created: "getActivePostsByTagCreated",
  hot: "getActivePostsByTagHot",
  payout: "getActivePostsByTagPayout",
};

export const FALLBACK_TAG_FEED_API = TAG_FEED_APIS.trending;

export function tagFeedApi(category: string, tag: string): string {
  return `${TAG_FEED_APIS[category] ?? FALLBACK_TAG_FEED_API}/${tag}`;
}

/**
 * Community tabs. `log` is deliberately absent — it renders an activity feed
 * component rather than a `FeedList`, so there is no API path to preload.
 */
export const COMMUNITY_FEED_APIS: Record<string, string> = {
  trending: "getActiveCommunityPostsByTrending",
  popular: "getActiveCommunityPostsByInteraction",
  created: "getCommunityPostsByCreated",
};

export function communityFeedApi(tab: string, account: string): string {
  return `${COMMUNITY_FEED_APIS[tab] ?? COMMUNITY_FEED_APIS.trending}/${account}`;
}
