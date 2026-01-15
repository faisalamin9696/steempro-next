"use client";

import { useState, useEffect, useRef } from "react";
import SModal from "../ui/SModal";
import {
  getUserChat,
  getCommunityChat,
  getUnreadChatsHeads,
  getChatLastRead,
} from "@/libs/supabase/chat";
import { useSession } from "next-auth/react";
import { ScrollShadow, Input, Button, Badge, Spinner } from "@heroui/react";
import moment from "moment";
import { Send, MessageSquare, ChevronLeft, Bell } from "lucide-react";
import SAvatar from "../ui/SAvatar";
import secureLocalStorage from "react-secure-storage";
import { Memo } from "@steempro/dsteem";
import { getChatMemoKey, secureLocalStorageFresh } from "@/utils/user";
import useRealtimeUserMessages from "../../hooks/useRealtimeUserMessages";
import useRealtimeCommunityMsgs from "../../hooks/useRealtimeCommunityMessages";
import { useCallback } from "react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recipient?: string;
  community?: string;
}

const PAGE_SIZE = 20;

function getDecryptedMessage(key: string, item: Message): Message {
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

function ChatModal({ isOpen, onOpenChange, recipient, community }: Props) {
  const { data: session } = useSession();
  const username = session?.user?.name;
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHeads, setChatHeads] = useState<UnReadChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [headsLoading, setHeadsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState<{
    user?: string;
    community?: string;
  } | null>(null);
  const [messageText, setMessageText] = useState("");
  const [memoKey, setMemoKey] = useState<string | null>(null);
  const [from, setFrom] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const oldScrollHeight = useRef(0);
  const [newMsgAlert, setNewMsgAlert] = useState<{
    tid: string;
    sender: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (username) {
      const storedKey = getChatMemoKey(username);
      if (storedKey) setMemoKey(storedKey);
    }
  }, [username]);

  useEffect(() => {
    if (recipient) {
      setActiveChat({ user: recipient });
    } else if (community) {
      setActiveChat({ community });
    }
  }, [recipient, community]);

  useEffect(() => {
    if (isOpen && username) {
      loadChatHeads();
    }
  }, [isOpen, username]);

  useEffect(() => {
    if (activeChat && username) {
      setFrom(0);
      setHasMore(true);
      isInitialLoad.current = true;
      loadMessages(0, true);
    } else {
      setMessages([]);
    }
  }, [activeChat, username]);

  const handleNewMessage = useCallback(
    (msg: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.tid === msg.tid)) return prev;

        const decrypted = {
          ...msg,
          ...getDecryptedMessage(memoKey || "", msg),
        };

        if (msg.sender !== username) {
          setNewMsgAlert({
            tid: msg.tid,
            sender: msg.sender,
            message: decrypted.message,
          });
          // Auto clear alert after 5 seconds
          setTimeout(() => setNewMsgAlert(null), 5000);
        }

        return [...prev, decrypted];
      });
    },
    [memoKey, username]
  );

  useRealtimeUserMessages({
    sender: username || "",
    recipient: activeChat?.user || "",
    onNewMessage: handleNewMessage,
  });

  useRealtimeCommunityMsgs({
    community_account: activeChat?.community || "",
    onNewMessage: handleNewMessage,
  });

  useEffect(() => {
    if (scrollRef.current) {
      if (isInitialLoad.current && messages.length > 0) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        isInitialLoad.current = false;
      } else if (oldScrollHeight.current > 0) {
        scrollRef.current.scrollTop =
          scrollRef.current.scrollHeight - oldScrollHeight.current;
        oldScrollHeight.current = 0;
      }
    }
  }, [messages]);

  const scrollToMessage = (tid: string) => {
    const element = document.getElementById(`msg-${tid}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-primary");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-primary");
      }, 2000);
    }
  };

  const loadChatHeads = async () => {
    if (!username) return;
    setHeadsLoading(true);
    try {
      const heads = await getUnreadChatsHeads(username, 0, 50);
      setChatHeads(heads);
    } catch (error) {
      console.error("Failed to load chat heads", error);
    } finally {
      setHeadsLoading(false);
    }
  };

  const loadMessages = async (
    offset: number = from,
    reset: boolean = false
  ) => {
    if (!username || !activeChat) return;
    setLoading(true);
    try {
      let data: Message[] = [];
      const to = offset + PAGE_SIZE;
      if (activeChat.user) {
        data = await getUserChat(username, activeChat.user, offset, to);
      } else if (activeChat.community) {
        data = await getCommunityChat(activeChat.community, offset, to);
      }

      const parserData = data.map((item) => ({
        ...item,
        ...getDecryptedMessage(memoKey!, item),
      }));

      const reversed = parserData.reverse();

      if (reset) {
        setMessages(reversed);
      } else {
        setMessages((prev) => [...reversed, ...prev]);
      }

      setHasMore(data.length === PAGE_SIZE + 1 || data.length === PAGE_SIZE); // Simple check for more
      setFrom(to);

      if (reset) {
        await getChatLastRead(username);
      }
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (scrollRef.current) {
      oldScrollHeight.current = scrollRef.current.scrollHeight;
    }
    await loadMessages(from, false);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !username) return;

    const newMessage: Message = {
      tid: `temp-${Date.now()}`,
      sender: username,
      recipient: activeChat?.user || "",
      message: messageText,
      timestamp: new Date().toISOString(),
      community: activeChat?.community || null,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText("");

    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  const renderChatList = () => (
    <div className="flex flex-col gap-2 h-[500px]">
      <div className="flex items-center gap-2 p-2 border-b border-divider">
        <MessageSquare size={20} className="text-primary" />
        <h3 className="font-semibold text-lg">Conversations</h3>
      </div>
      <ScrollShadow className="grow">
        {headsLoading ? (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        ) : chatHeads.length > 0 ? (
          <div className="flex flex-col">
            {chatHeads.map((head) => (
              <div
                key={head.sender_usr}
                className="flex items-center gap-3 p-3 hover:bg-content2 cursor-pointer transition-colors border-b border-divider last:border-0"
                onClick={() => setActiveChat({ user: head.sender_usr })}
              >
                <Badge
                  content={head.message_count}
                  color="danger"
                  className={head.message_count === 0 ? "hidden" : ""}
                >
                  <SAvatar username={head.sender_usr} size="md" />
                </Badge>
                <div className="flex flex-col grow min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold truncate">
                      {head.sender_usr}
                    </span>
                    <span className="text-xs text-muted">
                      {moment(head.latest_timestamp).fromNow()}
                    </span>
                  </div>
                  <p className="text-sm text-muted truncate">
                    {head.latest_message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-muted">
            <MessageSquare size={48} className="mb-2 opacity-20" />
            <p>No messages yet</p>
          </div>
        )}
      </ScrollShadow>
    </div>
  );

  const renderActiveChat = () => (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center gap-2 p-2 border-b border-divider">
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onClick={() => setActiveChat(null)}
          className={recipient || community ? "hidden" : ""}
        >
          <ChevronLeft size={20} />
        </Button>
        <SAvatar
          username={activeChat?.user || activeChat?.community || ""}
          size="sm"
        />
        <div className="flex flex-col gap-1">
          <span className="font-semibold leading-none">
            {activeChat?.user || activeChat?.community}
          </span>
          <span className="text-xs text-muted">
            This conversation is secured with end-to-end encryption.
          </span>
        </div>
      </div>

      <ScrollShadow ref={scrollRef} className="grow p-4 flex flex-col gap-3">
        {hasMore && messages.length > 0 && (
          <div className="flex justify-center mb-2">
            <Button
              size="sm"
              variant="flat"
              onClick={handleLoadMore}
              isLoading={loading}
              className="text-xs"
            >
              Load More
            </Button>
          </div>
        )}

        {newMsgAlert && (
          <div className="sticky top-0 z-50 flex justify-center w-full mb-4">
            <Button
              size="sm"
              color="primary"
              variant="shadow"
              startContent={<Bell size={14} />}
              onClick={() => {
                scrollToMessage(newMsgAlert.tid);
                setNewMsgAlert(null);
              }}
              className="animate-bounce"
            >
              New message from {newMsgAlert.sender}
            </Button>
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, i) => {
            const isMe = msg.sender === username;

            return (
              <div
                key={msg.tid || i}
                id={`msg-${msg.tid}`}
                className={`flex flex-col transition-all duration-500 rounded-lg ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] ${
                    isMe
                      ? "bg-linear-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl rounded-tr-none shadow-primary/20"
                      : "bg-content2 text-foreground rounded-2xl rounded-tl-none shadow-black/5"
                  }`}
                >
                  {msg.ref_message && (
                    <div
                      onClick={() =>
                        msg.ref_tid && scrollToMessage(msg.ref_tid)
                      }
                      className={`mb-2 p-2 rounded-lg cursor-pointer border-l-4 border-primary/50 text-xs transition-opacity hover:opacity-80 ${
                        isMe ? "bg-black/20" : "bg-content3"
                      }`}
                    >
                      <p className="font-bold opacity-70 underline mb-1">
                        Reply to {msg.ref_message.sender}
                      </p>
                      <p className="truncate line-clamp-2 opacity-90">
                        {msg.ref_message.message}
                      </p>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {msg.message}
                  </p>
                </div>
                <span className="text-[10px] text-muted mt-1 px-1">
                  {moment(msg.timestamp).format("HH:mm")}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted italic text-sm">
            <p>No messages in this chat yet.</p>
          </div>
        )}
      </ScrollShadow>

      <div className="p-3 border-t border-divider flex gap-2 items-center">
        <Input
          placeholder="Type a message..."
          size="sm"
          variant="flat"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="grow"
        />
        <Button
          isIconOnly
          color="primary"
          size="sm"
          onClick={handleSendMessage}
          isDisabled={!messageText.trim()}
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      placement="center"
      hideCloseButton={false}
      bodyClass="p-0"
      classNames={{ footer: "p-0", header: "p-0" }}
    >
      {() => (activeChat ? renderActiveChat() : renderChatList())}
    </SModal>
  );
}

export default ChatModal;
