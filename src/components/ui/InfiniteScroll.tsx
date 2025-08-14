import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import useSWRInfinite from "swr/infinite";
import { Fetcher } from "swr";
import CommentSkeleton from "../comment/components/CommentSkeleton";
import { Spinner } from "@heroui/spinner";
import EmptyList from "../EmptyList";
import { AsyncUtils } from "@/utils/async.utils";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { useAppSelector } from "@/constants/AppFunctions";
import { getSettings } from "@/utils/user";
import { twMerge } from "tailwind-merge";
import { FeedPerPage } from "@/constants/AppConstants";
import { useTranslation } from "@/utils/i18n";

type InfiniteScrollProps<T> = {
  getKey: (pageIndex: number, previousPageData: T[] | null) => string | null;
  fetcher: Fetcher<T[]>;
  renderItem: (item: T, index: number) => React.ReactNode;
  threshold?: number;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
  itemsClassName?: string;
  loader?: React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  initialSize?: number;
  pageSize?: number;
  totalItems?: number; // New prop for total items in dataset
  autoLoadThreshold?: number; // Items remaining before triggering auto-load
  filterItems?: ((item: T) => boolean) | Array<(item: T) => boolean>;
  loadedData?: (items: T[]) => void;
  revalidateIfStale?: boolean;
    cacheKey?: string;

};

const InfiniteScroll = <T,>({
  getKey,
  fetcher,
  renderItem,
  threshold = 200,
  loadingComponent = (
    <div className="flex flex-col space-y-2">
      <CommentSkeleton />
      <CommentSkeleton />
    </div>
  ),
  errorComponent,
  className = "",
  itemsClassName = "",
  loader = (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <Spinner variant="gradient" size="md" />
    </div>
  ),
  keyExtractor = (_, index) => index.toString(),
  initialSize = 1,
  pageSize = FeedPerPage,
  totalItems, // Optional total items count
  autoLoadThreshold = 5, // Load more when 5 items away from end
  filterItems, // Array of filter functions
  loadedData,
  revalidateIfStale,
  
}: InfiniteScrollProps<T>) => {
  const { t } = useTranslation();
  
  // Set default error component with translation
  errorComponent = errorComponent || <EmptyList text={t('feed.error_loading')} />;
  
  const {
    data: pages,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
  } = useSWRInfinite<T[]>(getKey, fetcher, {
    initialSize,
    revalidateFirstPage: false,
    revalidateIfStale: revalidateIfStale, // Optional: revalidate if data is stale
  });

  useEffect(() => {
    loadedData?.(pages?.flat() || []);
  }, [pages]);

  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const { isMobile } = useDeviceInfo();
  const isGridStyle = settings.feedStyle === "grid" && !isMobile;
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const rawItems = pages?.flat() || [];
  const items = filterItems
    ? Array.isArray(filterItems)
      ? rawItems.filter((item) => filterItems.every((filter) => filter(item)))
      : rawItems.filter(filterItems)
    : rawItems;

  const isLoadingMore =
    isLoading || (size > 0 && pages && typeof pages[size - 1] === "undefined");
  const isEmpty = items.length === 0;
  const isReachingEnd =
    isEmpty || (pages && pages[pages.length - 1]?.length < pageSize);

  // Calculate remaining items for auto-load simulation
  const remainingItems = totalItems ? totalItems - items.length : 0;

  // Enhanced load more function
  const loadMore = useCallback(async () => {
    if (isFetching || isLoadingMore || isReachingEnd) return;

    setIsFetching(true);
    try {
      await AsyncUtils.sleep(2); // Optional delay for smoother UX
      await setSize(size + 1);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, isLoadingMore, isReachingEnd, setSize, size]);

  // Auto-load when approaching end of list (simulated pagination)
  useEffect(() => {
    if (totalItems && items.length > 0 && remainingItems <= autoLoadThreshold) {
      loadMore();
    }
  }, [items.length, remainingItems, autoLoadThreshold, loadMore, totalItems]);

  // Intersection Observer for scroll-based loading (original functionality)
  useEffect(() => {
    if (!sentinelRef.current) return;

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        !isFetching &&
        !isLoadingMore &&
        !isReachingEnd
      ) {
        loadMore();
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, isLoadingMore, isReachingEnd, loadMore, isFetching]);

  if (isLoading && isEmpty) {
    return <div className={className}>{loadingComponent}</div>;
  }

  if (error) {
    return <div className={className}>{errorComponent}</div>;
  }

  return (
    <div className={className}>
      <div
        className={twMerge(
          isGridStyle
            ? className
              ? className
              : "grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4"
            : "flex flex-col gap-2",
          itemsClassName
        )}
      >
        {items.map((item, index) => (
          <React.Fragment key={keyExtractor(item, index)}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
      </div>

      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

      {(isFetching || isLoadingMore || isValidating) && loader}

      {isReachingEnd && !isEmpty && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          <EmptyList text={t('feed.no_more_results')} />
        </div>
      )}

      {isEmpty && !isLoading && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          <EmptyList text={t('feed.empty')} />
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
