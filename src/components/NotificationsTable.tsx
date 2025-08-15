"use client";

import { NotificationFilter } from "@/constants/AppConstants";
import {
  fetchSds,
  useAppDispatch,
  useAppSelector,
} from "@/constants/AppFunctions";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import React, { useState } from "react";
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
import { addCommonDataHandler } from "@/hooks/redux/reducers/CommonReducer";
import InfiniteScroll from "./ui/InfiniteScroll";
import { Input } from "@heroui/input";
import { FaSearch } from "react-icons/fa";
import NotificationSortingControls from "./NotificationSortingControls";
import moment from "moment";
import { mutate, useSWRConfig } from "swr";
import { MdOutlineRefresh } from "react-icons/md";
import { unstable_serialize } from "swr/infinite";
import { useTranslation } from "@/utils/i18n";

interface Props {
  username: string;
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
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

const ITEMS_PER_BATCH = 50;
let tempLastRead = 0;

export default function NotificationsTable(props: Props) {
  const { mutate } = useSWRConfig();

  const { username, isOpen, onOpenChange } = props;
  const commonData = useAppSelector((state) => state.commonReducer.values);
  const getKey = (
    pageIndex: number,
    previousPageData: SDSNotification[] | null
  ) => {
    if (previousPageData && previousPageData.length === 0) return null;

    return `/notifications_api/getFilteredNotificationsByStatus/${username}/all/${JSON.stringify(
      NotificationFilter
    )}/${ITEMS_PER_BATCH}/${pageIndex * ITEMS_PER_BATCH}`;
  };
  if (!username) return null;
  const [query, setQuery] = useState("");

  const { data: session } = useSession();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const isSelf = session?.user?.name === username;
  const { authenticateUser, isAuthorized } = useLogin();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  
  const [sorting, setSorting] = React.useState<
    "vote" | "reply" | "mention" | "follow" | "all"
  >("all");

  const markMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      markasRead(loginInfo, data.key, data.isKeychain),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }

      mutate(`unread-notification-count-${username}`, 0, {
        revalidate: false,
        rollbackOnError: true,
        populateCache: true,
      });

      dispatch(addCommonDataHandler({ unread_count: 0 }));
      tempLastRead = moment().unix();
      toast.success(t("notifications.mark_all_as_read"));
    },
  });

  async function handleMarkRead() {
    authenticateUser();
    if (!isAuthorized()) {
      return;
    }
    const credentials = getCredentials(getSessionKey(session?.user?.name));

    if (!credentials?.key) {
      toast.error(t('common.invalid_credentials'));
      return;
    }

    markMutation.mutate({
      key: credentials.key,
      isKeychain: credentials.keychainLogin,
    });
  }

  const topContent = (
    <div className="flex flex-row items-center justify-between gap-4">
      <Input
        startContent={<FaSearch className="text-default-500" />}
        placeholder="Search..."
        className="max-w-lg flex-1"
        value={query}
        onValueChange={setQuery}
        isClearable
      />
      <div className="flex gap-3">
        {/* {isSelf && (
          <Button
            size="sm"
            isIconOnly
            variant="flat"
            onPress={() => {
              toast.success("Refreshing");
            }}
          >
            <MdOutlineRefresh size={18} />
          </Button>
        )} */}
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
            {t("notifications.mark_all_as_read")}
          </Button>
        )}
      </div>
    </div>
  );

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
    <div className="flex flex-col gap-4">
      {topContent}

      <div className="mb-4">
        <NotificationSortingControls
          currentSort={sorting}
          onSortChange={setSorting}
        />
      </div>

      <InfiniteScroll<SDSNotification>
        revalidateIfStale
        getKey={getKey}
        itemsClassName={
          isSelf
            ? "flex flex-col gap-4"
            : "grid grid-cols-1 gap-4 sm:grid-cols-2"
        }
        fetcher={fetchSds}
        keyExtractor={(notification) => notification.id?.toString() || ""}
        renderItem={(notification) => {
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
              className="flex gap-2 items-start border-b-1 border-default-900/20 pb-4"
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
                    className=" hover:text-blue-500 text-sm"
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
        pageSize={ITEMS_PER_BATCH} // Make sure this matches your API's page size
        filterItems={[
          (item) => item.account?.includes(query.toLowerCase().trim()),
          (item) => item.type === sorting || sorting === "all",
        ]}
      />
    </div>
  );
}
