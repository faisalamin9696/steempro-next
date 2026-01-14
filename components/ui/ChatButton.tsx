import { Button, ButtonProps } from "@heroui/button";
import { MessageCircleMore } from "lucide-react";

const ICON_SIZE = 20;

function ChatButton({ isLoading, isIconOnly, ...rest }: ButtonProps) {
  return null;
  return (
    <Button
      radius="md"
      color="secondary"
      variant="flat"
      isIconOnly={isIconOnly}
      startContent={!isLoading && <MessageCircleMore size={ICON_SIZE} />}
      {...rest}
    >
      {!isIconOnly && "Chat"}
    </Button>
  );
}

export default ChatButton;
