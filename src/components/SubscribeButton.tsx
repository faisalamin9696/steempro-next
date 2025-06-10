import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { subscribeCommunity } from "@/libs/steem/condenser";
import { Button } from "@heroui/button";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { addCommunityHandler } from "@/hooks/redux/reducers/CommunityReducer";
import { useSession } from "next-auth/react";

type Props = {
  community: Community;
  size?: "sm" | "md" | "lg";
  username?: string;
};

export default function SubscribeButton(props: Props) {
  const { community, size, username } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const communityInfo: Community =
    useAppSelector((state) => state.communityReducer.values)[
      community?.account ?? ""
    ] ?? community;
  const { data: session } = useSession();

  const isSubscribed = communityInfo?.observer_subscribed === 1;
  const dispatch = useAppDispatch();
  const isSelf = session?.user?.name === username;

  const { authenticateUser, isAuthorized } = useLogin();

  function handleFailed(error: any) {
    toast.error(error.message || JSON.stringify(error));
    dispatch(
      addCommunityHandler({
        ...communityInfo,
        status: "idle",
      })
    );
  }
  const joinMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      subscribeCommunity(
        loginInfo,
        data.key,
        {
          community: communityInfo!.account,
          subscribe: isSubscribed ? false : true,
        },
        data.isKeychain
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        handleFailed(error);
        return;
      }
      if (isSubscribed) toast.success("Left");
      else toast.success("Joined");
      dispatch(
        addCommunityHandler({
          ...communityInfo,
          observer_subscribed: isSubscribed ? 0 : 1,
          status: "idle",
        })
      );
    },
  });

  async function handleFollow() {
    authenticateUser();
    if (!isAuthorized()) return;

    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }
    if (communityInfo) {
      dispatch(
        addCommunityHandler({
          ...communityInfo,
          status: isSubscribed ? "leaving" : "joining",
        })
      );
      joinMutation.mutate({
        key: credentials.key,
        isKeychain: credentials.keychainLogin,
      });
      return;
    }
  }
  const isPending =
    joinMutation.isPending ||
    communityInfo?.status === "leaving" ||
    communityInfo?.status === "joining";

  return (
    <div className="flex flex-row items-start gap-1 justify-center">
      {!isSelf && (
        <Button
          isDisabled={isPending}
          color={isSubscribed ? "danger" : "success"}
          radius="full"
          size={size ?? "md"}
          isLoading={isPending}
          title={isSubscribed ? "Leave community" : "Join community"}
          variant={"flat"}
          onPress={handleFollow}
          isIconOnly={isPending}
        >
          {isPending ? "" : isSubscribed ? "Leave" : "Join"}
        </Button>
      )}
    </div>
  );
}
