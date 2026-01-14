import { SteemIcon } from "@/components/icons/SteemIcon";
import { CircleDollarSign } from "lucide-react";

export function useCommentFooterData(comment: Feed | Post) {
  const isUpvoted = comment.observer_vote && comment.observer_vote_percent > 0;

  const isDownvoted =
    comment.observer_vote && comment.observer_vote_percent < 0;

  const isPowerup =
    !comment.percent_steem_dollars || !comment.max_accepted_payout;

  const isDeclined = isPowerup && !comment.max_accepted_payout;

  const PayoutIcon = isPowerup ? SteemIcon : CircleDollarSign;
  const isVotingPending =
    comment.status === "upvoting" || comment.status === "downvoting";

  return {
    isUpvoted,
    isDownvoted,
    isPowerup,
    isDeclined,
    PayoutIcon,
    isVotingPending,
  };
}
