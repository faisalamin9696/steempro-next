"use client";

import { Button } from "@heroui/button";
import React from "react";
import { BsChatDots } from "react-icons/bs";
import { useLogin } from "./auth/AuthProvider";

function ChatButton({
  onPress,
  isIconOnly,
  size,
  skipMemo,
}: {
  onPress: () => void;
  isIconOnly?: boolean;
  size?: "lg" | "sm" | "md";
  skipMemo?: boolean;
}) {
  const { authenticateUser, isAuthorized } = useLogin();

  function handleChat() {
    authenticateUser(false, skipMemo ? false : true);
    if (!isAuthorized(skipMemo ? false : true)) {
      return;
    }
    onPress();
  }
  return (
    <Button
      title="Create Post"
      radius="full"
      size={size ?? "md"}
      className=" bg-secondary/70"
      variant="solid"
      href="/"
      color="primary"
      isIconOnly={isIconOnly}
      startContent={isIconOnly ? undefined : <BsChatDots size={18} />}
      onPress={handleChat}
    >
      {isIconOnly ? <BsChatDots size={18} /> : "Chat"}
    </Button>
  );
}

export default ChatButton;
