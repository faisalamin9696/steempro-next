import { Badge } from "@heroui/badge";
import { Button, ButtonProps } from "@heroui/button";
import { MessageCircleMore } from "lucide-react";

const ICON_SIZE = 20;

interface Props extends ButtonProps {
  unreadCount?: number;
}

function ChatButton({ isLoading, isIconOnly, unreadCount, ...rest }: Props) {
  return null;
  // const button = (
  //   <Button
  //     radius="md"
  //     color="secondary"
  //     variant="flat"
  //     isIconOnly={isIconOnly}
  //     startContent={!isLoading && <MessageCircleMore size={ICON_SIZE} />}
  //     {...rest}
  //   >
  //     {!isIconOnly && "Chat"}
  //   </Button>
  // );

  // if (unreadCount && unreadCount > 0) {
  //   return (
  //     <Badge content={unreadCount} color="danger" size="sm" shape="circle">
  //       {button}
  //     </Badge>
  //   );
  // }

  // return button;
}

export default ChatButton;
