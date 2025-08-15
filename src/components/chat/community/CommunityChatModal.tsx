"use client";

import { Button } from "@heroui/button";
import React, { useEffect, useRef, useState } from "react";
import { mapSds, useAppSelector } from "@/constants/AppFunctions";
import useSWR from "swr";
import { supabase } from "@/libs/supabase";
import LoadingCard from "../../LoadingCard";
import EmptyChat from "../components/EmptyChat";
import { toast } from "sonner";
import { getCredentials, getSessionKey } from "@/utils/user";
import { sendMessage } from "@/libs/steem/condenser";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import { BsArrowDown } from "react-icons/bs";
import { Chip } from "@heroui/chip";
import SAvatar from "../../ui/SAvatar";
import MessageReplyRef from "../components/MessageReplyRef";
import ChatInput from "../components/ChatInput";
import sanitize from "sanitize-html";
import { useSession } from "next-auth/react";
import { hasNsfwTag } from "@/utils/stateFunctions";
import { empty_comment } from "@/constants/Placeholders";
import CommunityMessages from "./CommunityMessages";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import SModal from "@/components/ui/SModal";
import { useTranslation } from "@/utils/i18n";

interface Props {
  community: Community;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ITEMS_PER_BATCH = 30;

export default function CommunityChatModal(props: Props) {
  const { t } = useTranslation();
  const { community, isOpen, onOpenChange } = props;
  if (!community) return null;

  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messageAlert, setMessageAlert] = useState(false);
  const [refMessage, setRefMessage] = useState<Message>();
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const members: Role[] = mapSds(community?.roles) ?? [];
  const { isMobile } = useDeviceInfo();

  const isMuted = members.filter(
    (item) => item.account === loginInfo.name && item.role === "muted"
  );

  const { data, error, isLoading } = useSWR<Message[]>(
    session?.user?.name && community.account
      ? `chat-${community.account}`
      : null,
    async () => {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_community_chat",
        {
          community_account: community.account,
          from_limit: 0,
          to_limit: ITEMS_PER_BATCH,
        }
      );

      if (rpcError) {
        throw new Error(rpcError?.message);
      }

      const queryData = rpcData as Message[];

      return queryData;
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(t('common.error_occurred', { error: error?.message || String(error) }));
    }

    if (data && !error) {
      setMessages(data);
    }
  }, [data, error]);

  async function handleSend(_msg: string) {
    _msg = sanitize(_msg);
    const isNsfw = hasNsfwTag(
      empty_comment(loginInfo.name, loginInfo.name, _msg)
    );

    if (isMuted?.length) {
      toast.warning(t("community.muted_by_admins"));
      return;
    }

    if (isNsfw) {
      toast.warning(t("community.nsfw_not_allowed"));
      return;
    }

    // testing
    // setMessages((prev) => [
    //   {
    //     sender: loginInfo.name,
    //     recipient: account.name,
    //     message: _msg,
    //     id: Math.random(),
    //     tid: Math.random().toString(),
    //     timestamp: moment().toISOString(),
    //     ref_tid: refMessage?.tid,
    //     ref_message: refMessage,
    //     community:community.account
    //   },
    //   ...prev,
    // ]);
    // toast.success("Sent");
    // return;

    setIsPending(true);

    const credentials = getCredentials(getSessionKey(session?.user?.name));

    if (!credentials) {
      toast.error(t("reply.invalid_credentials"));
      return;
    }

    try {
      await sendMessage(
        loginInfo,
        community.account,
        _msg,
        refMessage?.tid,
        credentials?.key,
        community.account,
        credentials.keychainLogin
      ).then((response: any) => {
        if (response?.success) {
          const tx_id = response.tx_id;
          setMessages((prev) => [
            {
              sender: loginInfo.name,
              recipient: community.account,
              message: _msg,
              id: Math.random(),
              tid: tx_id,
              timestamp: moment().toISOString(),
              ref_tid: refMessage?.tid,
              ref_message: refMessage,
              community: community.account,
            },
            ...prev,
          ]);
          setRefMessage(undefined);
          setMessage("");
        } else throw new Error(response);
        setIsPending(false);
      });
    } catch (error: any) {
      toast.error(t('common.error_occurred', { error: error?.message || JSON.stringify(error) }));
      setIsPending(false);
    }
  }

  function scrollToBottom() {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      setMessageAlert(false);
    }
  }

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{
        size: isMobile ? "full" : "lg",
        classNames: { base: "h-full" },
        isDismissable: false,
        scrollBehavior: "inside",
        backdrop: "blur",
      }}
      title={() => (
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-2 items-center text-center">
            <p>{t("community.community_chat")}</p>
            <Chip
              avatar={<SAvatar username={community.account} />}
              variant="flat"
            >
              {community.title || community.account}
            </Chip>
          </div>
        </div>
      )}
      subTitle={() => t("community.public_conversation")}
      body={() => (
        <div className="scrollbar-thin pb-10" id="scrollDiv">
          <div className="flex flex-col w-full">
            <div className="flex flex-col gap-4 py-1">
              {isLoading ? (
                <LoadingCard />
              ) : !messages.length ? null : (
                <CommunityMessages
                  community={community}
                  messages={messages}
                  setRefMessage={(message) => {
                    setRefMessage(message);
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 200);
                  }}
                  messageAlert={messageAlert}
                  setMessageAlert={setMessageAlert}
                  handleNewMessage={(newMsg) => {
                    // setMessages((prev) => [
                    //   ...prev,
                    //    newMsg,
                    // ]);
                  }}
                />
              )}
              <div ref={bottomRef} />
            </div>

            {data && !messages.length && (
              <EmptyChat username={t('community.community_members')} />
            )}
          </div>
        </div>
      )}
      footer={() => (
        <div className="sticky bottom-4 rounded-md flex flex-row items-center w-full gap-4">
          {refMessage && (
            <MessageReplyRef
              fullWidth
              className="absolute left-0 bottom-14 transition-opacity duration-300"
              text={refMessage.message}
              handleClose={() => setRefMessage(undefined)}
            />
          )}

          <ChatInput
            skipMemo
            ref={inputRef}
            value={message}
            onValueChange={setMessage}
            onSubmit={handleSend}
            isPending={isPending}
          />

          {messageAlert && (
            <Button
              onPress={scrollToBottom}
              color="default"
              variant="solid"
              size="sm"
              isIconOnly
              radius="full"
              className={twMerge(
                `absolute right-1 bottom-20 transition-opacity duration-300`,
                messageAlert ? " opacity-100" : " opacity-0"
              )}
            >
              <BsArrowDown size={18} />
            </Button>
          )}
        </div>
      )}
    />
  );
}
