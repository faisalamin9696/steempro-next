import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Divider } from "@heroui/divider";
import VoteCountButton from "../ui/VoteCountButton";
import PayoutButton from "./PayoutButton";
import { MessageCircle } from "lucide-react";
import PostVoteButton from "./PostVoteButton";
import ResteemButton from "./ResteemButton";
import { scrollToWithOffset } from "@/utils/helper";

interface Props {
  comment: Feed | Post;
}

const ICON_SIZE = 22;

const BUTTON_CLASS = "flex items-center justify-center h-14 w-full";
const LABEL_CLASS = "flex flex-col items-center gap-1 text-sm text-default-800";

function PostFooterDesktop({ comment }: Props) {
  async function scrollToComments() {
    const el = document.getElementById("comments-section");
    if (el) scrollToWithOffset(el, 80);
  }
  return (
    <Card className="card max-h-[calc(100vh-80px)] overflow-y-auto w-full p-1">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <PostVoteButton
            comment={comment}
            variant="light"
            className="rounded-xl! w-full"
            labelClass={LABEL_CLASS}
          />

          <VoteCountButton
            className="rounded-xl!"
            size="sm"
            radius="md"
            variant="light"
            comment={comment}
            labelClass={LABEL_CLASS}
          />

          <PostVoteButton
            isDownvote
            comment={comment}
            variant="light"
            className="rounded-xl! w-full"
            labelClass={LABEL_CLASS}
          />
        </div>
        <Divider />
        <Button
          variant="light"
          size="sm"
          className={BUTTON_CLASS}
          onPress={scrollToComments}
        >
          <div className={LABEL_CLASS}>
            <MessageCircle size={ICON_SIZE} />
            <span>{comment.children}</span>
          </div>
        </Button>

        <Divider />

        <ResteemButton
          comment={comment}
          variant="light"
          className={BUTTON_CLASS}
          labelClass={LABEL_CLASS}
        />

        <Divider />

        <PayoutButton
          comment={comment}
          variant="light"
          size="sm"
          className={BUTTON_CLASS}
          labelClass={LABEL_CLASS}
        />
      </div>
    </Card>
  );
}

export default PostFooterDesktop;
