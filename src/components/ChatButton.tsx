"use client";

import { Button } from "@heroui/button";
import React, { useEffect } from "react";
import { BsChatDots } from "react-icons/bs";
import { useLogin } from "./auth/AuthProvider";
import { useDisclosure } from "@heroui/modal";
import { useSearchParams } from "next/navigation";

function ChatButton({ onPress }: { onPress: () => void }) {
  const { authenticateUser, isAuthorized } = useLogin();

  function handleChat() {
    authenticateUser(false, true);
    if (!isAuthorized(true)) {
      return;
    }
    onPress();
  }
  return (
    <div>
      <Button
        title="Create Post"
        radius="full"
        size="md"
        className=" bg-foreground/10"
        variant="flat"
        href="/"
        startContent={<BsChatDots size={18} />}
        onPress={handleChat}
      >
        Chat
      </Button>
    </div>
  );
}

export default ChatButton;
