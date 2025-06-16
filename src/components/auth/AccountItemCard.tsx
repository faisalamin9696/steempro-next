import { addToCurrent, removeSessionToken, saveSessionKey } from "@/utils/user";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import React, { useState } from "react";
import SAvatar from "../SAvatar";
import { useAppDispatch } from "@/constants/AppFunctions";
import { getAccountExt } from "@/libs/steem/sds";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { supabase } from "@/libs/supabase";
import { clearCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import Image from "next/image";
import { MdVpnKey } from "react-icons/md";
import { BsChatDotsFill } from "react-icons/bs";

interface Props {
  user: User;
  defaultAccount?: User;
  handleSwitchSuccess: (user?: User) => void;
  className?: string;
  switchText?: string;
  isDisabled?: boolean;
}

export const keysColorMap = {
  POSTING: "warning",
  ACTIVE: "success",
  OWNER: "danger",
};

export const BorderColorMap = {
  POSTING: "orange",
  ACTIVE: "#22c55e",
  OWNER: "red",
};

export default function AccountItemCard(props: Props) {
  const { defaultAccount, user, handleSwitchSuccess, switchText, isDisabled } =
    props;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();

  async function handleSwitch() {
    setIsPending(true);
    try {
      const account = await getAccountExt(user.username);
      if (account) {
        setIsPending(true);
        const supaLogin = await supabase.auth.signInAnonymously();
        if (supaLogin.error) {
          throw new Error(supaLogin.error.message);
        }

        addToCurrent(
          account.name,
          user.key,
          user.type,
          user.passwordless ?? false,
          user.memo
        );

        const loginSession = await signIn("credentials", {
          username: account.name,
          redirect: false,
        });

        if (loginSession?.error) {
          throw new Error(loginSession.error);
        }

        dispatch(
          saveLoginHandler({
            ...account,
            login: true,
            encKey: user.key,
          })
        );
        // clear redux comments cache
        dispatch(clearCommentHandler());
        saveSessionKey("");

        if (!session?.user?.name)
          toast.success(`Login successsful with private ${user.type} key`);
        else toast.success(`Successfully switched to ${user.username}`);

        if (user.username !== defaultAccount?.username) {
          removeSessionToken(user.username);
          removeSessionToken(defaultAccount?.username);
        }

        handleSwitchSuccess({ ...user, username: account.name });
        setIsPending(false);
        router.refresh();
      } else {
        throw new Error(`Failed to fetch account`);
      }
    } catch (e: any) {
      toast.error(e?.message || String(e));
      setIsPending(false);
    }
  }

  const isDefault =
    defaultAccount?.username === user.username &&
    defaultAccount?.type === user.type;

  return (
    <Card
      className={twMerge(
        "flex flex-col gap-2 w-full p-2 shadow-md comment-card",
        props.className
      )}
    >
      <div className=" flex flex-col-reverse gap-2 items-start">
        <div className="flex flex-row  gap-2">
          <p className="text-sm">{user.username}</p>
          <div className="flex flex-row gap-2 items-center w-max">
            {user.keychainLogin ? (
              <Image
                title="Keychain"
                height={20}
                width={20}
                alt="K"
                src={"/keychain_transparent.svg"}
              />
            ) : (
              <div className="flex flex-row items-center gap-2">
                <Chip
                  variant="flat"
                  size="sm"
                  title={user.type}
                  className=" justify-center"
                  color={keysColorMap[user.type]}
                >
                  {user.type[0]}
                </Chip>

                {!user?.passwordless && (
                  <MdVpnKey className=" text-blue-500" size={16} />
                )}
              </div>
            )}
            {user.memo ? <BsChatDotsFill className="text-default-700" /> : null}
          </div>
        </div>

        <div className="flex flex-row items-cenetrt gap-2">
          <SAvatar size="xs" username={user.username} />

          {isDefault ? (
            <Chip color="success" size="sm" variant="flat">
              Default
            </Chip>
          ) : (
            <Button
              size="sm"
              isLoading={isPending}
              isDisabled={isPending || isDisabled}
              radius="full"
              onPress={handleSwitch}
              className="min-w-0 h-6 bg-foreground/20"
            >
              {switchText ?? "Switch"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
