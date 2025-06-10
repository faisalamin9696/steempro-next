import { useAppDispatch } from "@/constants/AppFunctions";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import {
  requestKeychainSignBuffer,
  validateKeychain,
} from "@/libs/steem/condenser";
import { getAccountExt } from "@/libs/steem/sds";
import { supabase } from "@/libs/supabase";
import { AsyncUtils } from "@/utils/async.utils";
import { validate_account_name } from "@/utils/chainValidation";
import { getResizedAvatar } from "@/utils/parseImage";
import { saveCredentials, saveSessionKey } from "@/utils/user";
import { Avatar } from "@heroui/avatar";
import { Checkbox } from "@heroui/checkbox";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { toast } from "sonner";
import AvailableAccountList from "../AvailableAccountList";

interface Props {
  onClose: () => void;
  addNew?: boolean;
  onSuccess: () => void;
  onLoginSuccess?: (auth: User) => void;
}
function KeychainLogin(props: Props) {
  const { onClose, addNew, onSuccess, onLoginSuccess } = props;
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isPending, setIsPending] = useState(false);
  const dispatch = useAppDispatch();
  const [isCurrent, setIsCurrent] = React.useState(!addNew);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      const _username = username.trim().toLowerCase();

      const usernameError = validate_account_name(_username);
      if (!usernameError) {
        setAvatar(_username);
      }
    }, 1000);

    return () => clearTimeout(timeOut);
  }, [username]);

  async function handleLogin() {
    const _username = username.trim().toLowerCase();

    const usernameError = validate_account_name(_username);
    if (usernameError) {
      toast.info(usernameError ?? "Invalid username");
      return;
    }

    try {
      await validateKeychain();
      setIsPending(true);
      await AsyncUtils.sleep(1);
      const account = await getAccountExt(_username);
      if (account) {
        const isSigned = await requestKeychainSignBuffer(
          _username,
          "SteemPro Authentication",
          "POSTING"
        );

        if (isSigned) {
          await getAuthenticate(account);
        }
      } else {
        throw new Error(`Failed to fetch account`);
      }
    } catch (e: any) {
      toast.error(e?.message || String(e));
      setIsPending(false);
    }
  }

  function _saveCredentials(_username: string, current?: boolean) {
    const auth = saveCredentials(
      _username,
      "keychain",
      "steempro",
      "POSTING",
      true,
      current,
      true
    );

    return auth;
  }

  async function getAuthenticate(account: AccountExt) {
    async function currentLogin() {
      const supaLogin = await supabase.auth.signInAnonymously();
      if (supaLogin.error) {
        throw new Error(supaLogin.error.message);
      }

      const auth = _saveCredentials(account.name, isCurrent);
      if (!auth) {
        throw new Error("Something went wrong!");
      }

      const loginSession = await signIn("credentials", {
        username: account.name,
        redirect: false,
      });

      if (loginSession?.error) {
        throw new Error(loginSession.error);
      }
      saveSessionKey("");

      dispatch(
        saveLoginHandler({
          ...account,
          login: true,
          encKey: auth?.key,
        })
      );
      onLoginSuccess &&
        onLoginSuccess({
          username: account.name,
          key: "keychain",
          type: "POSTING",
          memo: auth?.memo || "",
          passwordless: true,
          keychainLogin: true,
        });
    }

    if (addNew) {
      const auth = _saveCredentials(account.name, isCurrent);

      if (!auth) {
        throw new Error("Something went wrong!");
      }
      if (isCurrent) await currentLogin();

      toast.success(`${account.name} added successfully`);
      onSuccess();
      onClose();
      setIsPending(false);
      return;
    }

    await currentLogin();
    toast.success(`Login successsful with keychain`);
    onSuccess();
    onClose();
    setIsPending(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        isRequired
        size="sm"
        label="Username"
        autoFocus
        value={username}
        endContent={<Avatar src={getResizedAvatar(avatar)} size="sm" />}
        onValueChange={setUsername}
        isDisabled={isPending}
        placeholder="Enter your username"
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
      />

      {!window?.steem_keychain && (
        <div
          className="flex items-center p-3 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 gap-2"
          role="alert"
        >
          <FaInfoCircle size={20} />
          <div className="flex flex-row gap-2">
            <span className="font-medium">Keychain is not installed!</span>
            <a
              href="https://chromewebstore.google.com/detail/jhgnbkkipaallpehbohjmkbjofjdmeid?utm_source=item-share-cb"
              target="_blank"
              className="underline"
            >
              install keychain
            </a>
          </div>
        </div>
      )}

      {addNew && (
        <Checkbox
          size="sm"
          isSelected={isCurrent}
          isDisabled={isPending}
          onValueChange={setIsCurrent}
        >
          Make Default
        </Checkbox>
      )}

      <AvailableAccountList handleSwitchSuccess={onClose} />

      <div className="flex gap-2 justify-end">
        <Button
          color="danger"
          variant="light"
          onPress={onClose}
          isDisabled={isPending}
        >
          Cancel
        </Button>

        <Button
          fullWidth
          color="primary"
          isLoading={isPending}
          onPress={() => {
            handleLogin();
          }}
        >
          {addNew ? "Add account" : "Login"}
        </Button>
      </div>
    </div>
  );
}

export default KeychainLogin;
