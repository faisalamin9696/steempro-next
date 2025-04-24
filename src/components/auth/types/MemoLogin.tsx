import { useAppDispatch } from "@/libs/constants/AppFunctions";
import { getKeyType } from "@/libs/steem/condenser";
import { getAccountExt } from "@/libs/steem/sds";
import { AsyncUtils } from "@/libs/utils/async.utils";
import { getCredentials, updateMemoKey } from "@/libs/utils/user";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { FaLock } from "react-icons/fa6";
import { toast } from "sonner";

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
  const credentials = getCredentials();

  async function handleLogin() {
    const _memoKey = memoKey.trim();
    if (!_memoKey) {
      toast.info("Invalid memo key");
      return;
    }
    if (!session?.user?.name) {
      toast.error("Something went wrong!");
      return;
    }

    setIsPending(true);
    await AsyncUtils.sleep(1);

    try {
      const account = await getAccountExt(session.user.name);
      if (account) {
        const keyType = getKeyType(account, _memoKey);
        if (keyType) {
          if (keyType.type !== "MEMO") {
            toast.info("Use only private memo key");
            setIsPending(false);
            return;
          }
          updateMemoKey(_memoKey);
          toast.success(
            `Memo key is added successfully for ${session.user.name}`
          );
          onSuccess();
          onClose();
          setIsPending(false);
        } else {
          toast.error(`Invalid private memo key`);
          setIsPending(false);
        }
      }
    } catch (e) {
      toast.error(String(e));
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        size="sm"
        autoFocus
        value={memoKey}
        isRequired
        onValueChange={setMemoKey}
        isDisabled={isPending}
        label="Memo key"
        placeholder="Enter memo key for private chat"
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
              To enable{" "}
              <span className="font-medium text-default-700">
                end-to-end encrypted messaging
              </span>
              , please provide your{" "}
              <span className="font-medium text-green-600">Memo Key</span>.{" "}
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
          {"Submit"}
        </Button>
      </div>
    </div>
  );
}

export default MemoLogin;
