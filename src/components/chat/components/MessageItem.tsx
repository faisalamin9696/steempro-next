import clsx from "clsx";
import SAvatar from "../../ui/SAvatar";
import { mapSds, useAppSelector } from "@/constants/AppFunctions";
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
import "../style.scss";
import SLink from "../../ui/SLink";
import { twMerge } from "tailwind-merge";
import RoleTitleCard from "../../RoleTitleCard";
import { empty_comment } from "@/constants/Placeholders";
import MarkdownViewer from "@/components/body/MarkdownViewer";

function getUserRoleAndTitle(
  users: Role[],
  username: string
): { role: RoleTypes; title: string } | null {
  const user = users.find((u) => u.account === username);
  return user ? { role: user.role, title: user.title } : null;
}

export interface MessageItemProps {
  message: Message;
  refMessage: (message: Message) => void;
  onRefPress?: () => void;
  credentials?: User;
  community?: Community;
}

const MessageItem = (props: MessageItemProps) => {
  const { credentials, community } = props;
  const { sender, recipient, message, timestamp, ref_message, ref_tid } =
    props.message;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const isOwnMessage = sender === loginInfo.name;
  const roles: Role[] = mapSds(community?.roles) ?? [];
  const roleTitle = getUserRoleAndTitle(roles, sender);

  return (
    <div className={clsx("flex gap-3 rounded-lg  transition-all")}>
      {!isOwnMessage && (
        <SAvatar
          username={isOwnMessage ? loginInfo.name : sender}
          alt={isOwnMessage ? "Your avatar" : `${sender}'s avatar`}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}
      <div className=" flex flex-col items-start gap-2 w-full">
        {!isOwnMessage && community && (
          <SLink
            href={`/@${sender}`}
            className="text-tiny hover:text-blue-500 opacity-disabled"
          >
            @{sender}
          </SLink>
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
                  textClassName={
                    isOwnMessage ? "text-white" : "text-default-900"
                  }
                />
              )}

              {!isOwnMessage &&
                community &&
                roleTitle?.role !== "guest" &&
                roleTitle?.role && (
                  <div className={"flex flex-col items-start gap-2"}>
                    <RoleTitleCard
                      className={twMerge("text-tiny")}
                      roleClassName={`${
                        roleTitle?.role === "owner" ||
                        roleTitle?.role === "admin"
                          ? "text-green-500"
                          : roleTitle?.role === "mod"
                          ? "text-blue-500"
                          : roleTitle?.role === "member"
                          ? "text-yellow-500"
                          : roleTitle?.role === "muted"
                          ? "text-red-500"
                          : "text-default-500"
                      }`}
                      comment={empty_comment(
                        "",
                        "",
                        "",
                        roleTitle?.role,
                        roleTitle?.title
                      )}
                    />
                  </div>
                )}
              <p className="text-sm mt-1">
                <MarkdownViewer
                  text={message}
                  className=" !text-sm prose-p:!m-0 break-words break-all whitespace-normal grow"
                />
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
    </div>
  );
};

export default MessageItem;
