"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";

import { Pagination } from "@nextui-org/pagination";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";

import { FaChevronDown, FaSearch } from "react-icons/fa";
import useSWR from "swr";
import { fetchSds } from "@/libs/constants/AppFunctions";
import SAvatar from "@/components/SAvatar";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import LoadingCard from "@/components/LoadingCard";
import { capitalize } from "@/libs/constants/AppConstants";
import Link from "next/link";

const INITIAL_VISIBLE_COLUMNS = ["voter", "rshares", "time"];

const columns = [
  { name: "VOTER", uid: "voter", sortable: true },
  { name: "VALUE", uid: "rshares", sortable: true },
  { name: "TIME", uid: "time", sortable: true },
];

export default function VotersCard({ comment }: { comment: Feed | Post }) {
  const URL = `/posts_api/getVotesById/${comment.link_id}`;

  if (!comment.link_id) return null;

  const { data, isLoading } = useSWR(URL, fetchSds<PostVote[]>);
  const [allRows, setAllRows] = useState<PostVote[]>([]);

  useEffect(() => {
    if (data) setAllRows(data);
  }, [data]);

  const [filterValue, setFilterValue] = React.useState<any>("");
  const [visibleColumns, setVisibleColumns] = React.useState<any>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<any>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState<any>(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<any>({
    column: "rshares",
    direction: "descending",
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
    let filteredVotes = [...allRows];

    if (hasSearchFilter) {
      filteredVotes = filteredVotes.filter((votes) =>
        votes.voter.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    // if (statusFilter !== "all" && Array.from(statusFilter)?.length !== statusOptions.length) {
    //     filteredDelegations = filteredDelegations.filter((delegation) =>
    //         Array.from(statusFilter).includes(delegation.status),
    //     );
    // }

    return filteredVotes;
  }, [allRows, filterValue, statusFilter]);

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

  const renderCell = React.useCallback((votes: PostVote, columnKey) => {
    const cellValue = votes[columnKey];

    switch (columnKey) {
      case "voter":
        return (
          <div className="flex flex-row items-start gap-1">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <SAvatar size="xs" username={votes.voter} />
                <Link
                  className=" hover:text-blue-500"
                  href={`/@${votes.voter}`}
                >
                  {votes.voter}
                </Link>
              </div>
            </div>
          </div>
        );

      case "rshares":
        const ratio = (comment?.payout ?? 1) / (comment?.net_rshares ?? 1);
        const voteAmount = votes.rshares * ratio;

        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">
              ${voteAmount.toLocaleString()}
            </p>
            <p className="text-bold text-small capitalize">
              {votes.percent / 100}%
            </p>{" "}
          </div>
        );

      case "time":
        return (
          <TimeAgoWrapper
            className="text-bold text-default-600"
            created={votes.time * 1000}
          />
        );

      default:
        return cellValue;
    }
  }, []);

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

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            size="sm"
            isClearable
            className="w-full sm:max-w-[50%]"
            placeholder="Search..."
            startContent={<FaSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            {/* <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button size="sm" endContent={<FaChevronDown className="text-small" />} variant="flat">
                                    Status
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={statusFilter}
                                selectionMode="multiple"
                                onSelectionChange={setStatusFilter}
                            >
                                {statusOptions.map((status) => (
                                    <DropdownItem key={status.uid} className="capitalize">
                                        {capitalize(status.name)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown> */}
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
            {/* <Button size="sm" onClick={() => {
                            authenticateUser();
                            if (!isAuthorized())
                                return
                            setTransferModal({ isOpen: !transferModal.isOpen })
                        }}
                            color="primary" endContent={<FaPlus />}>
                            Add New
                        </Button> */}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {allRows?.length} voters
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
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
    allRows.length,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      !!pages && (
        <div className="py-2 px-2 flex justify-between items-center self-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages}
            onChange={setPage}
          />
          {/* <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onClick={onPreviousPage}>
                        Previous
                    </Button>
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onClick={onNextPage}>
                        Next
                    </Button>
                </div> */}
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

  if (isLoading) return <LoadingCard />;

  return (
    <div>
      <Table
        aria-label="Voters table"
        isHeaderSticky={false}
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
          {(column: any) => (
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
            <TableRow key={`${item.voter}`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
