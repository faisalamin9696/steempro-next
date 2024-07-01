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

import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Pagination } from '@nextui-org/pagination';
import {
    DropdownTrigger, Dropdown, DropdownMenu, DropdownItem
} from '@nextui-org/dropdown';
import { FaChevronDown, FaSearch } from "react-icons/fa";
import useSWR from "swr";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import LoadingCard from "@/components/LoadingCard";
import moment from "moment";
import { TransferHistoryCard } from "@/components/TransferHistoryCard";
import { capitalize } from "@/libs/constants/AppConstants";

const INITIAL_VISIBLE_COLUMNS = ["op", 'time'];

const columns = [
    { name: "OPERATION", uid: "op", sortable: false },
    { name: "TIME", uid: "time", sortable: true },
];

const statusOptions = [
    { name: "Normal Transfer", uid: "transfer" },
    { name: "Transfer to Vestings", uid: "transfer_to_vesting" },
    { name: "Author Reward", uid: "author_reward" },
    { name: "curation Reward", uid: "curation_reward" },
    { name: "Claim Reward", uid: "claim_reward_balance" },
];



const start_date = moment().subtract(30, 'days').unix();
const end_date = moment().unix();

export default function TransferHistoryTab({ data }: { data: AccountExt }) {
    const { username } = usePathnameClient();

    const filters = (`author_reward,curation_reward,withdraw_vesting,cancel_transfer_from_savings,claim_reward_balance,fill_convert_request,
fill_order,fill_transfer_from_savings,fill_vesting_withdraw,transfer,transfer_from_savings,transfer_to_savings,transfer_to_vesting`);

    const URL = `/account_history_api/getHistoryByOpTypesTime/${data.name}/${filters}/${start_date}-${end_date}`;
    const { data: historyData, isLoading: isLoading } = useSWR(URL, fetchSds<AccountHistory[]>);
    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);
    const [allRows, setAllRows] = useState<AccountHistory[]>([]);
    const [filterValue, setFilterValue] = React.useState<any>("");
    const [visibleColumns, setVisibleColumns] = React.useState<any>(new Set(INITIAL_VISIBLE_COLUMNS));

    const [statusFilter, setStatusFilter] = React.useState<any>("all");
    const [rowsPerPage, setRowsPerPage] = React.useState<any>(10);
    const [sortDescriptor, setSortDescriptor] = React.useState<any>({
        column: "time",
        direction: "descending",
    });
    const [page, setPage] = React.useState(1);

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = columns.filter((column) => Array.from(visibleColumns).includes(column.uid));

    const filteredItems = React.useMemo(() => {
        let filteredHistory = [...allRows];

        if (hasSearchFilter) {
            filteredHistory = filteredHistory.filter((history) =>
                JSON.stringify(history.op).toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        if (statusFilter !== "all" && Array.from(statusFilter)?.length !== statusOptions.length) {
            filteredHistory = filteredHistory.filter((history) =>
                Array.from(statusFilter).includes(history.op[0]),
            );
        }

        return filteredHistory;
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



    const renderCell = React.useCallback((history: AccountHistory, columnKey) => {
        const cellValue = history[columnKey];
        switch (columnKey) {
            case "op":
                return (
                    <TransferHistoryCard op={history} context={username}
                        steem_per_share={globalData.steem_per_share} />
                   
                );

            case "time":
                return (
                    <div className="flex flex-col">
                        <TimeAgoWrapper className="text-bold text-tiny text-default-600" created={history.time * 1000} />
                    </div>
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
                                    FILTER
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
                        </Dropdown>
                        {/* <Dropdown>
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
                        </Dropdown> */}
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
                    <span className="text-default-400 text-small">Total {allRows?.length} entries</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
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
            wrapper: ["max-h-[382px]", "max-w-3xl"],
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


    useEffect(() => {
        if (historyData) {
            historyData.reverse();
            setAllRows(historyData);
        }
    }, [historyData]);


    if (isLoading)
        return <LoadingCard />

    return (
        <div>
            <Table
                aria-label="Transfet history table"
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
                        <TableRow key={`${item.id}`} >
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>


        </div>
    );
}
