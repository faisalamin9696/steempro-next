"use client";

import {
  capitalize,
  DefaultNotificationFilters,
} from "@/constants/AppConstants";
import {
  fetchSds,
  useAppDispatch,
  useAppSelector,
} from "@/constants/AppFunctions";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import SAvatar from "./ui/SAvatar";
import TimeAgoWrapper from "./wrappers/TimeAgoWrapper";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { validateCommunity } from "@/utils/helper";
import { markasRead } from "@/libs/steem/condenser";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { useSession } from "next-auth/react";
import { Badge } from "@heroui/badge";
import SLink from "./ui/SLink";
import TableWrapper from "./wrappers/TableWrapper";
import { CustomCheckbox } from "./CustomCheckbox";
import { CheckboxGroup } from "@heroui/checkbox";
import { MdOutlineRefresh } from "react-icons/md";
import { addCommonDataHandler } from "@/hooks/redux/reducers/CommonReducer";

interface Props {
  username: string;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
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
  { name: "TIME", uid: "time", sortable: true },
  { name: "TYPE", uid: "type", sortable: true },
];

const typeOptions = [
  { name: "vote", uid: "vote" },
  { name: "Reply", uid: "reply" },
  { name: "Mention", uid: "mention" },
  { name: "Resteem", uid: "resteem" },
  { name: "Follow", uid: "follow" },
];

let offset = {};
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

const ITEMS_PER_BATCH = 50;
let tempLastRead = 0;
export default function NotificationsTable(props: Props) {
  const { isOpen, username, onOpenChange } = props;
  const commonData = useAppSelector((state) => state.commonReducer.values);

  function getOffset(): number {
    return offset?.[username] || 0;
  }
  useEffect(() => {
    return () => {
      if (offset[username]) offset[username] = 0;
    };
  }, []);

  function updateOffset() {
    if (offset[username]) offset[username] += ITEMS_PER_BATCH;
    else offset[username] = ITEMS_PER_BATCH;
  }

  if (!username) return null;

  const URL = `/notifications_api/getFilteredNotificationsByStatus/${username}/all/${JSON.stringify(
    filter
  )}/${ITEMS_PER_BATCH}`;
  function URL_OFFSET(_offset: number) {
    return `/notifications_api/getFilteredNotificationsByStatus/${username}/all/${JSON.stringify(
      filter
    )}/${ITEMS_PER_BATCH}/${_offset}`;
  }

  const { data: session } = useSession();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const isSelf = session?.user?.name === username;
  const { authenticateUser, isAuthorized } = useLogin();
  const dispatch = useAppDispatch();
  const [allRows, setAllRows] = useState<SDSNotification[]>([]);
  const [groupSelected, setGroupSelected] = React.useState<string[]>([]);

  const { data, isLoading, mutate, isValidating } = useSWR(
    URL,
    fetchSds<SDSNotification[]>,
    {
      refreshInterval: 300000,
    }
  );


  useEffect(() => {
    if (data) {
      if (isSelf) {
        const unreadCount = data.filter((obj) => obj.is_read === 0).length;
        if (
          (unreadCount >= 0 && unreadCount > commonData.unread_count) ||
          unreadCount < ITEMS_PER_BATCH
        ) {
          dispatch(addCommonDataHandler({ unread_count: unreadCount }));
        }
      }

      setAllRows(data);
    }
  }, [data]);

  const loadMoreMutation = useMutation({
    mutationFn: (_offset: number) =>
      fetchSds<SDSNotification[]>(URL_OFFSET(_offset)),
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
      dispatch(addCommonDataHandler({ unread_count: 0 }));
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
  const [statusFilter, setStatusFilter] = React.useState<any>("all");

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredNotifications = [...allRows];

    if (hasSearchFilter) {
      filteredNotifications = filteredNotifications.filter((notification) =>
        notification.account.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      groupSelected.length > 0 &&
      groupSelected.length !== typeOptions.length
    ) {
      filteredNotifications = filteredNotifications.filter((notification) =>
        groupSelected.includes(notification.type)
      );
    }

    return filteredNotifications;
  }, [allRows, filterValue, groupSelected]);

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
                  className="h-2 w-2"
                  showOutline={false}
                  color="success"
                  size="sm"
                  isInvisible={
                    !!notification.is_read || notification.time < tempLastRead
                  }
                  placement="bottom-right"
                  shape="circle"
                >
                  <SAvatar size="1xs" username={notification.account} />
                </Badge>
                <div>
                  <SLink
                    className=" hover:text-blue-500"
                    href={`/@${notification.account}`}
                  >
                    {notification.account}
                  </SLink>
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
    [globalData]
  );

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex gap-3">
            {isSelf && (
              <Button
                size="sm"
                isIconOnly
                isLoading={isValidating}
                onPress={() => mutate()}
              >
                <MdOutlineRefresh size={18} />
              </Button>
            )}
            {isSelf && (
              <Button
                size="sm"
                variant="solid"
                onPress={handleMarkRead}
                isLoading={markMutation.isPending}
                isDisabled={markMutation.isPending || !commonData.unread_count}
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
    allRows,
    hasSearchFilter,
    markMutation.isPending,
    loginInfo,
    isValidating,
    isSelf,
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
    <TableWrapper
      filteredItems={filteredItems}
      filterValue={filterValue}
      renderCell={renderCell}
      skipPaging
      isCompact={false}
      isLoading={isLoading}
      stickyTop={isSelf}
      topRowContent={
        <div className="flex flex-col gap-1 w-full px-1">
          <CheckboxGroup
            className="gap-1"
            orientation="horizontal"
            value={groupSelected}
            onValueChange={setGroupSelected}
          >
            {typeOptions.map((status) => (
              <CustomCheckbox
                className="capitalize"
                key={status.uid}
                value={status.uid}
              >
                {capitalize(status.name)}
              </CustomCheckbox>
            ))}
          </CheckboxGroup>
        </div>
      }
      classNames={{
        base: ["w-full", "overflow-auto", "mb-4", "h-full"],
      }}
      sortDescriptor={{ column: "time", direction: "descending" }}
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
      tableColumns={columns}
      onFilterValueChange={setFilterValue}
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
                updateOffset();
                loadMoreMutation.mutate(getOffset());
              }}
            >
              Load More
            </Button>
          </div>
        ) : null
      }
      topContentDropdown={topContent}
      cellWrapper={(item, children) => (
        <SLink href={getTargetUrl(item)} onClick={() => onOpenChange(!isOpen)}>
          {children}
        </SLink>
      )}
    />
  );
}
