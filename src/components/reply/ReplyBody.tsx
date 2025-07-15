import Reputation from "@/components/Reputation";
import SAvatar from "@/components/ui/SAvatar";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import React, { Key, useState } from "react";
import RoleTitleCard from "../RoleTitleCard";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { BsClipboard2Minus } from "react-icons/bs";
import { LuHistory } from "react-icons/lu";
import { FaEllipsis } from "react-icons/fa6";
import { toast } from "sonner";
import { AppStrings } from "@/constants/AppStrings";
import CommentEditHistory from "../CommentHistoryViewer";
import SLink from "../ui/SLink";
import { twMerge } from "tailwind-merge";
import MarkdownViewer from "../body/MarkdownViewer";
import { HiOutlineLink } from "react-icons/hi2";
import { FaFeather } from "react-icons/fa";
import { GiFeather } from "react-icons/gi";

export default function ReplyBody({
  comment,
  rightContent,
  isDeep,
  hideBody,
}: {
  comment: Post;
  rightContent?: React.ReactNode;
  isDeep: boolean;
  hideBody?: boolean;
}) {
  const menuItems = [
    { show: true, key: "copy", name: "Copy Link", icon: BsClipboard2Minus },
    { show: true, key: "history", name: "Edit History", icon: LuHistory },
  ];
  const [showHistory, setShowHistory] = useState(false);

  const renderedItems = menuItems
    .filter((item) => item.show)
    .map((item) => (
      <DropdownItem
        key={item.key}
        color={"default"}
        startContent={<item.icon className={"text-lg"} />}
      >
        {item.name}
      </DropdownItem>
    ));

  async function handleMenuActions(key: Key) {
    switch (key) {
      case "history":
        setShowHistory(!showHistory);
        break;

      case "copy":
        navigator.clipboard.writeText(
          `${AppStrings.steempro_base_url}/@${comment.author}/${comment.permlink}`
        );
        toast.success("Copied");
        break;
    }
  }

  return (
    <div className="flex gap-2 w-full ">
      <div className="flex flex-col text-sm sm:text-medium-100 w-full">
        <div className="flex justify-between">
          <div className="flex-col items-start">
            <div className="flex items-center">
              <SAvatar
                size="xs"
                username={comment.author}
                className="block sm:hidden me-1"
              />

              <div className="flex flex-col items-start">
                <div className="flex gap-1 items-center">
                  <div className="flex flex-col gap-0 items-start">
                    <div className="flex gap-1 items-center">
                      <SLink
                        className=" hover:text-blue-500"
                        href={`/@${comment.author}`}
                      >
                        {comment.author}
                      </SLink>
                      <Reputation reputation={comment.author_reputation} />
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            size="sm"
                            radius="full"
                            isIconOnly
                            variant="light"
                          >
                            <FaEllipsis className="text-lg" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-labelledby="comment options"
                          onAction={handleMenuActions}
                          hideEmptyContent
                        >
                          {renderedItems}
                        </DropdownMenu>
                      </Dropdown>
                      {comment.author === comment.root_author && (
                        <GiFeather
                          title="Post Author"
                          className=" opacity-80"
                          size={14}
                        />
                      )}
                    </div>

                    <div className="flex gap-1 items-center">
                      <RoleTitleCard
                        comment={comment}
                        className="opacity-80 gap-1 text-tiny"
                        titleClassName="max-sm:hidden"
                      />

                      <TimeAgoWrapper
                        className="opacity-65"
                        handleEditClick={() => {
                          setShowHistory(!showHistory);
                        }}
                        created={comment.created * 1000}
                        lastUpdate={comment.last_update * 1000}
                      />
                      <SLink
                        className="hover:text-blue-500"
                        href={`/${comment.category}/@${comment.author}/${comment.permlink}`}
                      >
                        <HiOutlineLink />
                      </SLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>{rightContent}</div>
        </div>
        {!hideBody && (
          <div
            className={twMerge(comment.is_muted === 1 && "opacity-60", "mt-4")}
          >
            <MarkdownViewer
              text={comment.body}
              className={`!prose-sm !w-full !max-w-none`}
            />
          </div>
        )}
      </div>

      {showHistory && (
        <CommentEditHistory
          isOpen={showHistory}
          onOpenChange={setShowHistory}
          author={comment.author}
          permlink={comment.permlink}
        />
      )}
    </div>
  );
}
