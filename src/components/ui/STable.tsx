import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { IconType } from "react-icons";
import { FaSearch } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { Table, TableBody, TableRow } from "./Table";
import { Button } from "@heroui/button";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import LoadingCard from "../LoadingCard";
import EmptyList from "../EmptyList";
import { AsyncUtils } from "@/utils/async.utils";
import LoadingMoreCard from "../LoadingMoreCard";

interface STableProps {
  title: string | React.ReactNode;
  titleIcon?: IconType;
  titleIconClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
  subTitle?: (filteredItems?: any[]) => string | React.ReactNode;
  titleExtra?: React.ReactNode;
  subTitleClassName?: string;
  description?: string | React.ReactNode;
  allowSearch?: boolean;
  data: any[];
  tableRow: (item: any) => React.ReactNode;
  itemsPerPage?: number;
  isLoading?: boolean;
  placeholder?: React.ReactNode;
  filterByValue?: string | string[];
  isPaginated?: boolean; // New prop to toggle between paginated and infinite loading
  skipCard?: boolean; // Optional prop to skip Card wrapper
  stickyHeader?: boolean; // Optional prop to make header sticky
  searchEndContent?: React.ReactNode;
}

function STable(props: STableProps) {
  const {
    title,
    titleIcon: TitleIcon,
    titleIconClassName,
    titleClassName,
    subTitle,
    subTitleClassName,
    description,
    allowSearch = true,
    data,
    tableRow,
    titleExtra,
    itemsPerPage = 10,
    isLoading = false,
    placeholder,
    filterByValue,
    bodyClassName,
    isPaginated = false, // Default to infinite loading
    skipCard,
    stickyHeader,
    searchEndContent,
  } = props;

  const [filterValue, setFilterValue] = useState("");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Common filtered items logic
  const filteredItems = useMemo(() => {
    if (!filterByValue) return data;

    return data.filter((item) => {
      // Handle array case
      if (Array.isArray(filterByValue)) {
        return filterByValue.some((key) => {
          const value = item?.[key];
          if (typeof value !== "string") return false;
          return value.toLowerCase().includes(filterValue.toLowerCase());
        });
      }
      // Handle string case
      const value = item?.[filterByValue];
      if (typeof value !== "string") return false;
      return value.toLowerCase().includes(filterValue.toLowerCase());
    });
  }, [data, filterValue, filterByValue]);

  // Paginated table logic
  const [currentPage, setCurrentPage] = useState(1);
  const paginatedData = useMemo(() => {
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const data = filteredItems?.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    return {
      data: data,
      totalPages,
    };
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleNextPage = () => {
    if (currentPage < paginatedData.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Infinite table logic
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  useEffect(() => {
    if (!isPaginated) {
      const observer = new IntersectionObserver(
        async (entries) => {
          const first = entries[0];
          if (first.isIntersecting) {
            await AsyncUtils.sleep(1);
            setVisibleCount((prev) => {
              const next = prev + itemsPerPage;
              return next > filteredItems.length ? filteredItems.length : next;
            });
          }
        },
        { threshold: 1 }
      );

      const currentRef = loadMoreRef.current;
      if (currentRef) observer.observe(currentRef);

      return () => {
        if (currentRef) observer.unobserve(currentRef);
      };
    }
  }, [filteredItems.length, itemsPerPage, isPaginated]);

  useEffect(() => {
    // Reset visible items on filter change
    if (!isPaginated) {
      setVisibleCount(itemsPerPage);
    } else {
      setCurrentPage(1); // Reset to first page when filtering in paginated mode
    }
  }, [filterValue, itemsPerPage, isPaginated]);

  // Common header render
  const renderHeader = () => (
    <CardHeader
      className={twMerge(
        "flex flex-col items-start gap-4 p-4 !pb-1 sm:p-6",
        skipCard && "!p-0 gap-0",
        stickyHeader && "sticky top-0 backdrop-blur-md"
      )}
    >
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="flex flex-col sm:flex-row justify-between w-full">
          <div
            className={twMerge(
              "flex flex-row items-center gap-2 text-lg sm:text-xl font-semibold",
              titleClassName
            )}
          >
            {TitleIcon && (
              <TitleIcon
                size={24}
                className={twMerge("text-steem", titleIconClassName)}
              />
            )}
            {title}
          </div>
          <div
            className={twMerge(
              "text-default-500 text-sm text-end",
              subTitleClassName
            )}
          >
            {subTitle?.(isPaginated ? paginatedData.data : visibleItems)}
          </div>
        </div>

        {description && (
          <p className="text-sm text-default-500">{description}</p>
        )}
      </div>
      <div className="flex flex-col items-start gap-3 w-full">
        {allowSearch && filterByValue && (
          <div className="flex flex-row w-full items-center justify-between gap-2">
            <Input
              startContent={<FaSearch className="text-default-500" />}
              placeholder="Search..."
              className="max-w-lg flex-1"
              value={filterValue}
              onValueChange={setFilterValue}
              isClearable
            />

            {searchEndContent}
          </div>
        )}
        {titleExtra}
      </div>
    </CardHeader>
  );

  // Common table body render
  const renderTableBody = (items: any[]) => (
    <Table>
      <TableBody className={twMerge(bodyClassName)}>
        {items.map((item, index) => (
          <TableRow key={index}>
            <div className="p-2 py-4 w-full">{tableRow(item)}</div>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card
      className={twMerge(
        skipCard && "shadow-none !p-0 rounded-none",
        stickyHeader ? "overflow-visible" : ""
      )}
    >
      {renderHeader()}
      <CardBody className={twMerge("space-y-4", skipCard && "!p-0")}>
        {isLoading ? (
          placeholder || <LoadingCard />
        ) : (
          <>
            {isPaginated
              ? renderTableBody(paginatedData.data)
              : renderTableBody(visibleItems)}

            {isPaginated ? (
              // Pagination controls
              paginatedData.totalPages > 1 && (
                <div className="flex items-center justify-between py-4 px-3">
                  <Button
                    variant="bordered"
                    size="sm"
                    onPress={handlePrevPage}
                    isDisabled={currentPage === 1}
                    startContent={<BiChevronLeft size={18} />}
                  >
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {paginatedData.totalPages}
                  </div>

                  <Button
                    variant="bordered"
                    size="sm"
                    onPress={handleNextPage}
                    isDisabled={currentPage === paginatedData.totalPages}
                    endContent={<BiChevronRight size={18} />}
                  >
                    Next
                  </Button>
                </div>
              )
            ) : (
              // Infinite loading controls
              <>
                {visibleCount < filteredItems.length && (
                  <div
                    ref={loadMoreRef}
                    className="text-center text-sm text-muted-foreground py-4"
                  >
                    <LoadingMoreCard />
                  </div>
                )}

                {visibleCount >= filteredItems.length &&
                  filteredItems.length > 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      <EmptyList text="No more results" />
                    </div>
                  )}

                {data?.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    <EmptyList  />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}

export default STable;
