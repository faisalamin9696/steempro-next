"use client";

import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { markasReadChat } from "@/libs/steem/condenser";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { useSession } from "next-auth/react";
import { Badge } from "@heroui/badge";
import SLink from "../SLink";
import TimeAgoWrapper from "../wrappers/TimeAgoWrapper";
import SAvatar from "../SAvatar";
import { useLogin } from "../auth/AuthProvider";
import TableWrapper from "../wrappers/TableWrapper";
import { supabase } from "@/libs/supabase";
import moment from "moment";
import { getUnreadChats } from "@/libs/steem/mysql";

interface Props {
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
}

const typeColorMap = {
  message: "secondary",
};

const INITIAL_VISIBLE_COLUMNS = ["sender", "latest_timestamp", "count"];

const columns = [
  { name: "SENDER", uid: "sender", sortable: true },
  { name: "TIME", uid: "latest_timestamp", sortable: true },
  { name: "MESSAGES", uid: "count", sortable: true },
];

const ITEMS_PER_BATCH = 30;

export default function ChatNotificationsTable(props: Props) {
  const { isOpen, onOpenChange } = props;

  const { data: session } = useSession();
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const isSelf = session?.user?.name === loginInfo.name;
  const { authenticateUser, isAuthorized } = useLogin();
  const dispatch = useAppDispatch();
  const [allRows, setAllRows] = useState<ChatNotification[]>([]);
  const [page, setPage] = useState(0);
  const [endReached, setEndReached] = useState(
    allRows.length < ITEMS_PER_BATCH
  );

  useEffect(() => {
    if (page) setPage(0);
  }, []);

  function getFromAndTo() {
    let from = page * ITEMS_PER_BATCH;
    let to = from + ITEMS_PER_BATCH;

    if (page > 0) {
      from += 1;
    }

    return { from, to };
  }

  const { from, to } = getFromAndTo();

  const { data, isLoading, mutate, isValidating } = useSWR(
    loginInfo.name && `chat-notifications-${loginInfo.name}`,
    () => getUnreadChats(loginInfo.name, 0, ITEMS_PER_BATCH),
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
      setPage(page + 1);
    }
  }, [data]);

  const loadMoreMutation = useMutation({
    mutationFn: () => getUnreadChats(loginInfo.name, from, to),
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
            is_read: true,
          },
        };
      });

      setAllRows(parserData);
      dispatch(
        saveLoginHandler({ ...loginInfo, unread_count_chat: undefined })
      );
      setAllRows([]);
      toast.success("Chat marked as seen");
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
  const hasSearchFilter = Boolean(filterValue);
  const filteredItems = React.useMemo(() => {
    let filteredNotifications = [...allRows];

    if (hasSearchFilter) {
      filteredNotifications = filteredNotifications.filter((notification) =>
        notification.sender.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredNotifications;
  }, [allRows, filterValue]);

  const renderCell = React.useCallback(
    (notification: ChatNotification, columnKey) => {
      const cellValue = notification[columnKey];
      switch (columnKey) {
        case "sender":
          return (
            <div className="flex flex-row items-center">
              <div className="flex gap-2 items-center">
                <SAvatar size="1xs" username={notification.sender} />
                <div>
                  <SLink
                    className=" hover:text-blue-500"
                    href={`/@${notification.sender}/chat`}
                  >
                    {notification.sender}
                  </SLink>
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
        case "count":
          return (
            <Chip
              className="capitalize border-none gap-1 text-default-600"
              color={typeColorMap["message"] as any}
              size="sm"
              variant="flat"
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

  const getTargetUrl = (item: ChatNotification): string => {
    let targetUrl = `/@${item.sender}/${"chat"}`;
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
                variant="solid"
                onPress={handleMarkRead}
                isLoading={markMutation.isPending}
                isDisabled={
                  markMutation.isPending || !loginInfo.unread_count_chat
                }
                color="secondary"
                // endContent={<IoCheckmarkDone className="text-lg" />}
              >
                Mark all as seen
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
        <SLink href={getTargetUrl(item)} onClick={() => onOpenChange(!isOpen)}>
          {children}
        </SLink>
      )}
    />
  );
}
