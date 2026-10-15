import { sdsApi } from "@/libs/sds";
import { tagFeedApi } from "@/utils/feedApis";
import { CategoryTabs } from "./CategoryTabs";

/**
 * Server component: preloads the requested tab's feed so crawlers receive an
 * HTML document with real post cards, titles and links rather than a spinner.
 */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await params;
  const activeCategory = (category || "trending").toLowerCase();
  const activeTag = (tag || "").toLowerCase();

  const apiPath = activeTag ? tagFeedApi(activeCategory, activeTag) : "";

  let initialFeed: Feed[] = [];
  if (apiPath) {
    try {
      const posts = await sdsApi.getFeedByApiPath(apiPath, "steem", 16, 0);
      initialFeed = Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error("[category] initial feed fetch failed", error);
    }
  }

  return (
    <CategoryTabs
      category={activeCategory}
      tag={activeTag}
      initialApiPath={apiPath}
      initialFeed={initialFeed}
    />
  );
}
