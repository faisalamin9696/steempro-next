"use client";

import {
  capitalize,
  DefaultNotificationFilters,
} from "@/libs/constants/AppConstants";
import {
  fetchSds,
  useAppDispatch,
  useAppSelector,
} from "@/libs/constants/AppFunctions";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import SAvatar from "./SAvatar";
import TimeAgoWrapper from "./wrappers/TimeAgoWrapper";
import LoadingCard from "./LoadingCard";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next13-progressbar";
import { validateCommunity } from "@/libs/utils/helper";
import { IoCheckmarkDone, IoFilter } from "react-icons/io5";
import { markasRead } from "@/libs/steem/condenser";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Badge } from "@nextui-org/react";

interface Props {
  username: string | null;
  onClose?: () => void;
}

const typeColorMap = {
  reply: "secondary",
  reblog: "default",
  follow: "primary",
  mention: "warning",
  vote: "success",
  unmute_post: "default",
  pin_post: "default",
  unpin_post: "default",
  flag_post: "default",
  error: "default",
  subscribe: "default",
  new_community: "default",
  set_role: "default",
  set_props: "default",
  set_label: "default",
  mute_post: "default",
};

const INITIAL_VISIBLE_COLUMNS = ["account", "time", "type"];

const columns = [
  { name: "ACCOUNT", uid: "account", sortable: true },
  { name: "TIME", uid: "time", sortable: false },
  { name: "TYPE", uid: "type", sortable: true },
];

const typeOptions = [
  { name: "vote", uid: "vote" },
  { name: "Follow", uid: "follow" },
  { name: "Mention", uid: "mention" },
  { name: "Resteem", uid: "resteem" },
  { name: "Reply", uid: "reply" },
];

let offset = 0;
const defFilter = DefaultNotificationFilters;

const filter = {
  mention: {
    exclude: defFilter.mention.status,
    minSP: defFilter.mention.minSp,
    minReputation: defFilter.mention.minRep,
  },
  vote: {
    exclude: defFilter.vote.status,
    minVoteAmount: defFilter.vote.minVote,
    minReputation: defFilter.vote.minRep,
    minSP: defFilter.vote.minSp,
  },
  follow: {
    exclude: defFilter.follow.status,
    minSP: defFilter.follow.minSp,
    minReputation: defFilter.follow.minRep,
  },
  resteem: {
    exclude: defFilter.resteem.status,
    minSP: defFilter.resteem.minSp,
    minReputation: defFilter.resteem.minRep,
  },
  reply: {
    exclude: defFilter.reply.status,
    minSP: defFilter.reply.minSp,
    minReputation: defFilter.reply.minRep,
  },
};

let tempLastRead = 0;
export default function NotificationsTable(props: Props) {
  const { username } = props;

  if (!username) return null;
  // let [offset, setOffset] = useState(20);

  const URL = `/notifications_api/getFilteredNotificationsByStatus/${username}/all/${JSON.stringify(
    filter
  )}/20`;
  function URL_OFFSET(offset: number) {
    return `/notifications_api/getFilteredNotificationsByStatus/${username}/all/${JSON.stringify(
      filter
    )}/20/${offset}`;
  }

  const { data, isLoading, mutate } = useSWR(URL, fetchSds<SDSNotification[]>);

  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const isSelf = !!loginInfo.name && loginInfo.name === username;
  const router = useRouter();
  const { authenticateUser, isAuthorized } = useLogin();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();

  const [allRows, setAllRows] = useState<SDSNotification[]>([]);
  useEffect(() => {
    if (data) {
      if (isSelf) {
        const unreadCount = data.filter((obj) => obj.is_read === 0).length;
        if (
          (unreadCount >= 0 && unreadCount > loginInfo.unread_count) ||
          unreadCount < 20
        ) {
          dispatch(
            saveLoginHandler({ ...loginInfo, unread_count: unreadCount })
          );
        }
      }

      setAllRows(data);
    }
  }, [data]);

  const loadMoreMutation = useMutation({
    mutationFn: (offset: number) =>
      fetchSds<SDSNotification[]>(URL_OFFSET(offset)),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      if (data) setAllRows((prev) => [...prev, ...data]);
    },
  });

  const markMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      markasRead(loginInfo, data.key, data.isKeychain),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      setAllRows((prev) =>
        prev.map((notification) =>
          !notification.is_read ? { ...notification, is_read: 1 } : notification
        )
      );
      dispatch(saveLoginHandler({ ...loginInfo, unread_count: undefined }));
      toast.success("Marked as read");
      tempLastRead = allRows?.[0]?.time;
    },
  });
  async function handleMarkRead() {
    authenticateUser();
    if (!isAuthorized()) {
      return;
    }
    const credentials = getCredentials(getSessionKey(session?.user?.name));

    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    markMutation.mutate({
      key: credentials.key,
      isKeychain: credentials.keychainLogin,
    });
  }

  const [filterValue, setFilterValue] = React.useState<any>("");
  const [visibleColumns, setVisibleColumns] = React.useState<any>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<any>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState<any>(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<any>({
    column: "time",
    direction: "descending",
  });

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredNotifications = [...allRows];

    if (hasSearchFilter) {
      filteredNotifications = filteredNotifications.filter((notification) =>
        notification.account.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== typeOptions.length
    ) {
      filteredNotifications = filteredNotifications.filter((notification) =>
        Array.from(statusFilter).includes(notification.type)
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

  const renderCell = React.useCallback(
    (notification: SDSNotification, columnKey) => {
      const cellValue = notification[columnKey];

      switch (columnKey) {
        case "account":
          const voteValue =
            (notification.voted_rshares / globalData.recent_reward_claims) *
            globalData.total_reward_fund *
            globalData.median_price;

          return (
            <div className="flex flex-row items-center">
              <div className="flex gap-2 items-center">
                <Badge
                  showOutline={false}
                  color="success"
                  size="sm"
                  content={
                    notification.is_read || notification.time < tempLastRead
                      ? undefined
                      : ""
                  }
                  placement="bottom-right"
                  shape="circle"
                >
                  <SAvatar size="sm" username={notification.account} />
                </Badge>
                <div>
                  <Link
                    className=" hover:text-blue-500"
                    href={`/@${notification.account}`}
                  >
                    {notification.account}
                  </Link>
                  {notification.type === "vote" && (
                    <p className="text-tiny">${voteValue?.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          );

        case "time":
          return (
            <div className="text-bold text-small">
              <TimeAgoWrapper
                className="text-bold text-tiny text-default-600"
                created={notification.time * 1000}
              />
            </div>
          );
        case "type":
          return (
            <Chip
              className="capitalize border-none gap-1 text-default-600"
              color={typeColorMap[notification.type] as any}
              size="sm"
              variant="dot"
            >
              {cellValue}
            </Chip>
          );

        default:
          return cellValue;
      }
    },
    []
  );

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="flex justify-between gap-3 items-end">
          <Input
            size="sm"
            isClearable
            color="default"
            placeholder="Search..."
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="">
                <Button size="sm" variant="flat" isIconOnly color="secondary">
                  <IoFilter className="text-lg" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                emptyContent={<></>}
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
            {isSelf && (
              <Button
                size="sm"
                variant="solid"
                onPress={handleMarkRead}
                isLoading={markMutation.isPending}
                isDisabled={markMutation.isPending || !loginInfo.unread_count}
                color="primary"
                // endContent={<IoCheckmarkDone className="text-lg" />}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    allRows?.length,
    onSearchChange,
    hasSearchFilter,
    markMutation.isPending,
    loginInfo.unread_count,
  ]);

  const getTargetUrl = (item: SDSNotification): string => {
    let targetUrl = "";
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

        break;
    }
    return targetUrl;
  };

  return (
    <div className=" flex flex-col gap-4">
      <div className="">
        {isLoading ? (
          <LoadingCard />
        ) : (
          <Table
            aria-label="Notification table"
            // bottomContent={bottomContent}
            classNames={{
              base: "w-full overflow-auto mb-4 h-full",
            }}
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            onSortChange={setSortDescriptor}
            bottomContent={
              allRows?.length > 0 && !isLoading ? (
                <div className="flex w-full justify-center">
                  <Button
                    size="sm"
                    isDisabled={isLoading || loadMoreMutation.isPending}
                    isLoading={loadMoreMutation.isPending}
                    radius="full"
                    variant="shadow"
                    onPress={() => {
                      offset += 20;
                      loadMoreMutation.mutate(offset);
                    }}
                  >
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
                  <TableRow
                    onClick={() => {
                      router.push(getTargetUrl(item));
                      router.refresh();
                      props?.onClose && props.onClose();
                    }}
                    key={JSON.stringify(item)}
                    className="cursor-pointer hover:bg-foreground/10"
                  >
                    {(columnKey) => (
                      <TableCell>
                        <Link
                          prefetch={false}
                          href={getTargetUrl(item)}
                          onClick={() => {
                            props?.onClose && props.onClose();
                          }}
                        >
                          {renderCell(item, columnKey)}
                        </Link>
                      </TableCell>
                    )}
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
