"use client";

import { memo, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import SModal from "@/components/ui/SModal";
import { useDraggable } from "@heroui/react";
import React from "react";
import { Button } from "@heroui/button";
import moment from "moment";

interface ChatMessage {
  id: number | string;
  player?: string;
  user?: string;
  message?: string;
  text?: string;
  created_at?: string;
  created?: number;
  season?: number;
  game?: string;
}

interface GameChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentScore: number;
  currentCombo: number;
  isLoggedIn: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export const GameChat = memo(
  ({
    messages,
    onSendMessage,
    currentScore,
    currentCombo,
    isLoggedIn,
    isOpen,
    onOpenChange,
    hasMore = false,
    isLoadingMore = false,
    onLoadMore,
  }: GameChatProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const targetRef = React.useRef<HTMLElement>(null!);
    const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });
    const [cooldown, setCooldown] = React.useState(0);

    const QUICK_MESSAGES = [
      { id: "gl", text: "Good luck everyone! 🍀" },
      { id: "score", text: `GG! My altitude: ${currentScore}m! 🏔️` },
      { id: "combo", text: `Whoa! ${currentCombo}x combo! 🔥` },
      { id: "stack", text: "Stacking like a pro! 🏗️" },
      { id: "moon", text: "Targeting the Moon! 🚀" },
      { id: "close", text: "That was close! 😅" },
    ];

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, isOpen]);

    useEffect(() => {
      if (cooldown > 0) {
        const timer = setTimeout(() => {
          setCooldown((c) => c - 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [cooldown]);

    const handleSendMessage = (text: string) => {
      if (cooldown > 0) return;
      onSendMessage(text);
      setCooldown(3);
    };

    const handleLoadMore = () => {
      if (scrollRef.current && onLoadMore) {
        const prevScrollHeight = scrollRef.current.scrollHeight;
        const prevScrollTop = scrollRef.current.scrollTop;

        onLoadMore();

        requestAnimationFrame(() => {
          if (scrollRef.current) {
            const newScrollHeight = scrollRef.current.scrollHeight;
            scrollRef.current.scrollTop =
              prevScrollTop + (newScrollHeight - prevScrollHeight);
          }
        });
      }
    };

    if (!isLoggedIn) return null;

    return (
      <div className="absolute right-1 top-1 z-41 flex flex-col items-end gap-2">
        {/* Chat Window */}
        <SModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          placement="top-center"
          title={() => (
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Tactical Chat
            </span>
          )}
          size="xs"
          ref={targetRef}
          moveProps={moveProps}
          backdrop="transparent"
          classNames={{ body: "p-0", footer: "p-0!" }}
          className="bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col h-120 text-default-900"
        >
          {() => {
            return (
              <div className="flex flex-col h-full">
                {/* Messages List */}
                <div
                  ref={scrollRef}
                  className="flex-1 p-3 space-y-2 overflow-y-auto"
                >
                  {hasMore && (
                    <div className="flex justify-center pb-2">
                      <Button
                        size="sm"
                        variant="light"
                        isLoading={isLoadingMore}
                        onClick={handleLoadMore}
                        className="text-[10px] font-black text-amber-500 hover:text-amber-400 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider transition-all h-auto min-w-0"
                      >
                        Load Older Transmissions
                      </Button>
                    </div>
                  )}

                  {messages.length === 0 && !hasMore && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <MessageSquare size={24} className="text-zinc-800 mb-2" />
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">
                        No transmissions yet. Start the conversation!
                      </p>
                    </div>
                  )}

                  {messages.map((m) => (
                    <div key={m.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black text-amber-500/80 uppercase">
                          @{m.player || m.user}
                        </span>
                        {(m.created_at || m.created) && (
                          <span className="text-[8px] text-zinc-500 font-medium">
                            {moment(m.created_at || m.created).fromNow()}
                          </span>
                        )}
                      </div>
                      <div className="bg-white/5 border border-white/5 px-2 py-1.5 rounded-lg rounded-tl-none">
                        <p className="text-xs text-zinc-200 leading-snug font-medium">
                          {m.message || m.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="p-2 border-t border-white/5">
                  {cooldown > 0 ? (
                    <div className="flex flex-col items-center justify-center py-3 bg-red-500/5 border border-red-500/10 rounded-lg animate-pulse">
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-400">
                        Transmission Cooldown
                      </span>
                      <span className="text-xs font-black text-white mt-0.5">
                        Wait {cooldown}s...
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUICK_MESSAGES.map((msg) => (
                        <button
                          key={msg.id}
                          onClick={() => {
                            handleSendMessage(msg.text);
                          }}
                          className="text-[9px] font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 p-1.5 rounded-lg transition-all text-left truncate"
                        >
                          {msg.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        </SModal>
      </div>
    );
  },
);

GameChat.displayName = "GameChat";
