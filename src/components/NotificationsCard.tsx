'use client';

import { capitalize } from '@/app/profile/(tabs)/wallet/(tabs)/DelegationTab';
import { defaultNotificationFilters } from '@/libs/constants/AppConstants';
import { fetchSds, useAppSelector } from '@/libs/constants/AppFunctions';
import { getNotifications, vestToSteem } from '@/libs/steem/sds';
import { Button, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Pagination, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import React, { useEffect, useState } from 'react'
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { FaChevronDown, FaPlus, FaSearch } from 'react-icons/fa';
import { FiCornerDownRight } from 'react-icons/fi';
import useSWR from 'swr';
import SAvatar from './SAvatar';
import TimeAgoWrapper from './wrapper/TimeAgoWrapper';
import LoadingCard from './LoadingCard';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next13-progressbar';
import { pushWithCtrl, validateCommunity } from '@/libs/utils/helper';

interface Props {
    username?: string | null;
}

const typeColorMap = {
    vote: "success",
    follow: "primary",
    mention: "warning",
    resteem: "default",
    reply: 'secondary'

};

const INITIAL_VISIBLE_COLUMNS = ["account", 'time', "type"];

const columns = [
    { name: "ACCOUNT", uid: "account", sortable: true },
    { name: "Time", uid: "time", sortable: true },
    { name: "Type", uid: "type", sortable: true },
];

const typeOptions = [
    { name: "vote", uid: "vote" },
    { name: "Follow", uid: "follow" },
    { name: "Mention", uid: "mention" },
    { name: "Resteem", uid: "resteem" },
    { name: "Reply", uid: "reply" },
];

let offset = 0;

export default function NotificationsCard(props: Props) {
    const { username } = props;

    if (!username)
        return null
    // let [offset, setOffset] = useState(20);

    const defFilter = defaultNotificationFilters;

    const filter = `{"mention":{"exclude":${!defFilter.mention.status}, "minSP":${defFilter.mention.minSp},"minReputation":${defFilter.mention.minRep}},
    "vote":{"exclude":${!defFilter.vote.status}, "minVoteAmount":${defFilter.vote.minVote},"minReputation":${defFilter.vote.minRep},"minSP":${defFilter.vote.minSp}},
    "follow":{"exclude":${!defFilter.follow.status}, "minSP":${defFilter.follow.minSp},"minReputation":${defFilter.follow.minRep}},
    "resteem":{"exclude":${!defFilter.resteem.status}, "minSP":${defFilter.resteem.minSp},"minReputation":${defFilter.resteem.minRep}},
   "reply":{"exclude":${!defFilter.reply.status}, "minSP":${defFilter.reply.minSp},"minReputation":${defFilter.reply.minRep}}}`;

    const URL = `/notifications_api/getFilteredNotificationsByStatus/${username}/all/${filter}/25`;
    function URL_OFFSET(offset: number) {
        return `/notifications_api/getFilteredNotificationsByStatus/${username}/all/${filter}/25/${offset}`;
    }

    const { data, isLoading, mutate } = useSWR(URL, fetchSds<SDSNotification[]>);

    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);
    const isSelf = loginInfo.name === username;
    const router = useRouter();

    const [allRows, setAllRows] = useState<SDSNotification[]>([]);
    useEffect(() => {
        if (data)
            setAllRows(data);

    }, [data])

    const loadMoreMutation = useMutation({
        mutationFn: (offset: number) => fetchSds<SDSNotification[]>(URL_OFFSET(offset)),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return
            }
            if (data) {
                setAllRows((prev) => [...prev, ...data])
            }

        }
    });


    const [filterValue, setFilterValue] = React.useState<any>("");
    const [visibleColumns, setVisibleColumns] = React.useState<any>(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = React.useState<any>("all");
    const [rowsPerPage, setRowsPerPage] = React.useState<any>(5);
    const [sortDescriptor, setSortDescriptor] = React.useState<any>({
        column: "time",
        direction: "descending",
    });

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columns;

        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredNotifications = [...allRows];

        if (hasSearchFilter) {
            filteredNotifications = filteredNotifications.filter((notification) =>
                notification.account.toLowerCase().includes(filterValue.toLowerCase()) ||
                notification.author.toLowerCase().includes(filterValue.toLowerCase()),
            );
        }
        if (statusFilter !== "all" && Array.from(statusFilter).length !== typeOptions.length) {
            filteredNotifications = filteredNotifications.filter((notification) =>
                Array.from(statusFilter).includes(notification.type),
            );
        }

        return filteredNotifications;
    }, [allRows, filterValue, statusFilter]);


    const items = React.useMemo(() => {
        return filteredItems;
    }, [filteredItems, rowsPerPage]);


    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column];
            const second = b[sortDescriptor.column];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const renderCell = React.useCallback((notification: SDSNotification, columnKey) => {
        const cellValue = notification[columnKey];

        switch (columnKey) {
            case "account":
                return (<div className="flex gap-2">
                    <SAvatar size="xs" username={notification.account} />
                    <p>{notification.account}</p>
                </div>


                );

            case "time":
                return (
                    <div className="text-bold text-small">
                        <TimeAgoWrapper className="text-bold text-tiny text-default-600" created={notification.time * 1000} />
                    </div>
                );
            case "type":
                return (
                    <Chip
                        className="capitalize border-none gap-1 text-default-600"
                        color={typeColorMap[notification.type]}
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



    const onSearchChange = React.useCallback((value) => {
        if (value) {
            setFilterValue(value);
        } else {
            setFilterValue("");
        }
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("")
    }, [])

    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input size="sm"
                        isClearable
                        className="w-full"
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
                                    Types
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
                                {typeOptions.map((status) => (
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
                        <Button size="sm" onPress={() => { }}
                            color="primary" endContent={<FaPlus />}>
                            Mark as read
                        </Button>
                    </div>
                </div>

            </div>
        );
    }, [
        filterValue,
        statusFilter,
        visibleColumns,
        allRows.length,
        onSearchChange,
        hasSearchFilter,
    ]);


    const handleOpenNotification = (item: SDSNotification) => {
        let targetUrl = '';


        switch (item.type) {
            case "new_community":
            case "set_role":
            case "set_props":
            case "set_label":
            case "subscribe":
            case "follow":
            case "reply":
            // Handle other cases...
            default:
                if (!item.permlink) {
                    targetUrl = `/@${item.account}`;
                } else {
                    const is_community = validateCommunity(item.permlink);
                    if (is_community) {
                        targetUrl = `/trending/${item.account}`;

                    } else {
                        targetUrl = `/@${item.author}/${item.permlink}`;

                    }
                }

                pushWithCtrl(null, router, targetUrl, true);
                break;
        }
    };



    if (isLoading)
        return <LoadingCard />

    return (
        <div className=' max-w-sm'>
            <Table
                aria-label="Notification table"
                isHeaderSticky
                // bottomContent={bottomContent}
                classNames={{
                    base: "max-h-[520px] overflow-auto",
                    table: "min-h-[420px]",
                }} sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                onSortChange={setSortDescriptor}
                onRowAction={(key) => handleOpenNotification(JSON.parse(key))}

                bottomContent={
                    allRows.length > 0 && !isLoading ? (
                        <div className="flex w-full justify-center">
                            <Button size='sm' isDisabled={isLoading || loadMoreMutation.isPending}
                                isLoading={loadMoreMutation.isPending}
                                radius='full'
                                variant="flat" onPress={() => {
                                    offset += 25;
                                    loadMoreMutation.mutate(offset);
                                }}>
                                {isLoading && <Spinner size="sm" />}
                                Load More
                            </Button>
                        </div>
                    ) : null
                }

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
                    {(item) => {


                        return (
                            <TableRow key={JSON.stringify(item)} className='cursor-pointer hover:bg-foreground/10'>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )
                    }}
                </TableBody>
            </Table>


        </div>
    )
}
