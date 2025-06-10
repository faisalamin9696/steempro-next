import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
import { useLogin } from "../../auth/AuthProvider";
import { toast } from "sonner";

const MESSAGE_TTL = 2000; // how long to remember duplicates
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const MAX_MESSAGES = 5; // max messages per window

const recentMessages = new Set<string>(); // duplicate detector
let userMessageTimestamps: number[] = []; // track message times

interface Props {
  onSubmit: (message: string) => void;
  isPending?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  skipMemo?: boolean;
}
const ChatInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onValueChange, isPending, onSubmit, skipMemo }, ref) => {
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);
    const { authenticateUser, isAuthorized } = useLogin();

    const canSendMessage = (msg: string): boolean => {
      const now = Date.now();
      const key = msg.trim().toLowerCase();

      // 🚫 Duplicate
      if (recentMessages.has(key)) return false;

      // ✅ Store duplicate
      recentMessages.add(key);
      setTimeout(() => recentMessages.delete(key), MESSAGE_TTL);

      // ⏱️ Clean up old timestamps
      userMessageTimestamps = userMessageTimestamps.filter(
        (ts) => now - ts <= RATE_LIMIT_WINDOW
      );

      // 🚫 Rate limit
      if (userMessageTimestamps.length >= MAX_MESSAGES) {
        const waitTime = RATE_LIMIT_WINDOW - (now - userMessageTimestamps[0]);
        setCooldown(Math.ceil(waitTime / 1000)); // trigger cooldown in seconds
        return false;
      }

      // ✅ Allowed
      userMessageTimestamps.push(now);
      return true;
    };

    useEffect(() => {
      if (cooldown > 0) {
        cooldownRef.current = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1 && cooldownRef.current) {
              clearInterval(cooldownRef.current);
              cooldownRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
      };
    }, [cooldown]);

    async function handleSend() {
      const _msg = value.trim();

      if (!_msg) {
        toast.info("Message can not be empty");
        return;
      }

      authenticateUser(false, skipMemo ? false : true);
      if (!isAuthorized(skipMemo ? false : true)) {
        return;
      }

      if (!canSendMessage(_msg)) {
        toast.warning("You're sending messages too fast or repeating");
        return;
      }

      onSubmit(_msg);
    }
    return (
      <div className="flex flex-row items-center w-full gap-4">
        <Input
          ref={ref}
          size="lg"
          value={value}
          autoFocus
          maxLength={800}
          isDisabled={isPending || cooldown > 0}
          endContent={
            !!cooldown && (
              <div className="me-2 items-center flex flex-col">
                <Badge
                  size="md"
                  variant="flat"
                  color="primary"
                  content={cooldown}
                >
                  <></>
                </Badge>
              </div>
            )
          }
          onValueChange={onValueChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type message here..."
        />

        <Button
          isIconOnly
          color="primary"
          isLoading={isPending}
          isDisabled={isPending || cooldown > 0}
          onPress={handleSend}
        >
          <BiSend size={20} />
        </Button>
      </div>
    );
  }
);

export default ChatInput;
