import { getKeyType } from "@/libs/steem/condenser";
import { getAccountExt } from "@/libs/steem/sds";
import { AsyncUtils } from "@/utils/async.utils";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { FaLock } from "react-icons/fa6";
import { toast } from "sonner";
import AvailableAccountList from "../AvailableAccountList";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  onClose: () => void;
  onActiveSuccess?: (key: string) => void;
}
function ActiveKeyAuth(props: Props) {
  const { onClose, onActiveSuccess } = props;
  const [activeKey, setActiveKey] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();
  const { t } = useLanguage();

  async function handleLogin() {
    const _activeKey = activeKey.trim();
    if (!_activeKey) {
      toast.info(t('auth.invalid_active_key'));
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
        const keyType = getKeyType(account, _activeKey);
        if (keyType) {
          if (keyType.type !== "ACTIVE") {
            toast.info(t('auth.active_key_required'));
            setIsPending(false);
            return;
          }
          toast.success(t('auth.signed_successfully'));
          onActiveSuccess?.(keyType.key);
          onClose();
          setIsPending(false);
        } else {
          toast.error(t('auth.invalid_active_key'));
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
        value={activeKey}
        isRequired
        onValueChange={setActiveKey}
        isDisabled={isPending}
        label={t('auth.private_active_key')}
        placeholder={t('auth.enter_private_active_key')}
        type="password"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
      />

      <div
        className="flex items-start p-3 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 gap-3"
        role="alert"
      >
        <FaLock size={20} className="mt-1" />

        <div className="flex flex-col gap-1">
          <p className="text-sm text-default-500">
            {t('auth.active_key_notice_1')}{" "}
            <span className="font-medium text-green-600">
              {t('auth.private_active_key')}
            </span>{" "}
            {t('auth.active_key_notice_2')}
          </p>

          <p className="text-xs text-default-400 leading-4">
            {t('auth.key_security_notice_1')}{" "}
            <span className="font-semibold text-default-500">{t('auth.never_stored')}</span>{" "}
            {t('auth.key_security_notice_2')}
          </p>
        </div>
      </div>

      {session?.user?.name && (
        <AvailableAccountList
          switchText={t('auth.switch')}
          handleSwitchSuccess={onClose}
          filter={{ username: session?.user?.name, type: "ACTIVE" }}
        />
      )}

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
          {t('auth.sign')}
        </Button>
      </div>
    </div>
  );
}

export default ActiveKeyAuth;
