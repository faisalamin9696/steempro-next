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
import { GiFeather } from "react-icons/gi";
import { PiWarning } from "react-icons/pi";

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
  const isLowQuality =
    (!!comment.is_muted || comment.author_role === "muted") &&
    comment.is_muted !== 2;

  const [showLowQuality, setShowLowQuality] = useState(
    !!comment.is_muted || comment.author_role === "muted"
  );

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
        <div className={twMerge("flex justify-between")}>
          <div className="flex flex-wrap items-start justify-between w-full">
            <div className="flex flex-row w-full">
              <SAvatar
                size="xs"
                username={comment.author}
                className="block sm:hidden me-1"
              />

              <div className="flex flex-col gap-0 items-start flex-1">
                <div className="flex w-full justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <SLink
                      className=" hover:text-blue-500"
                      href={`/@${comment.author}`}
                    >
                      {comment.author}
                    </SLink>
                    <Reputation reputation={comment.author_reputation} />

                    {comment.author === comment.root_author && (
                      <GiFeather
                        title="Post Author"
                        className=" opacity-80"
                        size={14}
                      />
                    )}
                  </div>

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

            {isLowQuality && (
              <div className="flex flex-col justify-end items-end gap-1 w-full sm:w-auto">
                {isLowQuality && (
                  <div className="flex flex-row gap-2 items-center">
                    <PiWarning />
                    <p className=" font-mono text-sm ">
                      Hidden due to low rating
                    </p>
                  </div>
                )}
                <Button
                  onPress={() => {
                    setShowLowQuality(!showLowQuality);
                  }}
                  size="sm"
                  variant="flat"
                  color="warning"
                >
                  {showLowQuality ? "Reveal Comment" : "Hide Comment"}
                </Button>
              </div>
            )}
          </div>

          <div>{rightContent}</div>
        </div>
        {!hideBody && !showLowQuality && (
          <div className={twMerge(isLowQuality && "opacity-45", "mt-4")}>
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
