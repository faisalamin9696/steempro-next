import {
  addToCurrent,
  removeSessionToken,
  saveSessionKey,
} from "@/libs/utils/user";
import { Chip } from "@nextui-org/chip";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import React, { memo, useState } from "react";
import SAvatar from "../SAvatar";
import { useAppDispatch } from "@/libs/constants/AppFunctions";
import { getAuthorExt } from "@/libs/steem/sds";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { supabase } from "@/libs/supabase";

interface Props {
  user: User;
  defaultAccount?: User;
  handleSwitchSuccess?: (user?: User) => void;
  className?: string;
  switchText?: string;
  isLogin?: boolean;
  isDisabled?: boolean;
}

export const keysColorMap = {
  POSTING: "warning",
  ACTIVE: "success",
  OWNER: "danger",
};

export default memo(function AccountItemCard(props: Props) {
  const {
    defaultAccount,
    user,
    handleSwitchSuccess,
    switchText,
    isLogin,
    isDisabled,
  } = props;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  function onComplete(error?: any | null) {
    // remogve session token when user changed not for changing between keys
    if (user.username !== defaultAccount?.username) {
      removeSessionToken(user.username);
      removeSessionToken(defaultAccount?.username);
    }

    setSwitching(false);
    if (error) toast.error(error.message || JSON.stringify(error));
    else router.refresh();
  }

  async function handleSwitch() {
    // authenticateUser();
    setSwitching(true);
    try {
      const account = await getAuthorExt(user.username);
      if (account) {
        supabase.auth
          .signInAnonymously()
          .then(async () => {
            addToCurrent(account.name, user.key, user.type);

            const response = await signIn("credentials", {
              username: user.username,
              redirect: false,
            });

            if (!response?.ok) {
              onComplete(response);
              return;
            }

            dispatch(
              saveLoginHandler({
                ...account,
                login: true,
                encKey: user.key,
              })
            );
            handleSwitchSuccess && handleSwitchSuccess(user);
            saveSessionKey("");
            if (isLogin)
              toast.success(`Login successsful with private ${user.type} key`);
            else toast.success(`Successfully switched to ${user.username}`);

            onComplete();
          })
          .catch((error) => {
            onComplete(error);
          });
      }
    } catch (e) {
      onComplete(e);
    }
  }

  const isDefault =
    defaultAccount?.username === user.username &&
    defaultAccount?.type === user.type;

  return (
    <Card className={twMerge("w-full bg-foreground/10", props.className)}>
      <CardBody
        className={twMerge(
          "flex flex-row gap-2  items-center",
          props.className
        )}
      >
        <SAvatar size="xs" username={user.username} />
        <div>
          <div className="flex flex-row gap-1 items-center">
            <p className="text-sm">{user.username}</p>

            <Chip
              variant="flat"
              size="sm"
              title={user.type}
              className=" justify-center"
              color={keysColorMap[user.type]}
            >
              {user.type[0]}
            </Chip>
          </div>
          {isDefault ? (
            <Chip color="success" size="sm" variant="flat">
              Default
            </Chip>
          ) : (
            <Button
              size="sm"
              isLoading={switching}
              isDisabled={switching || isDisabled}
              radius="full"
              onClick={handleSwitch}
              className="min-w-0  h-6 bg-foreground/20"
            >
              {switchText ?? "Switch"}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
});
