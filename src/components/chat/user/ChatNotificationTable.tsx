"use client";

import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { markasReadChat } from "@/libs/steem/condenser";
import { getCredentials, getSessionKey } from "@/utils/user";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { useSession } from "next-auth/react";
import SLink from "../../ui/SLink";
import TimeAgoWrapper from "../../wrappers/TimeAgoWrapper";
import SAvatar from "../../ui/SAvatar";
import { useLogin } from "../../auth/AuthProvider";
import TableWrapper from "../../wrappers/TableWrapper";
import moment from "moment";
import { getUnreadChatsHeads } from "@/libs/steem/mysql";
import { Memo } from "@steempro/dsteem";
import { MdOutlineRefresh } from "react-icons/md";
import { addCommonDataHandler } from "@/hooks/redux/reducers/CommonReducer";

interface Props {
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
}

const INITIAL_VISIBLE_COLUMNS = [
  "sender_usr",
  "latest_timestamp",
  "message_count",
];

const columns = [
  { name: "USER", uid: "sender_usr", sortable: true },
  { name: "TIME", uid: "latest_timestamp", sortable: true },
  { name: "MESSAGES", uid: "message_count", sortable: true },
];

const ITEMS_PER_BATCH = 30;

export default function ChatNotificationsTable(props: Props) {
  const { isOpen, onOpenChange } = props;

  const { data: session } = useSession();
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const isSelf = session?.user?.name === loginInfo.name;
  let { authenticateUser, isAuthorized, credentials } = useLogin();
  const dispatch = useAppDispatch();
  const [allRows, setAllRows] = useState<UnReadChat[]>([]);
  const [page, setPage] = useState(1);
  const [endReached, setEndReached] = useState(false);
  const commonData = useAppSelector((state) => state.commonReducer.values);

  function getFromAndTo() {
    let from = page * ITEMS_PER_BATCH;
    let to = from + ITEMS_PER_BATCH;

    if (page > 0) {
      from += 1;
    }

    return { from, to };
  }

  const { data, isLoading, mutate, isValidating } = useSWR(
    loginInfo.name && `chat-notifications-${loginInfo.name}`,
    () => {
      const { from, to } = getFromAndTo();
      return getUnreadChatsHeads(loginInfo.name, 0, to - 1);
    },
    {
      refreshInterval: 300000,
    }
  );

  useEffect(() => {
    if (data) {
      setAllRows(data);
      if (data.length < ITEMS_PER_BATCH) {
        setEndReached(true);
      }
    }
  }, [data]);

  function handleAddMemo() {
    authenticateUser(false, true);
    if (!isAuthorized(true)) {
      return;
    }
  }
  const loadMoreMutation = useMutation({
    mutationFn: () => {
      const { from, to } = getFromAndTo();
      return getUnreadChatsHeads(loginInfo.name, from, to);
    },
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      if (data) {
        setAllRows((prev) => [...prev, ...data]);
        setPage(page + 1);
        if (data.length < ITEMS_PER_BATCH) {
          setEndReached(true);
        }
      }
    },
  });

  const markMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      markasReadChat(loginInfo, data.key, data.isKeychain),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      const parserData = allRows.map((item) => {
        return {
          ...item,
          ...{
            message_count: 0,
          },
        };
      });

      setAllRows(parserData);
      dispatch(addCommonDataHandler({ unread_count_chat: 0 }));
      toast.success("Chat marked as seen");
    },
  });

  async function handleMarkRead() {
    authenticateUser();
    if (!isAuthorized()) {
      return;
    }

    credentials = getCredentials(getSessionKey(session?.user?.name));

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
  const hasSearchFilter = Boolean(filterValue);
  const filteredItems = React.useMemo(() => {
    let filteredNotifications = [...allRows];

    if (hasSearchFilter) {
      filteredNotifications = filteredNotifications.filter((notification) =>
        notification.sender_usr
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }
    return filteredNotifications;
  }, [allRows, filterValue]);

  const renderCell = React.useCallback(
    (notification: UnReadChat, columnKey) => {
      const cellValue = notification[columnKey];
      switch (columnKey) {
        case "sender_usr":
          return (
            <div className="flex flex-col gap-1 items-start">
              <div className="flex gap-2 items-center">
                <SAvatar size="1xs" username={notification.sender_usr} />
                <div className="flex flex-col gap-1">
                  <SLink
                    className=" hover:text-blue-500"
                    href={`/@${notification.sender_usr}?chat`}
                  >
                    {notification.sender_usr}
                  </SLink>
                  <div className=" flex flex-row items-center gap-1">
                    <p className="text-tiny opacity-70 font-bold text-blue-500">
                      {notification.is_self ? "You:" : ""}
                    </p>
                    {credentials?.memo ? (
                      <div className="w-20 md:w-40">
                        <p className="truncate text-sm opacity-disabled">
                          {Memo.decode(
                            credentials.memo,
                            notification.latest_message
                          )?.replace("#", "")}
                        </p>
                      </div>
                    ) : (
                      <p
                        className="text-tiny opacity-disabled cursor-pointer"
                        onClick={handleAddMemo}
                      >
                        Encrypted message
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );

        case "latest_timestamp":
          return (
            <div className="text-bold text-small">
              <TimeAgoWrapper
                className="text-bold text-tiny text-default-600"
                created={moment(notification.latest_timestamp).unix() * 1000}
              />
            </div>
          );
        case "message_count":
          return notification.message_count > 0 ? (
            <Chip
              className="capitalize border-none gap-1"
              color={notification.is_self ? "default" : "secondary"}
              size="sm"
              variant="solid"
            >
              {cellValue}
            </Chip>
          ) : null;

        default:
          return cellValue;
      }
    },
    [globalData]
  );

  const getTargetUrl = (item: UnReadChat): string => {
    let targetUrl = `/@${item.sender_usr}${"?chat"}`;
    return targetUrl;
  };

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
                isDisabled={
                  markMutation.isPending ||
                  (commonData.unread_count_chat < 1 &&
                    allRows.reduce((sum, item) => sum + item.message_count, 0) <
                      1)
                }
                color="secondary"
                // endContent={<IoCheckmarkDone className="text-lg" />}
              >
                Mark as seen
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    allRows,
    hasSearchFilter,
    markMutation.isPending,
    loginInfo,
    isValidating,
    isSelf,
  ]);

  return (
    <TableWrapper
      filteredItems={filteredItems}
      filterValue={filterValue}
      renderCell={renderCell}
      skipPaging
      isCompact={false}
      isLoading={isLoading}
      stickyTop={isSelf}
      classNames={{
        base: ["w-full", "overflow-auto", "mb-4", "h-full"],
      }}
      sortDescriptor={{ column: "time", direction: "descending" }}
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
      tableColumns={columns}
      onFilterValueChange={setFilterValue}
      bottomContent={
        !isLoading && allRows.length ? (
          <div className="flex w-full justify-center">
            <Button
              size="sm"
              isDisabled={isLoading || loadMoreMutation.isPending || endReached}
              isLoading={loadMoreMutation.isPending}
              radius="full"
              variant="shadow"
              onPress={() => {
                loadMoreMutation.mutate();
              }}
            >
              Load More
            </Button>
          </div>
        ) : null
      }
      topContentDropdown={topContent}
      cellWrapper={(item, children) => (
        <SLink
          href={getTargetUrl(item)}
          onClick={() => {
            onOpenChange(!isOpen);
          }}
        >
          {children}
        </SLink>
      )}
    />
  );
}
