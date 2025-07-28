import React, { useCallback, useEffect, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { Fetcher } from "swr";
import CommentSkeleton from "./comment/components/CommentSkeleton";
import { Spinner } from "@heroui/spinner";
import EmptyList from "./EmptyList";
import { AsyncUtils } from "@/utils/async.utils";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { useAppSelector } from "@/constants/AppFunctions";
import { getSettings } from "@/utils/user";
import { twMerge } from "tailwind-merge";
import { FeedPerPage } from "@/constants/AppConstants";

type InfiniteScrollProps<T> = {
  getKey: (pageIndex: number, previousPageData: T[] | null) => string | null;
  fetcher: Fetcher<T[]>;
  renderItem: (item: T, index: number) => React.ReactNode;
  threshold?: number;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
  loader?: React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  initialSize?: number;
  pageSize?: number;
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
  errorComponent = <EmptyList text="Error loading data" />,
  className = "",
  loader = (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <Spinner variant="gradient" size="md" />
    </div>
  ),
  keyExtractor = (_, index) => index.toString(),
  initialSize = 1,
  pageSize = FeedPerPage,
}: InfiniteScrollProps<T>) => {
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
  });

  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const { isMobile } = useDeviceInfo();
  const isGridStyle = settings.feedStyle === "grid" && !isMobile;

  const items = pages?.flat() || [];
  const isLoadingMore =
    isLoading || (size > 0 && pages && typeof pages[size - 1] === "undefined");
  const isEmpty = items.length === 0;
  const isReachingEnd =
    isEmpty || (pages && pages[pages.length - 1]?.length < pageSize);

  // Track whether we're currently loading to prevent duplicate triggers
  const [isFetching, setIsFetching] = useState(false);

  // Load more items when reaching bottom
  const loadMore = useCallback(async () => {
    if (isFetching || isLoadingMore || isReachingEnd) return;
    setIsFetching(true);
    try {
      AsyncUtils.sleep(1.5);
      await setSize(size + 1);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, isLoadingMore, isReachingEnd, setSize, size]);

  // Handle scroll events on document body
  useEffect(() => {
    const handleScroll = () => {
      if (isFetching || isLoadingMore || isReachingEnd) return;

      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const isNearBottom = scrollPosition >= scrollHeight - threshold;

      if (isNearBottom) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
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
            : "flex flex-col gap-2"
        )}
      >
        {items.map((item, index) => (
          <React.Fragment key={keyExtractor(item, index)}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
      </div>

      {(isLoadingMore || isValidating) && loader}

      {isReachingEnd && !isEmpty && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          <EmptyList text="No more results" />
        </div>
      )}

      {isEmpty && !isLoading && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          <EmptyList />
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
