import { Button } from "@heroui/button";
import React from "react";
import { BsChatDots } from "react-icons/bs";
import { useLogin } from "./auth/AuthProvider";
import ChatModal from "./chat/ChatModal";
import { useDisclosure } from "@heroui/modal";

function ChatButton({
  account,
  onSuccess,
}: {
  account: AccountExt;
  onSuccess?: () => void;
}) {
  const { authenticateUser, isAuthorized } = useLogin();
  const chatDisclosure = useDisclosure();

  function handleChat() {
    authenticateUser(false, true);
    if (!isAuthorized(true)) {
      return;
    }
    chatDisclosure.onOpen();
    onSuccess && onSuccess();
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

      {chatDisclosure.isOpen && (
        <ChatModal
          isOpen={chatDisclosure.isOpen}
          onOpenChange={chatDisclosure.onOpenChange}
          account={account}
        />
      )}
    </div>
  );
}

export default ChatButton;
