"use client";

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
  initialData,
}: {
  apiPath: string;
  observer?: string | null;
  /**
   * First page fetched on the server. The SSR HTML therefore contains real
   * post cards (and their links) instead of a spinner, and hydration starts
   * from the same list instead of immediately refetching page one.
   */
  initialData?: Feed[];
}) {
  const { layout, className } = useFeedLayout();
  const cacheKey = `${apiPath}:${observer}`;
  const cachedData = feedCache.get(cacheKey);
  const hasSeed = !!initialData && initialData.length > 0;

  const [feed, setFeed] = useState<Feed[]>(() =>
    cachedData?.feed?.length ? cachedData.feed : initialData ?? [],
  );
  const [loading, setLoading] = useState(
    () => !(cachedData || (initialData && initialData.length > 0)),
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(
    () => cachedData?.offset || initialData?.length || 0,
  );
  const [hasMore, setHasMore] = useState(() => cachedData?.hasMore ?? true);

  const LIMIT = 16;
  const feedRef = useRef(feed);
  const offsetRef = useRef(offset);
  const isFetching = useRef(false);
  // Which cache key (if any) still needs publishing on the first effect pass.
  const seedCacheKeyRef = useRef<string | null>(hasSeed ? cacheKey : null);

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
    // The server-rendered list is already on screen — cache it once so tab
    // switches and back-navigation reuse it instead of refetching page one.
    if (seedCacheKeyRef.current === cacheKey && initialData) {
      seedCacheKeyRef.current = null;
      if (!feedCache.has(cacheKey)) {
        feedCache.set(cacheKey, {
          feed: initialData,
          offset: initialData.length,
          hasMore: true,
          seenIds: new Set(initialData.map((item) => item.link_id.toString())),
        });
      }
      setLoading(false);
      return;
    }

    const cached = feedCache.get(cacheKey);
    if (!cached) {
      setFeed([]);
      setOffset(0);
      setHasMore(true);
      setLoading(true);
      loadFeed(false);
    } else {
      setFeed(cached.feed);
      setOffset(cached.offset);
      setHasMore(cached.hasMore);
      setLoading(false);
    }
  }, [cacheKey, loadFeed, initialData]);

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
