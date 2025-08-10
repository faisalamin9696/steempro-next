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
import { useSession } from "next-auth/react";
import { Badge } from "@heroui/badge";
import SLink from "./ui/SLink";
import { MdOutlineRefresh } from "react-icons/md";
import { addCommonDataHandler } from "@/hooks/redux/reducers/CommonReducer";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { IoFilterOutline } from "react-icons/io5";
import STable from "./ui/STable";
import { Spinner } from "@heroui/spinner";

interface Props {
  username: string;
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const sortOptions = [
  { name: "All", uid: "all" },
  { name: "Vote", uid: "vote" },
  { name: "Reply", uid: "reply" },
  { name: "Mention", uid: "mention" },
  { name: "Resteem", uid: "resteem" },
  { name: "Follow", uid: "follow" },
];

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
  const { username, isOpen, onOpenChange } = props;
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
  const { data, isLoading, mutate, isValidating } = useSWR(
    URL,
    fetchSds<SDSNotification[]>,
    {
      refreshInterval: 300000,
    }
  );

  const [isEndReached, setIsEndReached] = useState(false);

  const [sortBY, setSortBy] = React.useState<
    "vote" | "reply" | "mention" | "follow" | "all"
  >("all");

  const filteredItems = React.useMemo(() => {
    let sortedItems = [...allRows];

    if (sortBY === "all") {
      return sortedItems;
    }
    // Apply sorting
    sortedItems = sortedItems?.filter((item) => item.type === sortBY);

    return sortedItems;
  }, [allRows, sortBY]);

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

      if (data.length < ITEMS_PER_BATCH) {
        setIsEndReached(true);
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
      if (data) {
        if (data?.length < ITEMS_PER_BATCH) {
          setIsEndReached(true);
        }
        setAllRows((prev) => [...prev, ...data]);
      }
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

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4 p-1">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex gap-3">
            {isSelf && (
              <Button
                size="sm"
                isIconOnly
                variant="flat"
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
  }, [allRows, markMutation.isPending, loginInfo, isValidating, isSelf]);

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
    <div>
      <STable
        isLoading={isLoading}
        skipCard={isSelf}
        title={!isSelf ? null : "Notifications"}
        titleWrapperClassName="flex-row"
        subTitle={() => topContent}
        filterByValue={["account", "type"]}
        searchEndContent={
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="flat"
                startContent={<IoFilterOutline size={18} />}
                className="font-semibold text-small"
              >
                {sortOptions?.find((s) => s.uid === sortBY)?.name}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={true}
              selectedKeys={[sortBY]}
              selectionMode="single"
              onSelectionChange={(item) =>
                setSortBy(item.currentKey?.toString() as any)
              }
            >
              {sortOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {capitalize(status.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        }
        data={filteredItems}
        bodyClassName={
          isSelf ? "flex flex-col gap-2" : "grid grid-cols-1 sm:grid-cols-2"
        }
        itemsPerPage={ITEMS_PER_BATCH}
        titleClassName="pb-4 w-full"
        tableRow={(notification: SDSNotification) => {
          const voteAmount = (
            (notification.voted_rshares / globalData.recent_reward_claims) *
            globalData.total_reward_fund *
            globalData.median_price
          )?.toLocaleString();

          const isVote = notification.type === "vote";
          return (
            <SLink
              onClick={() => onOpenChange?.(!isOpen)}
              href={getTargetUrl(notification)}
              className="flex gap-2 items-start"
            >
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

              <div className=" flex flex-col gap-2">
                <div className="flex flex-row gap-2 items-center">
                  <SLink
                    className=" hover:text-blue-500"
                    href={`/@${notification.account}`}
                  >
                    {notification.account}
                  </SLink>

                  <Chip
                    className="capitalize border-none gap-1 text-default-600"
                    color={typeColorMap[notification.type] as any}
                    size="sm"
                    variant={isVote ? "flat" : "dot"}
                  >
                    {isVote ? `$${voteAmount}` : `${notification.type}`}
                  </Chip>
                </div>

                <div className="flex flex-row gap-2">
                  <TimeAgoWrapper
                    className="text-bold text-default-600"
                    created={notification.time * 1000}
                  />
                  {/* •
                  <p className="text-bold text-xs capitalize">
                    {notification.percent / 100}%
                  </p> */}
                </div>
              </div>
            </SLink>
          );
        }}
        loader={
          <div className="flex flex-row w-full justify-center">
            <Spinner size="sm" />
          </div>
        }
        endContent={(items) =>
          allRows?.length > 0 &&
          (items?.length || 0) <= allRows?.length &&
          !isEndReached ? (
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
                {loadMoreMutation.isPending ? "Loading" : `Load more`}
              </Button>
            </div>
          ) : null
        }
      />
    </div>
  );
}
