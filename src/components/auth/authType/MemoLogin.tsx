import { useAppDispatch } from "@/constants/AppFunctions";
import { getKeyType } from "@/libs/steem/condenser";
import { getAccountExt } from "@/libs/steem/sds";
import { AsyncUtils } from "@/utils/async.utils";
import { getCredentials, updateMemoKey } from "@/utils/user";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { FaLock } from "react-icons/fa6";
import { toast } from "sonner";
import { mutate } from "swr";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  onLoginSuccess?: (auth: User) => void;
}
function MemoLogin(props: Props) {
  const { onClose, onSuccess, onLoginSuccess } = props;
  const [memoKey, setMemoKey] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();
  const { t } = useLanguage();

  async function handleLogin() {
    const _memoKey = memoKey.trim();
    if (!_memoKey) {
      toast.info(t('auth.invalid_memo_key'));
      return;
    }
    if (!session?.user?.name) {
      toast.error(t('auth.something_wrong'));
      return;
    }

    setIsPending(true);
    await AsyncUtils.sleep(1);

    try {
      const account = await getAccountExt(session.user.name);
      if (account) {
        const keyType = getKeyType(account, _memoKey);
        if (keyType) {
          const credentials = getCredentials();

          if (keyType.type !== "MEMO") {
            toast.info(t('auth.use_only_memo_key'));
            setIsPending(false);
            return;
          }
          updateMemoKey(_memoKey);
          toast.success(
            t('auth.memo_key_added_successfully', { username: session.user.name })
          );
          onLoginSuccess &&
            onLoginSuccess({
              ...credentials!,
              username: account.name,
              memo: keyType.memo,
            });
          mutate(`unread-chat-${account.name}`);
          onSuccess();
          onClose();
          setIsPending(false);
        } else {
          toast.error(t('auth.invalid_private_memo_key'));
          setIsPending(false);
        }
      }
    } catch (e) {
      toast.error(t('auth.error_message', { error: String(e) }));
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        size="md"
        autoFocus
        value={memoKey}
        isRequired
        onValueChange={setMemoKey}
        isDisabled={isPending}
        label={t('auth.private_memo_key')}
        placeholder={t('auth.enter_memo_key_for_chat')}
        type="password"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
      />

      {
        <div
          className="flex items-center p-3 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 gap-2"
          role="alert"
        >
          <FaLock size={20} />
          <div className="flex flex-row gap-2">
            <p className="mt-2 text-sm text-default-500">
              {t('auth.memo_notice_1')}{" "}
              <span className="font-medium text-default-700">
                {t('auth.end_to_end_encrypted')}
              </span>
              {t('auth.memo_notice_2')}{" "}
              <span className="font-medium text-green-600">{t('auth.memo_key')}</span>.{" "}
              <br />
            </p>
          </div>
        </div>
      }

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
          onPress={() => {
            handleLogin();
          }}
        >
          {t('auth.submit')}
        </Button>
      </div>
    </div>
  );
}

export default MemoLogin;
