import { ButtonGroup, Button } from "@heroui/react";
import { MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import PostOptionButton from "../post/PostOptionButton";
import PostVoteButton from "../post/PostVoteButton";
import VoteCountButton from "../ui/VoteCountButton";
import PayoutButton from "../post/PayoutButton";

interface Props {
  comment: Post | Feed;
  onReplyPress: () => void;
  onTogglePress: () => void;
  showReplies: boolean;
  onEditPress: () => void;
  root: Post;
}
function CommentFooter({
  comment,
  onReplyPress,
  onTogglePress,
  showReplies,
  onEditPress,
  root,
}: Props) {
  return (
    <div className="flex items-center gap-2 my-3 flex-wrap">
      <ButtonGroup size="sm" variant="flat">
        <PostVoteButton comment={comment} className="min-w-0 h-7 px-2" />
        <VoteCountButton
          comment={comment}
          size="sm"
          className="min-w-0 h-7 px-2"
        />
        <PostVoteButton
          comment={comment}
          className="min-w-0 h-7 px-2"
          isDownvote
        />
      </ButtonGroup>
      <Button
        size="sm"
        variant="flat"
        className="h-7"
        onPress={onReplyPress}
        startContent={<MessageSquare size={14} />}
      >
        Reply
      </Button>

      <PayoutButton
        className="min-w-0 h-7 px-2 "
        labelClass="flex items-center gap-2"
        size="sm"
        variant="flat"
        comment={comment}
      />
      <PostOptionButton
        variant="flat"
        className="min-w-0 h-7"
        iconSize={14}
        comment={comment}
        onEditPress={onEditPress}
        root={root}
        isDetail
      />

      {comment.children > 0 && (
        <Button
          size="sm"
          variant="light"
          onPress={onTogglePress}
          className="h-7 min-w-0"
        >
          <div className="flex gap-1 items-center text-default-700">
            {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span className="text-xs ml-1">{comment.children}</span>
          </div>
        </Button>
      )}
    </div>
  );
}

export default CommentFooter;
