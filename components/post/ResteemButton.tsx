import { Button, ButtonProps } from "@heroui/button";
import { useAppDispatch } from "@/hooks/redux/store";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { handleSteemError } from "@/utils/steemApiError";
import { steemApi } from "@/libs/steem";
import { toast } from "sonner";
import { Repeat } from "lucide-react";
import { useSession } from "next-auth/react";
import SPopover from "../ui/SPopover";
import { useAccountsContext } from "../auth/AccountsContext";
import { Spinner } from "@heroui/spinner";

const ICON_SIZE = 20;

interface Props extends ButtonProps {
  comment: Feed | Post;
  labelClass?: string;
}
function ResteemButton(props: Props) {
  const { comment, labelClass } = props;
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { authenticateOperation } = useAccountsContext();

  async function onRsteemPress(closePopover: () => void) {
    closePopover();
    if (comment.observer_resteem) {
      toast.success("You have already resteemed this post!");
      return;
    }

    dispatch(addCommentHandler({ ...comment, status: "resteeming" }));

    try {
      await handleSteemError(async () => {
        const { key, useKeychain } = await authenticateOperation("posting");
        await steemApi.resteem(
          session?.user?.name!,
          comment.author,
          comment.permlink,
          key,
          useKeychain
        );
        dispatch(
          addCommentHandler({
            ...comment,
            status: "idle",
            observer_resteem: 1,
            resteem_count: comment.resteem_count + 1,
          })
        );

        toast.success("Resteem successfully!");
      });
    } catch (error) {
      dispatch(addCommentHandler({ ...comment, status: "idle" }));
    }
  }
  return (
    <SPopover
      shouldBlockScroll={false}
      title="Confirmation"
      description="Resteem this post?"
      className=""
      trigger={
        <Button isDisabled={comment.status === "resteeming"} {...props}>
          <div className={labelClass}>
            {comment.status === "resteeming" ? (
              <Spinner color="current" size="sm" />
            ) : (
              <Repeat
                size={ICON_SIZE}
                className={comment.observer_resteem ? "text-success-500" : ""}
              />
            )}
            <span>{comment.resteem_count}</span>
          </div>
        </Button>
      }
    >
      {(onClose) => (
        <div className="flex flex-row gap-2 self-end">
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>

          <Button color="primary" onPress={() => onRsteemPress(onClose)}>
            Resteem
          </Button>
        </div>
      )}
    </SPopover>
  );
}

export default ResteemButton;
