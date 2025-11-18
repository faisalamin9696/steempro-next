import { addToCurrent, removeSessionToken, saveSessionKey } from "@/utils/user";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import React, { useState } from "react";
import SAvatar from "../ui/SAvatar";
import { useAppDispatch } from "@/constants/AppFunctions";
import { getAccountExt } from "@/libs/steem/sds";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { supabase } from "@/libs/supabase/supabase";
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
  onSwitching?: (switching: boolean) => void;
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
  const {
    defaultAccount,
    user,
    handleSwitchSuccess,
    switchText,
    isDisabled,
    onSwitching,
  } = props;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();

  async function handleSwitch() {
    setIsPending(true);
    onSwitching?.(true);
    try {
      const account = await getAccountExt(user.username);
      if (account) {
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
        onSwitching?.(false);
        router.refresh();
      } else {
        throw new Error(`Failed to fetch account`);
      }
    } catch (e: any) {
      toast.error(e?.message || String(e));
      setIsPending(false);
      onSwitching?.(false);
    }
  }

  const isDefault =
    defaultAccount?.username === user.username &&
    defaultAccount?.type === user.type;

  return (
    <Card
      shadow="sm"
      className={twMerge(
        "flex flex-col gap-2 w-full p-2 comment-card border-1 border-default-900/10",
        props.className
      )}
    >
      <div className=" flex flex-col gap-2 items-start">
        <div className="flex flex-row items-start gap-2">
          <SAvatar size="1xs" username={user.username} />

          <div className="flex flex-col items-start gap-2">
            <p className="text-sm">{user.username}</p>

            {isDefault ? (
              <Button
                size="sm"
                isLoading={isPending}
                radius="full"
                variant="flat"
                disabled
                className="min-w-0 h-6"
                color="success"
              >
                {"Default"}
              </Button>
            ) : (
              <Button
                size="sm"
                isLoading={isPending}
                isDisabled={isPending || isDisabled}
                radius="full"
                variant="solid"
                onPress={handleSwitch}
                className="min-w-0 h-6"
                color="primary"
              >
                {switchText ?? "Switch"}
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-1 items-center">
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
      </div>
    </Card>
  );
}
