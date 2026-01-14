import { steemApi } from "@/libs/steem";
import { handleSteemError } from "@/utils/steemApiError";
import { Button, ButtonProps } from "@heroui/button";
import { UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAccountsContext } from "../auth/AccountsContext";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/redux/store";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { addProfileHandler } from "@/hooks/redux/reducers/ProfileReducer";

interface FollowButtonProps extends ButtonProps {
  account: AccountExt;
}

const ICON_SIZE = 20;

function FollowButton({
  isLoading,
  isIconOnly,
  account,
  ...rest
}: FollowButtonProps) {
  const isFollowed = Boolean(account.observer_follows_author);
  const color = isFollowed ? "warning" : "primary";
  const title = isFollowed ? "Unfollow" : "Follow";
  const [isPending, setIsPending] = useState(false);
  const { authenticateOperation } = useAccountsContext();
  const { data: session } = useSession();
  const isSelf = session?.user?.name === account.name;
  const dispatch = useAppDispatch();

  const handleFollow = async () => {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("posting");
      await steemApi.follow(
        session?.user?.name!,
        account.name,
        !isFollowed,
        key,
        useKeychain
      );
      toast.success(
        isFollowed ? "Unfollowed successfully" : "Followed successfully"
      );
      const updatedData = {
        ...account,
        observer_follows_author: +isFollowed,
      };

      if (isSelf) {
        dispatch(addLoginHandler(updatedData));
      }
      dispatch(addProfileHandler(updatedData));
      setIsPending(false);
    }).finally(() => {
      setIsPending(false);
    });
  };

  return (
    <Button
      radius="md"
      color={color}
      variant="flat"
      isIconOnly={isIconOnly}
      isLoading={isPending}
      onPress={handleFollow}
      startContent={
        !isPending &&
        (isFollowed ? (
          <UserMinus size={ICON_SIZE} />
        ) : (
          <UserPlus size={ICON_SIZE} />
        ))
      }
      {...rest}
    >
      {}
      {!isIconOnly && title}
    </Button>
  );
}

export default FollowButton;
