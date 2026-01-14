import { handleSteemError } from "@/utils/steemApiError";
import { Button, ButtonProps } from "@heroui/button";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useAccountsContext } from "../auth/AccountsContext";
import { steemApi } from "@/libs/steem";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface SubscribeButtonProps extends ButtonProps {
  community: Community;
  onSubscribe?: (isSubscribed: boolean) => void;
}

const ICON_SIZE = 20;

function SubscribeButton({
  isLoading,
  isIconOnly,
  community,
  onSubscribe,
  ...rest
}: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(
    Boolean(community.observer_subscribed)
  );

  const color = isSubscribed ? "warning" : "primary";
  const title = isSubscribed ? "Leave" : "Subscribe";
  const [isPending, setIsPending] = useState(false);
  const { authenticateOperation } = useAccountsContext();
  const { data: session } = useSession();

  const handleSubscribe = async () => {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("posting");
      await steemApi.subscribe(
        session?.user?.name!,
        community.account,
        !isSubscribed,
        key,
        useKeychain
      );
      onSubscribe?.(!isSubscribed);
      setIsSubscribed(!isSubscribed);
      toast.success(
        isSubscribed ? "Left community" : "Subscribed successfully"
      );
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
      onPress={handleSubscribe}
      startContent={
        !isPending &&
        (isSubscribed ? <Minus size={ICON_SIZE} /> : <Plus size={ICON_SIZE} />)
      }
      {...rest}
    >
      {!isIconOnly && title}
    </Button>
  );
}

export default SubscribeButton;
