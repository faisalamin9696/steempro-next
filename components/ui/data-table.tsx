import * as React from "react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@heroui/input";
import { AsyncUtils } from "@/utils/async.utils";
import { twMerge } from "tailwind-merge";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface BaseDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  className?: string;
  emptyMessage?: string;
  filterByValue?: string | string[];
  hasMore?: (data: T[]) => boolean;
  groupBy?: (item: T) => string;
  renderGroupHeader?: (group: string) => React.ReactNode;
}

interface BasicDataTableProps<T> extends BaseDataTableProps<T> {
  loadMore?: never;
  onLoadedMore?: never;
  initialLoadCount?: number;
  loadMoreCount?: number;
}

interface LoadMoreDataTableProps<T> extends BaseDataTableProps<T> {
  loadMore: (offset: number) => Promise<T[]>;
  onLoadedMore: (data: T[]) => void;
  initialLoadCount: number;
  loadMoreCount: number;
}

type DataTableProps<T> = BasicDataTableProps<T> | LoadMoreDataTableProps<T>;

type SortDirection = "asc" | "desc" | null;

const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => {
    // Handle array indices like [1]
    const arrayMatch = part.match(/^\[(\d+)\]$/);
    if (arrayMatch) {
      return acc?.[parseInt(arrayMatch[1], 10)];
    }

    // Handle quoted keys like ['from']
    const quotedKeyMatch = part.match(/^\['(.+)'\]$/);
    if (quotedKeyMatch) {
      return acc?.[quotedKeyMatch[1]];
    }

    // Handle regular dot notation
    return acc?.[part];
  }, obj);
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search...",
  className,
  emptyMessage = "No data found.",
  initialLoadCount = 20,
  loadMoreCount = 20,
  filterByValue,
  loadMore,
  onLoadedMore,
  groupBy,
  renderGroupHeader,
  ...props
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(initialLoadCount);
  const [isFetching, setIsFetching] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const searchableColumns = columns.filter((col) => col.searchable);
  const hasSearch = searchableColumns.length > 0;

  // Reset display count when search changes
  useEffect(() => {
    setDisplayCount(initialLoadCount);
  }, [searchQuery, initialLoadCount]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter by search query
    if (searchQuery && searchableColumns.length > 0) {
      const query = searchQuery.toLowerCase();

      result = result.filter((row) => {
        // Handle array case (multiple fields to search)
        if (Array.isArray(filterByValue)) {
          return filterByValue.some((path) => {
            const value = getNestedValue(row, path);
            return String(value).toLowerCase().includes(query);
          });
        }

        return searchableColumns.some((col) => {
          const value = row[col.key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(query);
        });
      });
    }

    // Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === "asc" ? 1 : -1;
        if (bVal == null) return sortDirection === "asc" ? -1 : 1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (aVal instanceof Date && bVal instanceof Date) {
          return sortDirection === "asc"
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (sortDirection === "asc") {
          return aStr.localeCompare(bStr);
        }
        return bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, searchQuery, searchableColumns, sortColumn, sortDirection]);

  const displayedData = useMemo(() => {
    return filteredAndSortedData.slice(0, displayCount);
  }, [filteredAndSortedData, displayCount]);

  const hasMore =
    props?.hasMore?.(data) ?? displayCount < filteredAndSortedData.length;

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isFetching) {
        try {
          if (loadMore) {
            if (!isFetching) setIsFetching(true);
            await AsyncUtils.sleep(0.2);
            const newData = await loadMore(data.length);
            onLoadedMore?.(newData);
          }
          setDisplayCount((prev) => prev + loadMoreCount);
        } finally {
          setIsFetching(false);
        }
      }
    },
    [hasMore, loadMoreCount, loadMore, isFetching, data],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-1 h-3 w-3 text-primary" />;
    }
    return <ArrowDown className="ml-1 h-3 w-3 text-primary" />;
  };

  return (
    <div className={twMerge("space-y-3", className)}>
      {hasSearch && (
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          startContent={<Search size={18} className="text-muted" />}
          onValueChange={setSearchQuery}
          isClearable
          inputMode="search"
        />
      )}

      <div className="relative w-full overflow-auto ">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-muted/30 hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={twMerge(
                    column.sortable &&
                      "cursor-pointer select-none hover:text-foreground transition-colors",
                    column.className,
                  )}
                  onClick={
                    column.sortable ? () => handleSort(column.key) : undefined
                  }
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && <SortIcon columnKey={column.key} />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted "
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              displayedData.map((row, index) => {
                const currentGroup = groupBy ? groupBy(row) : null;
                const prevGroup =
                  index > 0 && groupBy
                    ? groupBy(displayedData[index - 1])
                    : null;
                const showHeader = groupBy && currentGroup !== prevGroup;

                return (
                  <React.Fragment key={index}>
                    {showHeader && (
                      <TableRow className="bg-default-100/50 hover:bg-default-100/50 border-0">
                        <TableCell
                          colSpan={columns.length}
                          className="py-2 text-xs font-semibold text-muted uppercase tracking-wider"
                        >
                          {renderGroupHeader
                            ? renderGroupHeader(currentGroup!)
                            : currentGroup}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="border-y border-muted/30 ">
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          className={column.className}
                        >
                          {column.render
                            ? column.render(row[column.key], row)
                            : row[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Infinite scroll loader */}
        {(hasMore || isFetching) && (
          <div
            ref={loaderRef}
            className="flex items-center justify-center py-4 text-muted"
          >
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">
              {isFetching ? "Fetching item..." : "Loading more..."}
            </span>
          </div>
        )}

        {/* Show count */}
        {filteredAndSortedData.length > 0 && (
          <p className="text-xs text-muted text-center py-2">
            Showing {displayedData.length} of {filteredAndSortedData.length}
          </p>
        )}
      </div>
    </div>
  );
}
