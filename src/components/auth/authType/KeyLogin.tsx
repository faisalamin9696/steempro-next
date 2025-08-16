import { useAppDispatch } from "@/constants/AppFunctions";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { supabase } from "@/libs/supabase";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";

interface Props {
  addNew?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onLoginSuccess?: (auth: User) => void;
}
function KeyLogin(props: Props) {
  const { addNew, onClose, onSuccess, onLoginSuccess } = props;
  const { t } = useLanguage();
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
      toast.info(t('auth.invalid_key'));
      return;
    }

    if (enablePin) {
      if (!pin) {
        toast.info(t('auth.enter_pin'));
        return;
      }

      if (!pin || pin !== confirmPin) {
        toast.info(t('auth.pin_mismatch'));
        return;
      }

      // special key can not use for pin
      if (pin === "steemcn") {
        toast.info(t('auth.try_different_pin'));
        return;
      }

      if (!validatePassword(pin)) {
        toast.info(t('auth.weak_pin'));
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
            toast.info(t('auth.higher_key_prohibited'));
            setIsPending(false);
            return;
          }
          if (keyType.type === "MEMO") {
            toast.warning(t('auth.memo_key_warning'));
            setIsPending(false);
            return;
          }

          if (["ACTIVE"].includes(keyType.type) && !enablePin) {
            toast.info(t('auth.pin_required'));
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
          throw new Error(t('auth.invalid_private_key'));
        }
      } else {
        throw new Error(t('auth.fetch_account_failed'));
      }
    } catch (e: any) {
      toast.error(t('common.error_occurred', { error: e?.message || String(e) }));
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
      !enablePin ? "steemcn" : _pin,
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
        throw new Error(t('auth.something_wrong'));
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
        throw new Error(t('auth.something_wrong'));
      }
      if (isCurrent) await currentLogin();
      toast.success(t('auth.account_added', { username: account.name }));
      onSuccess();
      onClose();
      setIsPending(false);
      return;
    }

    await currentLogin();
    toast.success(t('auth.login_successful', { type }));
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
        label={t('auth.username')}
        autoFocus
        value={username}
        endContent={<Avatar src={getResizedAvatar(avatar)} size="sm" />}
        onValueChange={setUsername}
        isDisabled={isPending}
        placeholder={t('auth.enter_username')}
        type="text"
      />

      <Input
        size="sm"
        value={key}
        onValueChange={setKey}
        isDisabled={isPending}
        isRequired
        label={t('auth.private_key')}
        placeholder={t('auth.enter_private_key')}
        type="password"
      />

      <div className="flex flex-row gap-2 w-full justify-between">
        <Checkbox
          size="sm"
          isSelected={enablePin}
          isDisabled={isPending}
          onValueChange={setEnablePin}
        >
          {t('auth.set_pin_code')}
        </Checkbox>
        {addNew && (
          <Checkbox
            size="sm"
            isSelected={isCurrent}
            isDisabled={isPending}
            onValueChange={setIsCurrent}
          >
            {t('auth.make_default')}
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
              label={t('auth.pin_code')}
              placeholder={t('auth.enter_pin_code')}
              type="password"
            />

            <Input
              size="sm"
              value={confirmPin}
              onValueChange={setConfirmPin}
              isRequired
              isDisabled={isPending}
              label={t('auth.confirm_pin')}
              placeholder={t('auth.reenter_pin_code')}
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
                  {t('auth.pin_code_encryption')}
                </span>
                <br />
                {t('auth.pin_code_description')}{" "}
                <span className="text-green-600 font-semibold">{t('auth.security')}</span>.
                {t('auth.pin_code_optional')}
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
          {t('auth.cancel')}
        </Button>

        <Button
          fullWidth
          color="primary"
          isLoading={isPending}
          onPress={handleLogin}
        >
          {addNew ? t('auth.add_account') : t('auth.login')}
        </Button>
      </div>
    </form>
  );
}

export default KeyLogin;
