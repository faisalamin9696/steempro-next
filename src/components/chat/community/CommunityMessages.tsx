"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector } from "@/constants/AppFunctions";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import MessageItem from "../components/MessageItem";
import useRealtimeCommunityMsgs from "@/hooks/useRealtimeCommunityMsgs";

interface MessagesProps {
  community: Community;
  messages: Message[];
  setRefMessage: (message: Message) => void;
  setMessageAlert: (show: boolean) => void;
  handleNewMessage: (msg: Message) => void;
  messageAlert: boolean;
}

const ITEMS_PER_BATCH = 30;

const CommunityMessages = (props: MessagesProps) => {
  const {
    community,
    setMessageAlert,
    setRefMessage,
    messages: initialMessages,
    handleNewMessage,
    messageAlert,
  } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageEndRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const messageItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [page, setPage] = useState(1);
  const [endReached, setEndReached] = useState(
    initialMessages.length < ITEMS_PER_BATCH
  );

  const loadMoreMutation = useMutation({
    mutationFn: async () => {
      const { from, to } = getFromAndTo();
      // delay request
      // await AsyncUtils.sleep(2);

      const { data, error } = await supabase.rpc("get_community_chat", {
        community_account: community.account,
        from_limit: from,
        to_limit: to,
      });

      if (error) {
        throw error;
      }

      const queryData = data as Message[];

      return queryData ?? [];
    },
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      if (data) {
        if (data.length < ITEMS_PER_BATCH) {
          setEndReached(true);
        }
        setPage(page + 1);
        setMessages((prev) => [...prev, ...data]);
      }
    },
  });

  function scrollToBottom() {
    if (lastItemRef.current) {
      lastItemRef.current.scrollIntoView({
        behavior: "instant",
        block: "start",
      });
    }
  }

  useEffect(() => {
    setMessages(initialMessages);
    scrollToBottom();
  }, [initialMessages]);

  useRealtimeCommunityMsgs({
    community_account: community.account,
    onNewMessage: (newMsg) => {
      if (!messages.some((msg) => msg.tid === newMsg.tid)) {
        handleNewMessage({ ...newMsg, realtime: true } as any);
        setMessages((prev) => [newMsg, ...prev]);

        if (!checkIfAtBottom()) {
          setMessageAlert(true);
        } else {
          scrollToBottom();
        }
      }
    },
  });

  const checkIfAtBottom = () => {
    const el = document.getElementById("scrollDiv");
    if (el) {
      const threshold = 180; // Optional: small offset from the bottom
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;

      return atBottom;
    }
  };

  const scrollToMessage = (msg?: Message) => {
    if (!msg?.tid) return;
    const target = messageEndRefs.current[msg.tid];

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      if (!msg.ref_tid) return;
      const targetItem = messageItemRefs.current[msg.ref_tid];
      targetItem?.animate([{ opacity: 0.6 }, { opacity: 1 }], {
        duration: 500,
        easing: "ease-in-out",
      });
    }
  };

  useEffect(() => {
    const el = document.getElementById("scrollDiv");
    if (!el) return;

    const handleScroll = () => {
      requestAnimationFrame(() => {
        // const atTop = el.scrollTop < 50;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        if (atBottom) {
          setMessageAlert(false);
        }
        // if (atTop && !loadMoreMutation.isPending) {
        //   loadMoreMutation.mutate();
        // }
      });
    };

    messageAlert && el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [messageAlert, loadMoreMutation]);

  function getFromAndTo() {
    let from = page * ITEMS_PER_BATCH;
    let to = from + ITEMS_PER_BATCH;

    if (page > 0) {
      from += 1;
    }

    return { from, to };
  }
  return (
    <div className="flex flex-col" ref={scrollRef}>
      <AnimatePresence initial={true}>
        <div className=" flex gap-4 flex-col-reverse">
          <div ref={lastItemRef} />

          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className=" flex flex-col"
                ref={(el) => {
                  messageItemRefs.current[msg.tid] = el;
                }}
              >
                <MessageItem
                  message={msg}
                  refMessage={setRefMessage}
                  onRefPress={() => {
                    scrollToMessage(msg);
                  }}
                  community={community}
                />
                <div
                  ref={(el) => {
                    messageEndRefs.current[msg.tid] = el;
                  }}
                />
              </div>
            </motion.div>
          ))}

          <div className=" items-center">
            {!endReached && (
              <div className="flex w-full justify-center">
                <Button
                  size="sm"
                  isDisabled={loadMoreMutation.isPending}
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
            )}
          </div>
        </div>
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
};

export default CommunityMessages;
