import useInfiniteScroll from "react-infinite-scroll-hook";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import EmptyList from "./EmptyList";
import CommentSkeleton from "./skeleton/CommentSkeleton";

type InfiniteListProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  Skeleton?: React.ComponentType;
  noDataMessage?: string;
  className?: string;
  searchTerm?: string;
  filterFn?: (item: T, term: string) => boolean;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
} & (
  | { enableClientPagination: true; clientItemsPerPage: number }
  | {
      enableClientPagination?: false;
      clientItemsPerPage?: number;
      hasMore: boolean;
      isLoading: boolean;
    }
);

function InfiniteList<T>({
  data,
  renderItem,
  Skeleton = CommentSkeleton,
  noDataMessage,
  className = "flex flex-col gap-4",
  hasMore = false,
  isLoading = false,
  onLoadMore,
  isLoadingMore = false,
  enableClientPagination = false,
  clientItemsPerPage = 20,
  searchTerm,
  filterFn,
}: InfiniteListProps<T>) {
  const [clientPage, setClientPage] = useState(1);
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  // Sync internal loading and reset pagination when data changes
  useEffect(() => {
    if (data.length > 0) setIsInternalLoading(false);
    if (!enableClientPagination) setClientPage(1);
  }, [data, enableClientPagination]);

  const { visibleItems, hasMoreClient } = useMemo(() => {
    if (!enableClientPagination)
      return { visibleItems: data, hasMoreClient: false };

    const filtered =
      searchTerm && filterFn
        ? data.filter((item) => filterFn(item, searchTerm))
        : data;
    const end = clientPage * clientItemsPerPage;
    return {
      visibleItems: filtered.slice(0, end),
      hasMoreClient: end < filtered.length,
    };
  }, [
    data,
    enableClientPagination,
    clientPage,
    clientItemsPerPage,
    searchTerm,
    filterFn,
  ]);

  const canLoadMore = enableClientPagination
    ? hasMoreClient || hasMore
    : hasMore;
  const isFetching = isLoadingMore || isInternalLoading;

  const handleLoadMore = useCallback(() => {
    if (!canLoadMore || isFetching) return;

    if (enableClientPagination && hasMoreClient) {
      setClientPage((p) => p + 1);
    } else if (hasMore && onLoadMore) {
      setIsInternalLoading(true);
      onLoadMore();
    }
  }, [
    canLoadMore,
    isFetching,
    enableClientPagination,
    hasMoreClient,
    hasMore,
    onLoadMore,
  ]);

  const [infiniteRef] = useInfiniteScroll({
    loading: isFetching,
    hasNextPage: canLoadMore,
    onLoadMore: handleLoadMore,
    disabled: !canLoadMore || isFetching,
    delayInMs: 500,
    rootMargin: "0px 0px 400px 0px",
  });

  if (isLoading && data.length === 0) {
    return (
      <div className={className}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (data.length === 0 && !isLoading) {
    return noDataMessage ? (
      <p className="text-center text-default-600 mt-4 p-4 text-sm">
        {noDataMessage}
      </p>
    ) : (
      <EmptyList message={noDataMessage || "No data found"} />
    );
  }

  return (
    <div className="infinite-list">
      <div className={className}>
        {visibleItems.map((item, index) => renderItem(item, index))}
      </div>

      {canLoadMore && (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          {isFetching ? (
            <div className="flex items-center gap-3 text-muted">
              <Spinner size="sm" />
              <span className="text-sm">
                {enableClientPagination && hasMoreClient
                  ? "Loading more..."
                  : "Fetching more..."}
              </span>
            </div>
          ) : (
            <Button
              onPress={handleLoadMore}
              variant="flat"
              color="primary"
              radius="full"
              size="sm"
              className="font-medium px-8"
            >
              Load more
            </Button>
          )}
          {/* Intersection trigger */}
          <div ref={infiniteRef} className="h-1" />
        </div>
      )}

      {!canLoadMore && data.length > 0 && (
        <p className="text-xs text-muted text-center py-2">
          No more items to display
        </p>
      )}
    </div>
  );
}

export default InfiniteList;
