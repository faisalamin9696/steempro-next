"use client";

import { useState, memo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Star, Flame } from "lucide-react";
import { Button } from "@heroui/button";
import SModal from "@/components/ui/SModal";
import { useDraggable } from "@heroui/react";
import React from "react";

interface GameChatProps {
  messages: { id: string; user: string; text: string }[];
  onSendMessage: (text: string) => void;
  currentScore: number;
  currentCombo: number;
  isLoggedIn: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
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
  }: GameChatProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const targetRef = React.useRef<any>(null);
    const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });
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
          {(onClose) => {
            return (
              <div className="flex flex-col h-full">
                {/* Messages List */}
                <div
                  ref={scrollRef}
                  className="flex-1 p-3 space-y-2 overflow-y-auto"
                >
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <MessageSquare size={24} className="text-zinc-800 mb-2" />
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">
                        No transmissions yet. Start the conversation!
                      </p>
                    </div>
                  )}
                  {messages
                    .map((m) => (
                      <div key={m.id} className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-black text-amber-500/80 uppercase">
                          @{m.user}
                        </span>
                        <div className="bg-white/5 border border-white/5 px-2 py-1.5 rounded-lg rounded-tl-none">
                          <p className="text-xs text-zinc-200 leading-snug font-medium">
                            {m.text}
                          </p>
                        </div>
                      </div>
                    ))
                    .reverse()}
                </div>

                {/* Quick Actions */}
                <div className="p-2 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_MESSAGES.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => {
                          onSendMessage(msg.text);
                        }}
                        className="text-[9px] font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 p-1.5 rounded-lg transition-all text-left truncate"
                      >
                        {msg.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          }}
        </SModal>
      </div>
    );
  },
);
