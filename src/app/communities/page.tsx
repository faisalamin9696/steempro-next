'use client';

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";

import { Pagination } from '@nextui-org/pagination';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';

import {
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/dropdown';



import { FaChevronDown, FaSearch } from "react-icons/fa";
import useSWR from "swr";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import LoadingCard from "@/components/LoadingCard";
import { useLogin } from "@/components/useLogin";
import CommunityCard from "@/components/CommunityCard";
import FollowButton from "@/components/FollowButton";

const INITIAL_VISIBLE_COLUMNS = ["title"];

const columns = [
  { name: "RANK", uid: "rank", sortable: true },
  { name: "COMMUNITY", uid: "title", sortable: true },
  { name: "SUBSCRIBERS", uid: "count_subs", sortable: true },
  { name: "REWARD", uid: "count_pending", sortable: true },
  { name: "CREATED", uid: "created", sortable: true },


];


export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function CommunitiesPage() {
  const { username } = usePathnameClient();

  const loginInfo = useAppSelector(state => state.loginReducer.value);

  const URL = `/communities_api/getCommunitiesByRank/${loginInfo.name || null}/1000`;

  const { data, isLoading } = useSWR(URL, fetchSds<Community[]>);

  const { authenticateUser, isAuthorized } = useLogin();

  const [allRows, setAllRows] = useState<Community[]>([]);

  useEffect(() => {
    if (data)
      setAllRows(data);
  }, [data]);


  const [filterValue, setFilterValue] = React.useState<any>("");
  const [visibleColumns, setVisibleColumns] = React.useState<any>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<any>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState<any>(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<any>({
    column: "rank",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredCommunities = [...allRows];

    if (hasSearchFilter) {
      filteredCommunities = filteredCommunities.filter((community) =>
        community.title.toLowerCase().includes(filterValue.toLowerCase()) ||
        community.account.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    // if (statusFilter !== "all" && Array.from(statusFilter)?.length !== statusOptions.length) {
    //   filteredDelegations = filteredDelegations.filter((delegation) =>
    //     Array.from(statusFilter).includes(delegation.status),
    //   );
    // }

    return filteredCommunities;
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


  const renderCell = React.useCallback((community: Community, columnKey) => {
    const cellValue = community[columnKey];

    switch (columnKey) {

      case "title":
        return (
          <CommunityCard community={community}
            className="bg-transparent dark:bg-transparent"
            endContent={<div className='flex gap-1 items-center'>
             
              <FollowButton community={community} account={loginInfo} />

            </div>
            }

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
    setFilterValue("")
    setPage(1)
  }, [])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">

          <div className="flex flex-col gap-2 w-full sm:max-w-[25%]">
            <p className="text-lg font-semibold">Communities</p>
            <Input size="sm"
              isClearable
              className=""
              placeholder="Search..."
              startContent={<FaSearch />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
          </div>
          <div className="flex gap-3">

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button size="sm" endContent={<FaChevronDown className="text-small" />} variant="flat">
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
            }}
              color="primary" endContent={<FaPlus />}>
              Create Community
            </Button> */}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {allRows?.length} communities</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
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
          <Button isDisabled={pages === 1} size="sm" variant="flat" onClick={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onClick={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [items.length, page, pages, hasSearchFilter]);


  const classNames = React.useMemo(
    () => ({
      th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
      td: ["pl-0",
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
    [],
  );

  if (isLoading)
    return <LoadingCard />

  return (
    <div>
      <Table
        aria-label="Communities table"
        isHeaderSticky
        removeWrapper
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={classNames}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}

      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={"center"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No data found"}
          items={sortedItems.slice((page - 1) * rowsPerPage, (page) * rowsPerPage)}>
          {(item) => (
            <TableRow key={`${item.id}-${item.account}`} >
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

    </div>
  );
}
