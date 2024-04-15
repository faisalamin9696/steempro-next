'use client';

import SAvatar from '@/components/SAvatar';
import MainWrapper from '@/components/wrappers/MainWrapper';
import TimeAgoWrapper from '@/components/wrappers/TimeAgoWrapper';
import { fetchSds, useAppSelector } from '@/libs/constants/AppFunctions';
import { abbreviateNumber } from '@/libs/utils/helper';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,

} from "@nextui-org/table";

import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Pagination } from '@nextui-org/pagination';
import {
  DropdownTrigger, Dropdown, DropdownMenu, DropdownItem
} from '@nextui-org/dropdown';
import React, { useEffect, useState } from 'react'
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import useSWR from 'swr';
import { capitalize } from '../profile/(tabs)/wallet/(tabs)/DelegationTab';
import LoadingCard from '@/components/LoadingCard';
import { RiLinkM } from "react-icons/ri";
import Link from 'next/link';
import { replaceOldDomains } from '@/libs/utils/Links';
import WitnessVoteButton from '@/components/WitnessVoteButton';
import { WitnessAccount } from '@/libs/constants/AppConstants';


const INITIAL_VISIBLE_COLUMNS = ["rank", "name", 'received_votes', "action"];

const columns = [
  { name: "RANK", uid: "rank", sortable: true },
  { name: "WITNESS", uid: "name", sortable: true },
  { name: "VOTES", uid: "received_votes", sortable: false },
  { name: "VERSION", uid: "running_version", sortable: false },
  { name: "BLOCK", uid: "last_confirmed_block", sortable: false },
  { name: "MISS", uid: "missed_blocks", sortable: true },
  { name: "PRICE FEED", uid: "price", sortable: false },
  { name: "VOTE", uid: "action", sortable: false },


];

export default function page() {
  const URL = `/witnesses_api/getWitnessesByRank`;
  const { data, isLoading } = useSWR(URL, fetchSds<Witness[]>);
  const loginInfo = useAppSelector(state => state.loginReducer.value);

  const [allRows, setAllRows] = useState<Witness[]>([]);
  useEffect(() => {
    if (data) {
      const index = data?.findIndex(account => account.name === (WitnessAccount));
      if (index && index !== -1) {
        const officialCommunity = data?.splice(index, 1)[0];
        if (officialCommunity)
          data?.unshift(officialCommunity);
      }
      setAllRows(data);
    }

  }, [data]);


  const [filterValue, setFilterValue] = React.useState<any>("");
  const [visibleColumns, setVisibleColumns] = React.useState<any>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<any>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState<any>(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<any>({
    column: "vests",
    direction: "descending",
  });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredDelegations = [...allRows];

    if (hasSearchFilter) {
      filteredDelegations = filteredDelegations.filter((delegation) =>
        delegation.name.toLowerCase().includes(filterValue.toLowerCase())
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



  const renderCell = React.useCallback((witness: Witness, columnKey) => {



    const cellValue = witness[columnKey];

    switch (columnKey) {
      case "name":
        return (<div className='flex flex-row items-center'>
          <div className="flex gap-2 items-center">
            <SAvatar size="xs" username={witness.name} />
            <p>{witness.name}</p>
            <Link target='_blank' href={replaceOldDomains(witness.url)}>
              <RiLinkM className='text-lg' />
            </Link>
          </div>
        </div>


        );
      case "received_votes":
        return (
          <div className="text-bold text-small">
            <p>{abbreviateNumber(witness.received_votes, 2, true)}</p>
          </div>
        );

      case "last_confirmed_block":
        return (
          <div className="flex flex-col gap-1 text-bold text-small">
            <p>{witness.last_confirmed_block}</p>
            <TimeAgoWrapper className="text-bold text-tiny text-default-600" created={witness.last_sync * 1000} />
          </div>
        );
      case "missed_blocks":
        return (
          <div className="flex lfex-col gap-1 text-bold text-small">
            <p>{abbreviateNumber(witness.missed_blocks, 2)}</p>
          </div>
        );

      case "action":
        return <WitnessVoteButton witness={witness}


        />

      case "price":
        return <div className="text-bold text-small">
          <p>{witness.reported_price.base}</p>
        </div>



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
        <div className="flex justify-between gap-3 items-center">
          <Input size="sm"
            isClearable
            className="w-full sm:max-w-[25%]"
            placeholder="Search..."
            startContent={<FaSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
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
            {/* <Button size="sm" onClick={() => setTransferModal(!transferModal)}
              color="primary" endContent={<FaPlus />}>
              Add New
            </Button> */}
          </div>
        </div>
        <div className="flex items-center justify-end">
          {/* <div></div> */}
          {/* <span className="text-default-400 text-small">Total {allRows.length} delegations</span> */}
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
      wrapper: ["max-h-[382px]", "max-w-3xl"],
      th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
      td: ["",
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

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <p className='text-lg font-semibold'>Steem Witnesses (aka "Block Producers")</p>
        <p className='text-tiny'>{`You have ${30 - (loginInfo?.witness_votes?.length || 0)} votes remaining. You can vote for a maximum of 30 witnesses.`}</p>
      </div>

      {isLoading ? <LoadingCard />
        : allRows && <Table
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
          <TableBody emptyContent={"No data found"} items={sortedItems.slice((page - 1) * rowsPerPage, (page) * rowsPerPage)}>
            {(item) => (
              <TableRow key={`${item.rank}-${item.name}`}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      }



    </div>
  )
}


