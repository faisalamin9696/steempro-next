import { Button, ButtonProps } from "@heroui/button";
import { useState } from "react";
import { useCommentFooterData } from "@/hooks/useCommentFooterData";
import VotersModal from "../post/VotersModal";

interface Props extends ButtonProps {
  comment: Feed | Post;
  labelClass?: string;
}
function VoteCountButton(props: Props) {
  const { comment, labelClass } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { isVotingPending } = useCommentFooterData(comment);

  function onVotesPress() {
    setIsOpen(true);
  }
  return (
    <>
      <Button onPress={onVotesPress} isDisabled={isVotingPending} {...props}>
        <p className={labelClass}>{comment.upvote_count}</p>
      </Button>
      {isOpen && (
        <VotersModal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          comment={comment}
        />
      )}
    </>
  );
}

export default VoteCountButton;
