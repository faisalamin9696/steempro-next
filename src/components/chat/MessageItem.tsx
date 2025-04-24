import clsx from "clsx";
import SAvatar from "../SAvatar";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import MessageReplyRef from "./MessageReplyRef";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { LuReply } from "react-icons/lu";
import "./style.scss";

export interface MessageItemProps {
  message: Message;
  refMessage: (message: Message) => void;
  onRefPress?: () => void;
  credentials?: User;
}

const MessageItem = (props: MessageItemProps) => {
  const { credentials } = props;
  const { sender, recipient, message, timestamp, ref_message, ref_tid } =
    props.message;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const isOwnMessage = sender === loginInfo.name;
  // const decMessage = Memo.decode(credentials?.memo!, message)?.replace("#", "");
  // const decReply = ref_message
  //   ? Memo.decode(credentials?.memo!, ref_message.message)?.replace("#", "")
  //   : "";

  return (
    <div className={clsx("flex gap-3 rounded-lg  transition-all")}>
      {!isOwnMessage && (
        <SAvatar
          username={isOwnMessage ? loginInfo.name : sender}
          alt={isOwnMessage ? "Your avatar" : `${sender}'s avatar`}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}

      <div
        className={clsx(
          "message-container flex flex-row items-center w-full justify-start gap-1",
          isOwnMessage && "justify-start flex-row-reverse"
        )}
      >
        <div
          className={clsx(
            " flex flex-col max-w-[60%] px-4 py-2 rounded-lg shadow-md break-words",
            isOwnMessage
              ? "bg-blue-600 text-white items-end rounded-se-none"
              : "comment-card items-start rounded-ss-none"
          )}
        >
          <div className=" flex flex-col gap-2">
            {ref_tid && ref_message && (
              <MessageReplyRef
                fullWidth
                onPress={props.onRefPress}
                text={ref_message.message}
                textClassName={isOwnMessage ? "text-white" : "text-default-900"}
              />
            )}
            <p className="text-sm mt-1 break-words whitespace-pre-wrap max-w-full">
              {message }
            </p>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span title={new Date(timestamp).toString()}>
              {new Date(timestamp).toLocaleString()}
            </span>
            {/* {isOwnMessage && isRead && <span className="ml-2">✓✓</span>} */}
          </div>
        </div>

        <Dropdown
          size="sm"
          className={clsx(
            "min-w-0 min-h-0",
            isOwnMessage ? "justify-end" : "justify-start"
          )}
        >
          <DropdownTrigger>
            <Button
              className="option-button"
              size="sm"
              radius="full"
              isIconOnly
              variant="light"
            >
              <BiDotsVerticalRounded size={18} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            className="p-0"
            itemClasses={{
              base: "w-[100px] p-1", // Set width for all dropdown items
            }}
            aria-labelledby="comment options"
            onAction={(key) => {
              if (key === "reply") {
                props.refMessage({ ...props.message, message: message });
              }
            }}
            hideEmptyContent
          >
            <DropdownItem key={"reply"} startContent={<LuReply size={18} />}>
              Reply
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default MessageItem;
