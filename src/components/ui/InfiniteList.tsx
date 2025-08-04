import React, { useState, useEffect, useCallback, useMemo } from "react";
import EmptyList from "../EmptyList";

interface InfiniteListProps<T> {
  data: T[];
  itemsPerPage?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
  threshold?: number;
  sortBy?: string | ((a: T, b: T) => number);
  sortDirection?: "asc" | "desc";
  endText?: string;
}

const InfiniteListProps = <T,>({
  data,
  itemsPerPage = 10,
  renderItem,
  loadingComponent = (
    <div className="flex flex-col space-y-2">Loading more items</div>
  ),
  className = "",
  threshold = 200,
  sortBy,
  sortDirection = "asc",
  endText,
}: InfiniteListProps<T>) => {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Get nested property value from object path
  const getValueByPath = useCallback((obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => {
      // Handle array indices (e.g., "items[0].name")
      const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        return acc?.[arrayMatch[1]]?.[parseInt(arrayMatch[2])];
      }
      return acc?.[part];
    }, obj);
  }, []);

  // Sort the data based on provided criteria
  const sortedData = useMemo(() => {
    if (!sortBy) return [...data];

    return [...data].sort((a, b) => {
      let compareResult = 0;

      if (typeof sortBy === "function") {
        compareResult = sortBy(a, b);
      } else if (typeof a === "string" && typeof b === "string") {
        compareResult = a.localeCompare(b);
      } else if (typeof a === "number" && typeof b === "number") {
        compareResult = a - b;
      } else {
        // Handle object sorting by path
        const valA = getValueByPath(a, sortBy);
        const valB = getValueByPath(b, sortBy);

        if (valA === undefined || valB === undefined) return 0;
        if (typeof valA === "string" && typeof valB === "string") {
          compareResult = valA.localeCompare(valB);
        } else {
          compareResult = (valA as number) - (valB as number);
        }
      }

      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  }, [data, sortBy, sortDirection, getValueByPath]);

  // Calculate visible items based on current page
  const visibleItems = sortedData.slice(0, page * itemsPerPage);
  const hasMore = visibleItems.length < sortedData.length;

  // Load more items when reaching the threshold
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoading(false);
    }, 1000);
  }, [isLoading, hasMore]);

  // Set up scroll event listener for window
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;

      // Calculate distance from bottom of window
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isNearBottom) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore, loadMore, threshold]);

  // Reset page when data or sorting changes
  useEffect(() => {
    setPage(1);
  }, [data, sortBy, sortDirection]);

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
      ))}

      {isLoading && loadingComponent}

      {!hasMore && sortedData.length > 0 && (
        <div style={{ textAlign: "center", padding: "16px" }}>
          <EmptyList text={endText ?? "No more results"} />
        </div>
      )}

      {sortedData.length === 0 && (
        <div style={{ textAlign: "center", padding: "16px" }}>
          <EmptyList />
        </div>
      )}
    </div>
  );
};

export default InfiniteListProps;
