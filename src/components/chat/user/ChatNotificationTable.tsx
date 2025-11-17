"use client";

import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { Button } from "@heroui/button";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { markasReadChat } from "@/libs/steem/condenser";
import { getCredentials, getSessionKey } from "@/utils/user";
import { useSession } from "next-auth/react";
import SLink from "../../ui/SLink";
import SAvatar from "../../ui/SAvatar";
import { useLogin } from "../../auth/AuthProvider";
import { getUnreadChatsHeads } from "@/libs/steem/mysql";
import { Memo } from "@steempro/dsteem";
import { MdOutlineRefresh } from "react-icons/md";
import { addCommonDataHandler } from "@/hooks/redux/reducers/CommonReducer";
import STable from "@/components/ui/STable";
import { Chip } from "@heroui/chip";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import moment from "moment";
import { Spinner } from "@heroui/spinner";

interface Props {
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
}

const ITEMS_PER_BATCH = 30;

export default function ChatNotificationsTable(props: Props) {
  const { isOpen, onOpenChange } = props;

  const { data: session } = useSession();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const isSelf = session?.user?.name === loginInfo.name;
  let { authenticateUser, isAuthorized, credentials } = useLogin();
  const dispatch = useAppDispatch();
  const [allRows, setAllRows] = useState<UnReadChat[]>([]);
  const [page, setPage] = useState(1);
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

  const [isEndReached, setIsEndReached] = useState(
    (data?.length || 0) < ITEMS_PER_BATCH
  );

  useEffect(() => {
    if (data) {
      setAllRows(data);
      if (data.length < ITEMS_PER_BATCH) {
        setIsEndReached(true);
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
          setIsEndReached(true);
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

  const getTargetUrl = (item: UnReadChat): string => {
    let targetUrl = `/@${item.sender_usr}${"?chat"}`;
    return targetUrl;
  };

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-row gap-2">
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
                allRows.reduce((sum, item) => sum + item.message_count, 0) < 1)
            }
            color="secondary"
            // endContent={<IoCheckmarkDone className="text-lg" />}
          >
            Mark as seen
          </Button>
        )}
      </div>
    );
  }, [allRows, markMutation.isPending, loginInfo, isValidating, isSelf]);

  return (
    <div>
      <STable
        isLoading={isLoading}
        skipCard={isSelf}
        cardClassName="bg-transparent"
        title={!isSelf ? null : "Chats"}
        subTitle={() => topContent}
        filterByValue={["sender_usr"]}
        titleWrapperClassName="flex-row"
        data={allRows}
        bodyClassName={
          isSelf ? "flex flex-col gap-2" : "grid grid-cols-1 sm:grid-cols-2"
        }
        itemsPerPage={ITEMS_PER_BATCH}
        titleClassName="pb-4 w-full"
        tableRow={(chat: UnReadChat) => {
          return (
            <SLink
              href={getTargetUrl(chat)}
              className="flex gap-2 items-center"
              onClick={() => {
                onOpenChange(!isOpen);
              }}
            >
              <SAvatar size="1xs" username={chat.sender_usr} />
              <div className="flex flex-col gap-1">
                <div className="flex flex-row items-center gap-2">
                  <SLink
                    className=" hover:text-blue-500 text-sm"
                    href={`/@${chat.sender_usr}?chat`}
                  >
                    {chat.sender_usr}
                  </SLink>

                  {!!chat.message_count && (
                    <Chip
                      className="capitalize border-none gap-1"
                      color={chat.is_self ? "default" : "secondary"}
                      size="sm"
                      variant="solid"
                    >
                      {chat.message_count}
                    </Chip>
                  )}
                </div>

                <div className=" flex flex-row items-center gap-1">
                  {chat.is_self && (
                    <p className="text-sm opacity-70 font-bold text-blue-500">
                      {chat.is_self ? "You:" : ""}
                    </p>
                  )}
                  {credentials?.memo ? (
                    <div className="w-20 md:w-40">
                      <p className="truncate text-sm opacity-70">
                        {Memo.decode(
                          credentials.memo,
                          chat.latest_message
                        )?.replace("#", "")}
                      </p>
                    </div>
                  ) : (
                    <p
                      className="text-sm opacity-70 cursor-pointer"
                      onClick={handleAddMemo}
                    >
                      Encrypted message
                    </p>
                  )}
                </div>

                <TimeAgoWrapper
                  className="text-tiny text-default-500"
                  created={moment(chat.latest_timestamp).unix() * 1000}
                />
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
          items?.length === allRows?.length &&
          !isEndReached ? (
            <div className="flex w-full justify-center">
              <Button
                size="sm"
                isDisabled={isLoading || loadMoreMutation.isPending}
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
      />
    </div>
  );
}
