import { useAppDispatch } from "@/constants/AppFunctions";
import { getKeyType } from "@/libs/steem/condenser";
import { getAccountExt } from "@/libs/steem/sds";
import { AsyncUtils } from "@/utils/async.utils";
import { validate_account_name } from "@/utils/chainValidation";
import { getResizedAvatar } from "@/utils/parseImage";
import {
  saveCredentials,
  saveSessionKey,
  validatePassword,
} from "@/utils/user";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaLock } from "react-icons/fa6";
import SignupCard from "../SignupCard";
import AvailableAccountList from "../AvailableAccountList";
import { supabase } from "@/libs/supabase/supabase";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";

interface Props {
  addNew?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onLoginSuccess?: (auth: User) => void;
}
function KeyLogin(props: Props) {
  const { addNew, onClose, onSuccess, onLoginSuccess } = props;
  const [username, setUsername] = useState("");
  const [key, setKey] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [avatar, setAvatar] = useState("");
  const [enablePin, setEnablePin] = useState(false);
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
    const _key = key.trim();

    const usernameError = validate_account_name(_username);
    if (usernameError) {
      toast.info(usernameError);
      return;
    }

    if (!_key) {
      toast.info("Invalid private key");
      return;
    }

    if (enablePin) {
      if (!pin) {
        toast.info("Enter the pin");
        return;
      }

      if (!pin || pin !== confirmPin) {
        toast.info("Pin does not matched");
        return;
      }

      // special key can not use for pin
      if (pin === "steempro") {
        toast.info("Try different pin");
        return;
      }

      if (!validatePassword(pin)) {
        toast.info(
          "Weak pin. Please use a combination of uppercase and lowercase letters, numbers, and special characters"
        );
        return;
      }
    }

    setIsPending(true);
    await AsyncUtils.sleep(1);

    try {
      const account = await getAccountExt(_username);
      if (account) {
        const keyType = getKeyType(account, _key);
        if (keyType) {
          if (["MASTER", "OWNER"].includes(keyType.type)) {
            toast.info(
              "Higher-level keys are prohibited to protect your account"
            );
            setIsPending(false);
            return;
          }
          if (keyType.type === "MEMO") {
            toast.warning(
              "For security reasons, the memo key is only supported in private chat sessions"
            );
            setIsPending(false);
            return;
          }

          if (["ACTIVE"].includes(keyType.type) && !enablePin) {
            toast.info("Pin code is required for active key or above");
            setIsPending(false);
            setEnablePin(true);
            return;
          }
          await getAuthenticate(
            account,
            keyType.key,
            pin,
            keyType.type,
            isCurrent,
            keyType.memo
          );
        } else {
          throw new Error(`Invalid private key`);
        }
      } else {
        throw new Error(`Failed to fetch account`);
      }
    } catch (e: any) {
      toast.error(e?.message || String(e));
      setIsPending(false);
    }
  }

  function _saveCredentials(
    _username: string,
    _key: string,
    _pin: string,
    type: Keys,
    isCurrent?: boolean,
    memoKey = ""
  ) {
    const auth = saveCredentials(
      _username,
      _key,
      !enablePin ? "steempro" : _pin,
      type,
      !enablePin,
      isCurrent,
      false,
      memoKey
    );

    return auth;
  }

  async function getAuthenticate(
    account: AccountExt,
    _key: string,
    _pin: string,
    type: Keys,
    isCurrent?: boolean,
    memoKey = ""
  ) {
    async function currentLogin() {
      const supaLogin = await supabase.auth.signInAnonymously();
      if (supaLogin.error) {
        throw new Error(supaLogin.error.message);
      }

      const auth = _saveCredentials(
        account.name,
        _key,
        _pin,
        type,
        isCurrent,
        memoKey
      );
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
      saveSessionKey(_pin);

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
          key: auth?.key ?? "",
          type: type,
          memo: auth?.memo || "",
          passwordless: !enablePin,
        });
    }

    if (addNew) {
      const auth = _saveCredentials(
        account.name,
        _key,
        _pin,
        type,
        isCurrent,
        memoKey
      );

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
    toast.success(`Login successsful with private ${type} key`);
    onSuccess();
    onClose();
    setIsPending(false);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        ) {
          e.preventDefault(); 
          handleLogin(); 
        }
      }}
    >
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
      />

      <Input
        size="sm"
        value={key}
        onValueChange={setKey}
        isDisabled={isPending}
        isRequired
        label="Private key"
        placeholder="Enter your private posting key"
        type="password"
      />

      <div className="flex flex-row gap-2 w-full justify-between">
        <Checkbox
          size="sm"
          isSelected={enablePin}
          isDisabled={isPending}
          onValueChange={setEnablePin}
        >
          Set Pin Code
        </Checkbox>
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
      </div>

      {enablePin && (
        <div className=" flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <Input
              size="sm"
              value={pin}
              isRequired
              isDisabled={isPending}
              onValueChange={setPin}
              label="Pin Code"
              placeholder="Enter pin code"
              type="password"
            />

            <Input
              size="sm"
              value={confirmPin}
              onValueChange={setConfirmPin}
              isRequired
              isDisabled={isPending}
              label="Confirm Pin"
              placeholder="Re-enter pin code"
              type="password"
            />
          </div>

          <div
            className="flex items-center p-3 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 gap-2"
            role="alert"
          >
            <FaLock size={20} />
            <div className="flex flex-row gap-2">
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium text-default-700">
                  Pin Code Encryption
                </span>
                <br />
                Encrypt your private key with a personal pin for added{" "}
                <span className="text-green-600 font-semibold">security</span>.
                Optional for the private posting key.
              </p>
            </div>
          </div>
        </div>
      )}

      <SignupCard />

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
          onPress={handleLogin}
        >
          {addNew ? "Add account" : "Login"}
        </Button>
      </div>
    </form>
  );
}

export default KeyLogin;
