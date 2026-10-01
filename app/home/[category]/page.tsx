import { sdsApi } from "@/libs/sds";
import { FALLBACK_HOME_FEED_API, HOME_FEED_APIS } from "@/utils/feedApis";
import { HomeTabs } from "./HomeTabs";

/**
 * Server component: fetches the first page of the requested feed so the HTML
 * we serve to crawlers already contains real post cards and their links.
 * Everything interactive stays in `HomeTabs`.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ category?: string }>;
}) {
  const { category } = await params;
  const activeCategory = (category || "trending").toLowerCase();
  const apiPath = HOME_FEED_APIS[activeCategory] ?? FALLBACK_HOME_FEED_API;

  let initialFeed: Feed[] = [];
  try {
    const posts = await sdsApi.getFeedByApiPath(apiPath, "steem", 16, 0);
    initialFeed = Array.isArray(posts) ? posts : [];
  } catch (error) {
    console.error("[home] initial feed fetch failed", error);
  }

  return (
    <HomeTabs
      category={activeCategory}
      initialApiPath={apiPath}
      initialFeed={initialFeed}
    />
  );
}
