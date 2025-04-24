"use client";

import { Button } from "@heroui/button";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from "@heroui/modal";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import useSWR from "swr";
import { supabase } from "@/libs/supabase";
import LoadingCard from "../LoadingCard";
import EmptyChat from "./EmptyChat";
import { toast } from "sonner";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { sendMessage } from "@/libs/steem/condenser";
import { Memo } from "@steempro/dsteem";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import { BsArrowDown } from "react-icons/bs";
import { Chip } from "@heroui/chip";
import SAvatar from "../SAvatar";
import MessageReplyRef from "./MessageReplyRef";
import ChatInput from "./ChatInput";
import sanitize from "sanitize-html";
import Messages from "./Messages";

interface Props {
  account: AccountExt;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ITEMS_PER_BATCH = 30;

export function getDecryptedData(key: string, item: Message): Message {
  const decMessage = Memo.decode(key, item.message)?.replace("#", "") || "";
  const decReply = item.ref_message
    ? Memo.decode(key, item.ref_message.message)?.replace("#", "") || ""
    : "";

  const ref_message = item.ref_message
    ? {
        ...item.ref_message,
        message: decReply,
      }
    : undefined;

  return {
    ...item,
    message: decMessage,
    ref_message,
  };
}

export default function ChatModal(props: Props) {
  const { account, isOpen, onOpenChange } = props;
  if (!account) return null;

  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messageAlert, setMessageAlert] = useState(false);
  const [refMessage, setRefMessage] = useState<Message>();
  const credentials = getCredentials();
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, error, isLoading } = useSWR<Message[]>(
    account.name ? `chat-${account.name}` : null,
    async () => {
      // delay request
      // await AsyncUtils.sleep(2);

      const { data, error } = await supabase
        .from("steempro_chat")
        .select(
          `tid,ref_tid,sender,recipient,message,timestamp,community,ref_message:ref_tid ( tid,sender,recipient,message,timestamp,community)`
        )
        .or(
          `and(sender.eq.${loginInfo.name},recipient.eq.${account.name}),and(sender.eq.${account.name},recipient.eq.${loginInfo.name})`
        )
        .order("timestamp", { ascending: false })
        .range(0, ITEMS_PER_BATCH);

      if (error) {
        toast.error(error.message);
        throw error;
      }

      const queryData = data as unknown as Message[];

      const parserData = queryData.map((item) => {
        return {
          ...item,
          ...getDecryptedData(credentials?.memo!, item),
        };
      });
      return (parserData ?? []) as Message[];
    }
  );

  useEffect(() => {
    if (data) {
      setMessages(data);
    }
  }, [data]);

  async function handleSend(_msg: string) {
    _msg = sanitize(_msg);

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
    //   },
    //   ...prev,
    // ]);
    // toast.success("Sent");
    // return;

    setIsPending(true);

    const credentials = getCredentials(getSessionKey());

    if (!credentials?.memo) {
      toast.error("Memo key not found");
      setIsPending(false);
      return;
    }

    try {
      const encMsg = Memo.encode(
        credentials.memo,
        account.memo_key,
        `#${_msg}`
      );

      await sendMessage(
        loginInfo,
        account.name,
        encMsg,
        refMessage?.tid,
        credentials?.key,
        credentials.keychainLogin
      ).then((response: any) => {
        if (response?.success) {
          const tx_id = response.tx_id;
          setMessages((prev) => [
            {
              sender: loginInfo.name,
              recipient: account.name,
              message: _msg,
              id: Math.random(),
              tid: tx_id,
              timestamp: moment().toISOString(),
              ref_tid: refMessage?.tid,
              ref_message: refMessage,
            },
            ...prev,
          ]);
          setRefMessage(undefined);
          setMessage("");
        } else throw new Error(response);
        setIsPending(false);
      });
    } catch (error: any) {
      toast.error(error?.message || JSON.stringify(error));
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
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className=" mt-4"
      scrollBehavior="inside"
      backdrop="opaque"
      size="lg"
      placement="top-center"
      classNames={{ base: "h-full" }}
      isDismissable={false}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-2 items-center text-center">
                  <p>Private Chat Room</p>
                  <Chip
                    avatar={<SAvatar username={account.name} />}
                    variant="flat"
                  >
                    {account.name}
                  </Chip>
                </div>
                <p className="text-xs font-normal text-default-500">
                  This conversation is secured with end-to-end encryption.
                </p>
              </div>
            </ModalHeader>
            <ModalBody className="scrollbar-thin pb-10" id="scrollDiv">
              <div className="flex flex-col w-full">
                <div className="flex flex-col gap-4 py-1">
                  {isLoading ? (
                    <LoadingCard />
                  ) : !messages.length ? null : (
                    <Messages
                      account={account}
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
                        //   getDecryptedData(credentials?.memo!, newMsg),
                        // ]);
                      }}
                    />
                  )}
                  <div ref={bottomRef} />
                </div>

                {data && !messages.length && (
                  <EmptyChat username={account.name} />
                )}
              </div>
            </ModalBody>

            <ModalFooter>
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
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
