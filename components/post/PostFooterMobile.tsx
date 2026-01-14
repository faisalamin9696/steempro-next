import { Button } from "@heroui/button";
import VoteCountButton from "../ui/VoteCountButton";
import PayoutButton from "./PayoutButton";
import { MessageCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";
import PostVoteButton from "./PostVoteButton";
import ResteemButton from "./ResteemButton";
import Link from "next/link";
import { scrollToWithOffset } from "@/utils/helper";

interface Props {
  comment: Feed | Post;
  isDetail?: boolean;
}

const ICON_SIZE = 20;
const BUTTON_CLASS = "px-2.5 min-w-0 text-inherit";
const LABEL_CLASS = "flex items-center gap-2 text-default-800";

function PostFooterMobile({ comment, isDetail }: Props) {
  async function scrollToComments() {
    if (!isDetail) return;
    const el = document.getElementById("comments-section");
    if (el) scrollToWithOffset(el, 80);
  }

  return (
    <div className="flex flex-wrap justify-between w-full gap-2 items-center">
      <div className="flex flex-row  items-center gap-2">
        <div className="flex flex-row flex-center rounded-xl text-default-900">
          <PostVoteButton
            comment={comment}
            size="sm"
            variant="flat"
            radius="md"
            className="rounded-e-none text-inherit"
            labelClass={LABEL_CLASS}
          />

          <VoteCountButton
            size="sm"
            radius="none"
            variant="flat"
            className={twMerge(BUTTON_CLASS, "w-8 text-inherit")}
            comment={comment}
            labelClass={LABEL_CLASS}
          />

          <PostVoteButton
            isDownvote
            comment={comment}
            size="sm"
            variant="flat"
            radius="md"
            className="rounded-s-none text-inherit"
            labelClass={LABEL_CLASS}
          />
        </div>

        <Button
          as={isDetail ? "div" : Link}
          href={
            isDetail
              ? undefined
              : `/@${comment.author}/${comment.permlink}#comments`
          }
          size="sm"
          radius="md"
          className={BUTTON_CLASS}
          variant="flat"
          onPress={scrollToComments}
        >
          <div className={LABEL_CLASS}>
            <MessageCircle size={ICON_SIZE} />
            <span>{comment.children}</span>
          </div>
        </Button>

        <ResteemButton
          comment={comment}
          size="sm"
          variant="flat"
          radius="md"
          className={BUTTON_CLASS}
          labelClass={LABEL_CLASS}
        />
      </div>

      {/* Payout Button */}
      <PayoutButton
        comment={comment}
        size="sm"
        radius="md"
        className={BUTTON_CLASS}
        labelClass={LABEL_CLASS}
        variant="flat"
      />
    </div>
  );
}

export default PostFooterMobile;
