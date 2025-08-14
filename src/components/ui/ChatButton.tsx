"use client";

import { Button } from "@heroui/button";
import React from "react";
import { BsChatDots } from "react-icons/bs";
import { useLogin } from "../auth/AuthProvider";
import { useTranslation } from "@/utils/i18n";

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
  const { t } = useTranslation();
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
      title={t("community.chat")}
      radius="full"
      size={size ?? "md"}
      variant="solid"
      href="/"
      color="secondary"
      isIconOnly={isIconOnly}
      startContent={isIconOnly ? undefined : <BsChatDots size={18} />}
      onPress={handleChat}
    >
      {isIconOnly ? <BsChatDots size={18} /> : t("community.chat")}
    </Button>
  );
}

export default ChatButton;
