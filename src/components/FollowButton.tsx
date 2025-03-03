import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { addProfileHandler } from "@/libs/redux/reducers/ProfileReducer";
import { followUser, unfollowUser } from "@/libs/steem/condenser";
import { Button } from "@heroui/button";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { FaPencil } from "react-icons/fa6";
import { useRouter } from "next13-progressbar";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { useSession } from "next-auth/react";
import { twMerge } from "tailwind-merge";
import { BsPlusCircle } from "react-icons/bs";
import { SlMinus } from "react-icons/sl";
import { CircularProgress } from "@heroui/progress";

type Props = {
  account: AccountExt;
  size?: "md" | "sm" | "lg";
};

export default function FollowButton(props: Props) {
  const { account, size } = props;
  const { username } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { data: session } = useSession();
  const followingAccount = account?.name;
  const isFollowing = account?.observer_follows_author === 1;
  const dispatch = useAppDispatch();
  const isSelf = session?.user?.name === username;

  const { authenticateUser, isAuthorized } = useLogin();
  const router = useRouter();

  function handleSuccess(follow?: boolean) {
    if (account)
      dispatch(
        addProfileHandler({
          ...account,
          observer_follows_author: isFollowing ? 0 : 1,
          status: "idle",
        })
      );

    if (isFollowing) toast.success("Unfollowed");
    else toast.success("Followed");
  }
  function handleFailed(error: any) {
    toast.error(error.message || JSON.stringify(error));

    dispatch(
      addProfileHandler({
        ...account,
        status: "idle",
      })
    );
  }
  const followMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      isFollowing
        ? unfollowUser(
            loginInfo,
            data.key,
            {
              follower: loginInfo.name,
              following: followingAccount,
            },
            data.isKeychain
          )
        : followUser(
            loginInfo,
            data.key,
            {
              follower: loginInfo.name,
              following: followingAccount,
            },
            data.isKeychain
          ),
    onSettled(data, error, variables, context) {
      if (error) {
        handleFailed(error);
        return;
      }
      handleSuccess();
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
    dispatch(
      addProfileHandler({
        ...account,
        status: isFollowing ? "unfollowing" : "following",
      })
    );
    followMutation.mutate({
      key: credentials.key,
      isKeychain: credentials.keychainLogin,
    });
  }

  function handleAccountEdit() {
    if (account?.name) router.push(`/@${account?.name}/settings`);
  }

  const isPending =
    followMutation.isPending ||
    account?.status === "following" ||
    account?.status === "unfollowing";

  return (
    <div className="flex flex-row items-start gap-1 justify-center">
      {isSelf && (
        <Button
          size={size ?? "md"}
          variant="flat"
          title="Edit profile"
          className={"bg-foreground/10"}
          onPress={handleAccountEdit}
          startContent={<FaPencil />}
          radius="full"
        >
          Edit
        </Button>
      )}

      {!isSelf && (
        <Button
          isDisabled={isPending}
          radius="full"
          size={size ?? "md"}
          color={isFollowing ? "default" : "primary"}
          // isLoading={isPending}
          title={isFollowing ? "Unfollow" : "Follow"}
          variant={"solid"}
          onPress={handleFollow}
          // isIconOnly={isPending}
          startContent={
            isPending ? (
              <CircularProgress
                size="sm"
                classNames={{ svg: " h-[18px] w-[18px]" }}
              />
            ) : isFollowing ? (
              <SlMinus size={18} />
            ) : (
              <BsPlusCircle size={18} />
            )
          }
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}
    </div>
  );
}
