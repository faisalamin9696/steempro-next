import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { addProfileHandler } from "@/hooks/redux/reducers/ProfileReducer";
import { followUser, unfollowUser } from "@/libs/steem/condenser";
import { Button } from "@heroui/button";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { FaPencil } from "react-icons/fa6";
import { useRouter } from "next13-progressbar";
import { useSession } from "next-auth/react";
import { BsPlusCircle } from "react-icons/bs";
import { SlMinus } from "react-icons/sl";
import { Spinner } from "@heroui/spinner";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  account: AccountExt;
  size?: "md" | "sm" | "lg";
};

export default function FollowButton(props: Props) {
  const { account, size } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { data: session } = useSession();
  const followingAccount = account?.name;
  const isFollowing = account?.observer_follows_author === 1;
  const dispatch = useAppDispatch();
  const isSelf = session?.user?.name === account.name;

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

    if (isFollowing) toast.success(t("profile.unfollowed_success"));
    else toast.success(t("profile.followed_success"));
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
      toast.error(t("common.invalid_credentials"));
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
    
  const { t } = useLanguage();

  return (
    <div className="flex flex-row items-start gap-1 justify-center">
      {isSelf && (
        <Button
          size={size ?? "md"}
          variant="flat"
          title={t("profile.edit")}
          className={"bg-foreground/10"}
          onPress={handleAccountEdit}
        >
          <FaPencil className="mr-1" /> {t("profile.edit")}
        </Button>
      )}

      {!isSelf && (
        <Button
          isDisabled={isPending}
          radius="full"
          size={size ?? "md"}
          color={isFollowing ? "default" : "primary"}
          // isLoading={isPending}
          title={isFollowing ? t("profile.unfollow") : t("profile.follow")}
          variant={"solid"}
          onPress={handleFollow}
          // isIconOnly={isPending}
          startContent={
            isPending ? (
              <Spinner
                color="current"
                size="sm"
                classNames={{ base: " h-[18px] w-[18px]" }}
              />
            ) : isFollowing ? (
              <SlMinus size={18} />
            ) : (
              <BsPlusCircle size={18} />
            )
          }
        >
          {isFollowing ? t("profile.unfollow") : t("profile.follow")}
        </Button>
      )}
    </div>
  );
}
