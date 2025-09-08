import React, { useEffect, useRef, useState } from "react";
import SModal from "../../ui/SModal";
import { useAppSelector } from "@/constants/AppFunctions";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { getCredentials, getSessionKey } from "@/utils/user";
import { useSession } from "next-auth/react";
import { Memo } from "@steempro/dsteem";
import { supabase } from "@/libs/supabase";
import useSWR from "swr";
import { toast } from "sonner";
import { sendMessage } from "@/libs/steem/condenser";
import sanitize from "sanitize-html";
import moment from "moment";
import { Chip } from "@heroui/chip";
import SAvatar from "../../ui/SAvatar";
import EmptyChat from "../components/EmptyChat";
import LoadingCard from "../../LoadingCard";
import Messages from "./Messages";
import { Button } from "@heroui/button";
import { BsArrowDown } from "react-icons/bs";
import { twMerge } from "tailwind-merge";
import ChatInput from "../components/ChatInput";
import MessageReplyRef from "../components/MessageReplyRef";

const ITEMS_PER_BATCH = 30;

export function getDecryptedData(key: string, item: Message): Message {
  try {
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
  } catch (error) {
    return item;
  }
}

function ChatModal({
  isOpen,
  onOpenChange,
  account,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  account: AccountExt;
}) {
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
  const { data: session } = useSession();
  const { isMobile } = useDeviceInfo();

  const { data, error, isLoading } = useSWR<Message[]>(
    session?.user?.name && account.name ? `chat-${account.name}` : null,
    async () => {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_user_chat",
        {
          sender_usr: session!.user!.name,
          recipient_usr: account.name,
          from_limit: 0,
          to_limit: ITEMS_PER_BATCH,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      const queryData = rpcData as Message[];

      const parsedData = queryData.map((item) => ({
        ...item,
        ...getDecryptedData(credentials?.memo!, item),
      }));

      return parsedData;
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(error?.message || String(error));
    }

    if (data && !error) {
      setMessages(data);
    }
  }, [data, error]);

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

    const credentials = getCredentials(getSessionKey(session?.user?.name));

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
        undefined,
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
    <SModal
      modalProps={{
        scrollBehavior: "inside",
        isDismissable: false,
        backdrop: "blur",
        classNames: { base: "h-full" },
        size: isMobile ? "full" : "xl",
      }}
      title={() => (
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-2 items-center text-center">
            <p>Private Chat Room</p>
            <Chip avatar={<SAvatar username={account.name} />} variant="flat">
              {account.name}
            </Chip>
          </div>
        </div>
      )}
      subTitle={() =>
        "This conversation is secured with end-to-end encryption."
      }
      body={() => (
        <div className="scrollbar-thin pb-10" id="scrollDiv">
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

            {data && !messages.length && <EmptyChat username={account.name} />}
          </div>
        </div>
      )}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
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

export default ChatModal;
