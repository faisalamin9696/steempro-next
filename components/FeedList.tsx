import { sdsApi } from "@/libs/sds";
import { useEffect, useState, useCallback, useRef } from "react";
import PostCard from "./post/PostCard";
import useFeedLayout from "@/hooks/useFeedLayout";
import InfiniteList from "./InfiniteList";

// Global cache for feed data
const feedCache = new Map<
  string,
  {
    feed: Feed[];
    offset: number;
    hasMore: boolean;
    seenIds: Set<string>;
  }
>();

export function FeedList({
  apiPath,
  observer = "steem",
}: {
  apiPath: string;
  observer?: string | null;
}) {
  const { layout, className } = useFeedLayout();
  const cacheKey = `${apiPath}:${observer}`;
  const cachedData = feedCache.get(cacheKey);

  const [feed, setFeed] = useState<Feed[]>(cachedData?.feed || []);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(cachedData?.offset || 0);
  const [hasMore, setHasMore] = useState(cachedData?.hasMore ?? true);

  const LIMIT = 16;
  const feedRef = useRef(feed);
  const offsetRef = useRef(offset);
  const isFetching = useRef(false);

  useEffect(() => {
    feedRef.current = feed;
    offsetRef.current = offset;
  }, [feed, offset]);

  const loadFeed = useCallback(
    async (isMore = false) => {
      if (isMore ? loadingMore : isFetching.current) return;

      const currentOffset = isMore ? offsetRef.current : 0;
      if (isMore) setLoadingMore(true);
      else {
        setLoading(true);
        isFetching.current = true;
      }

      try {
        const result = await sdsApi.getFeedByApiPath(
          apiPath,
          observer,
          LIMIT,
          currentOffset
        );
        const cached = feedCache.get(cacheKey);
        const seenIds = isMore && cached ? cached.seenIds : new Set<string>();

        const uniqueItems = result.filter((item) => {
          const id = item.link_id.toString();
          if (seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        });

        const updatedFeed = isMore
          ? [...feedRef.current, ...uniqueItems]
          : uniqueItems;
        const newOffset = currentOffset + result.length;
        const hasMoreData = result.length === LIMIT;

        feedCache.set(cacheKey, {
          feed: updatedFeed,
          offset: newOffset,
          hasMore: hasMoreData,
          seenIds,
        });

        setFeed(updatedFeed);
        setOffset(newOffset);
        setHasMore(hasMoreData);
      } catch (e) {
        console.error("Failed to load feed", e);
        setHasMore(false);
      } finally {
        if (isMore) setLoadingMore(false);
        else {
          setLoading(false);
          isFetching.current = false;
        }
      }
    },
    [apiPath, observer, loadingMore, cacheKey]
  );

  useEffect(() => {
    if (!feedCache.has(cacheKey)) {
      loadFeed(false);
    }
  }, [cacheKey, loadFeed]);

  return (
    <InfiniteList
      data={feed}
      renderItem={(item, index) => (
        <PostCard
          comment={item}
          key={`${item.link_id}-${index}`}
          layout={layout}
        />
      )}
      hasMore={hasMore}
      isLoading={loading}
      onLoadMore={() => loadFeed(true)}
      isLoadingMore={loadingMore}
      className={className}
      noDataMessage={
        feed.length === 0 && !loading ? "No posts found in this feed" : ""
      }
    />
  );
}
