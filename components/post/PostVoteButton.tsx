import { Button, ButtonProps } from "@heroui/react";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { steemApi } from "@/libs/steem";
import { handleSteemError } from "@/utils/steemApiError";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { useCommentFooterData } from "@/hooks/useCommentFooterData";
import { toast } from "sonner";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useSession } from "next-auth/react";
import VotingSlider from "../ui/VotingSlider";
import SPopover from "../ui/SPopover";
import { calculateVoteValue } from "@/utils/helper";
import { calculatePowerUsage } from "@/utils/user";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { useAccountsContext } from "../auth/AccountsContext";
import { useSteemUtils } from "@/hooks/useSteemUtils";

const ICON_SIZE = 20;
interface Props extends ButtonProps {
  comment: Feed | Post;
  isDownvote?: boolean;
  labelClass?: string;
}

function PostVoteButton(props: Props) {
  const { comment, isDownvote, labelClass } = props;
  const { authenticateOperation } = useAccountsContext();
  const { globalProps } = useSteemUtils();

  const { isUpvoted, isDownvoted, isVotingPending } =
    useCommentFooterData(comment);

  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const loginData = useAppSelector((state) => state.loginReducer.value);

  const VoteIcon = isDownvote ? ArrowBigDown : ArrowBigUp;

  const onVotePress = async (weight: number, closePopover: () => void) => {
    closePopover();

    const isRemoved = weight === 0;
    const direction = isDownvote ? -1 : 1;
    const status = isDownvote ? "downvoting" : "upvoting";
    const countKey = isDownvote ? "downvote_count" : "upvote_count";
    const prevCount = comment[countKey] ?? 0;

    dispatch(
      addCommentHandler({
        ...comment,
        status,
      })
    );

    try {
      await handleSteemError(async () => {
        const { key, useKeychain } = await authenticateOperation("posting");
        await steemApi.vote(
          session?.user?.name!,
          comment.author,
          comment.permlink,
          direction * weight * 100,
          key,
          useKeychain
        );

        const vote_value = calculateVoteValue(
          loginData,
          weight,
          globalProps.fund_per_rshare,
          globalProps.median_price,
          isDownvote
        );

        const power_usage = calculatePowerUsage(weight);

        dispatch(
          addCommentHandler({
            ...comment,
            status: "idle",

            // update correct counter
            [countKey]: isRemoved ? Math.max(0, prevCount - 1) : prevCount + 1,
            // correct observer state
            observer_vote: isRemoved ? 0 : direction,
            observer_vote_percent: isRemoved ? 0 : direction * weight,
            payout: comment.payout + vote_value,
          })
        );

        const power_key = isDownvote
          ? "downvote_mana_percent"
          : "upvote_mana_percent";

        dispatch(
          addLoginHandler({
            ...loginData,
            [power_key]: parseFloat(
              (loginData[power_key] - power_usage).toFixed(3)
            ),
          })
        );

        toast.success(isRemoved ? "Vote removed" : "Voted successfully!");
      });
    } catch {
      dispatch(addCommentHandler({ ...comment, status: "idle" }));
    }
  };

  const isActive = isDownvote ? isDownvoted : isUpvoted;

  return (
    <SPopover
      classNames={{ content: "p-0" }}
      shouldBlockScroll={false}
      placement="top-start"
      trigger={(close) => (
        <Button
          title={isDownvote ? "Downvote" : "Upvote"}
          aria-label={isDownvote ? "Downvote" : "Upvote"}
          isLoading={
            isDownvote
              ? comment.status === "downvoting"
              : comment.status === "upvoting"
          }
          isDisabled={isVotingPending}
          isIconOnly
          {...props}
        >
          <VoteIcon
            size={ICON_SIZE}
            className={
              isActive
                ? isDownvote
                  ? "text-danger-500 fill-danger-500"
                  : "text-success-500 fill-success-500"
                : labelClass
            }
          />
        </Button>
      )}
    >
      {(close) => (
        <VotingSlider
          comment={comment}
          onPress={(w) => onVotePress(w, close)}
          isDownvote={isDownvote}
        />
      )}
    </SPopover>
  );
}

export default PostVoteButton;
