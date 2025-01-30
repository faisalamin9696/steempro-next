"use client";

import { fetchSds } from "@/libs/constants/AppFunctions";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { validateCommunity } from "@/libs/utils/helper";
import SAvatar from "@/components/SAvatar";
import { FaChevronDown } from "react-icons/fa";
import LoadingCard from "@/components/LoadingCard";
import { capitalize } from "@/libs/constants/AppConstants";
import Link from "next/link";

type CommunityReportType = {
  author: string;
  total_post_count: number;
  total_comment_count: number;
  unique_comment_count: number;
};

const INITIAL_VISIBLE_COLUMNS = [
  "author",
  "total_post_count",
  "total_comment_count",
  "unique_comment_count",
];

const columns = [
  { name: "AUTHOR", uid: "author", sortable: true },
  { name: "POSTS", uid: "total_post_count", sortable: true },
  { name: "COMMENTS", uid: "total_comment_count", sortable: true },
  { name: "UNIQUE COMMENTS", uid: "unique_comment_count", sortable: true },
  { name: "DIFFERENCE", uid: "difference", sortable: false },
];

export default function CommunityReportPage() {
  let [community, setCommunity] = useState("");
  const [allRows, setAllRows] = useState<CommunityReportType[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { community: string }) =>
      fetchSds(`/feeds_api/getActiveCommunityReport/${data.community}`),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      if (data) setAllRows(data as any);
    },
  });

  async function getCommunityReport() {
    community = community.replace("@", "").toLowerCase();

    if (!community || !validateCommunity(community)) {
      toast.info("Invalid community");
      return;
    }

    mutate({ community });
  }

  const [filterValue, setFilterValue] = React.useState<any>("");
  const [visibleColumns, setVisibleColumns] = React.useState<any>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<any>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState<any>(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<any>({
    column: "author",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredDelegations = [...allRows];

    if (hasSearchFilter) {
      filteredDelegations = filteredDelegations.filter((report) =>
        report.author.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredDelegations;
  }, [allRows, filterValue]);

  const pages = Math.ceil(filteredItems?.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = 0;
    const end = start + filteredItems.length;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback(
    (report: CommunityReportType, columnKey) => {
      const cellValue = report[columnKey];

      switch (columnKey) {
        case "author":
          return (
            <div className="flex gap-2 items-center">
              <SAvatar size="xs" username={report.author} />
              <Link
                prefetch={false}
                className=" hover:text-blue-500"
                href={`/@${report.author}`}
              >
                {report.author}
              </Link>
            </div>
          );

        case "difference":
          return (
            <p>{report.total_comment_count - report.unique_comment_count}</p>
          );

        default:
          return cellValue;
      }
    },
    []
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const totalPosts = allRows.reduce((sum, cur) => {
    return (sum += cur.total_post_count);
  }, 0);

  const totalComments = allRows.reduce((sum, cur) => {
    return (sum += cur.total_comment_count);
  }, 0);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-center">
          <Input
            size="sm"
            isClearable
            className="w-full sm:max-w-[25%]"
            placeholder="Search..."
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  endContent={<FaChevronDown className="text-small" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            {/* <Button size="sm" onClick={() => setTransferModal(!transferModal)}
              color="primary" endContent={<FaPlus />}>
              Add New
            </Button> */}
          </div>
        </div>
        <div className="flex items-center justify-between">
          {/* <div></div> */}
          <span className="text-default-400 text-small">
            Total {totalPosts} posts and {totalComments} comments
          </span>

          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    allRows?.length,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      !!pages && (
        <div className="py-2 px-2 flex justify-between items-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages}
            onChange={setPage}
          />
          <div className="hidden sm:flex w-[30%] justify-end gap-2">
            <Button
              isDisabled={pages === 1}
              size="sm"
              variant="flat"
              onPress={onPreviousPage}
            >
              Previous
            </Button>
            <Button
              isDisabled={pages === 1}
              size="sm"
              variant="flat"
              onPress={onNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )
    );
  }, [items.length, page, pages, hasSearchFilter]);

  const classNames = React.useMemo(
    () => ({
      wrapper: ["max-h-[382px]", "max-w-3xl"],
      th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
      td: [
        "",
        // changing the rows border radius
        // first
        "group-data-[first=true]:first:before:rounded-none",
        "group-data-[first=true]:last:before:rounded-none",
        // middle
        "group-data-[middle=true]:before:rounded-none",
        // last
        "group-data-[last=true]:first:before:rounded-none",
        "group-data-[last=true]:last:before:rounded-none",
      ],
    }),
    []
  );

  return (
    <div className="flex flex-col items-center gap-8">
      <p className=" text-xl font-bold">Community Report</p>

      <div className="flex flex-col gap-4 w-full">
        <Input
          isClearable
          size="sm"
          value={community}
          onValueChange={setCommunity}
          isRequired
          label="Community"
          placeholder="Enter community account e.g. hive-144064"
        />

        <Button
          className="self-start"
          onPress={getCommunityReport}
          isLoading={isPending}
        >
          Get Report
        </Button>
      </div>

      {isPending ? (
        <LoadingCard />
      ) : (
        <Table
          aria-label="Delegation table"
          isHeaderSticky
          removeWrapper
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={classNames}
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onSortChange={setSortDescriptor}
          isCompact
          isStriped
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={"No data found"}
            items={sortedItems.slice(
              (page - 1) * rowsPerPage,
              page * rowsPerPage
            )}
          >
            {(item) => (
              <TableRow key={`${item.author}`}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
