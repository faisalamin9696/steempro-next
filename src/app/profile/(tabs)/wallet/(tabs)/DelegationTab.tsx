import React from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Chip,
    Pagination,
    Tooltip,
} from "@nextui-org/react";
import { FaChevronDown, FaPlus, FaSearch } from "react-icons/fa";
import useSWR from "swr";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import { FiCornerDownRight } from "react-icons/fi";
import { MdDelete, MdEdit } from "react-icons/md";
import { vestToSteem } from "@/libs/steem/sds";
import SAvatar from "@/components/SAvatar";
import TimeAgoWrapper from "@/components/wrapper/TimeAgoWrapper";
import { BiDotsVerticalRounded } from "react-icons/bi";

const statusColorMap = {
    incoming: "success",
    expiring: "danger",
    outgoing: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["from", 'vests', "status"];

const columns = [
    { name: "ACCOUNT", uid: "from", sortable: true },
    { name: "AMOUNT", uid: "vests", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
];

const statusOptions = [
    { name: "Incoming", uid: "incoming" },
    { name: "Expiring", uid: "expiring" },
    { name: "Outgoing", uid: "outgoing" },
];


export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function DelegationTab() {
    const { username } = usePathnameClient();
    const URL_OUTGOING = `/delegations_api/getOutgoingDelegations/${username}`;
    const URL_INCOMING = `/delegations_api/getIncomingDelegations/${username}`;
    const URL_EXPIRING = `/delegations_api/getExpiringDelegations/${username}`;

    const { data: outgoingData } = useSWR(URL_OUTGOING, fetchSds<Delegation[]>);
    const { data: incomingData } = useSWR(URL_INCOMING, fetchSds<Delegation[]>);
    const { data: expiringData } = useSWR(URL_EXPIRING, fetchSds<Delegation[]>);

    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);

    const outgoingRows = outgoingData?.map((item) => {
        return { ...item, status: 'outgoing' }
    });

    const incomingRows = incomingData?.map((item) => {
        return { ...item, status: 'incoming' }
    });
    const expiringRows = expiringData?.map((item) => {
        return { ...item, status: 'expiring' }
    });


    const allRows = [...(outgoingRows ?? []),
    ...(incomingRows ?? []), ...(expiringRows ?? [])];

    const [filterValue, setFilterValue] = React.useState<any>("");
    const [visibleColumns, setVisibleColumns] = React.useState<any>(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = React.useState<any>("all");
    const [rowsPerPage, setRowsPerPage] = React.useState<any>(5);
    const [sortDescriptor, setSortDescriptor] = React.useState<any>({
        column: "vests",
        direction: "ascending",
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
                delegation.from.toLowerCase().includes(filterValue.toLowerCase()) ||
                delegation.to.toLowerCase().includes(filterValue.toLowerCase()),
            );
        }
        if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
            filteredDelegations = filteredDelegations.filter((delegation) =>
                Array.from(statusFilter).includes(delegation.status),
            );
        }

        return filteredDelegations;
    }, [allRows, filterValue, statusFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

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

    const renderCell = React.useCallback((delegation: Delegation, columnKey) => {
        const cellValue = delegation[columnKey];

        switch (columnKey) {
            case "from":
                const canEdit = delegation['status'] === 'outgoing' && delegation.from === loginInfo.name;
                const canRemove = delegation['status'] === 'incoming' && delegation.from === loginInfo.name;
                return (
                    <div className="flex flex-row items-start gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light" radius="full">
                                    <BiDotsVerticalRounded className="text-default-300 text-xl" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu disabledKeys={!(canEdit || canRemove) ? ['edit', 'delete'] : []}>
                                <DropdownItem key={'edit'}>Edit</DropdownItem>
                                <DropdownItem key={'delete'} color="danger">Delete</DropdownItem>


                            </DropdownMenu>
                        </Dropdown>

                        <div className="flex flex-col gap-2">


                            <div className="flex gap-2 items-center">
                                <SAvatar size="xs" username={delegation.from} />
                                <p>{delegation.from}</p>
                            </div>
                            <div className="flex flex-row gap-2 items-center ms-2">
                                <FiCornerDownRight className='text-default-900/50' />
                                <SAvatar size="xs" username={delegation.to} />
                                <p>{delegation.to}</p>

                            </div>

                        </div>
                    </div>


                );

            case "vests":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-small capitalize">{vestToSteem(cellValue, globalData.steem_per_share)?.toLocaleString()} SP</p>
                        <TimeAgoWrapper className="text-bold text-tiny capitalize text-default-600" created={delegation.time * 1000} />
                    </div>
                );
            case "status":
                return (
                    <Chip
                        className="capitalize border-none gap-1 text-default-600"
                        color={statusColorMap[delegation['status']]}
                        size="sm"
                        variant="dot"
                    >
                        {cellValue}
                    </Chip>
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
                        <Button size="sm"
                            color="primary" endContent={<FaPlus />}>
                            Add New
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {allRows.length} delegations</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
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
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
                        Previous
                    </Button>
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
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
            td: [
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
        <Table
            aria-label="Delegation table"
            isHeaderSticky
            removeWrapper
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={classNames}
            // sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            onSortChange={setSortDescriptor}
            isCompact
            isStriped
            showDragButtons
            draggable

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
            <TableBody emptyContent={"No data found"} items={sortedItems}>
                {(item) => (
                    <TableRow key={`${item.from}-${item.to}`}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}