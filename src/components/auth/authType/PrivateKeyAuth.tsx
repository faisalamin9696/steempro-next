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
import { capitalize } from "@/constants/AppConstants";

interface Props {
  onClose: () => void;
  onActiveSuccess?: (key: string) => void;
  type: Keys;
}
function PrivateKeyAuth(props: Props) {
  const { onClose, onActiveSuccess, type = "ACTIVE" } = props;
  const [activeKey, setActiveKey] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();

  async function handleLogin() {
    const _activeKey = activeKey.trim();
    if (!_activeKey) {
      toast.info("Invalid private active key");
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
        const keyType = getKeyType(account, _activeKey);
        if (keyType) {
          if (keyType.type !== type) {
            toast.info(`Private ${type.toLowerCase()} required`);
            setIsPending(false);
            return;
          }
          toast.success("Signed");
          onActiveSuccess?.(keyType.key);
          onClose();
          setIsPending(false);
        } else {
          toast.error(`Invalid private active key`);
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
        size="md"
        autoFocus
        value={activeKey}
        isRequired
        onValueChange={setActiveKey}
        isDisabled={isPending}
        label={`Private ${type?.toLowerCase()} key`}
        placeholder={`Enter private ${type?.toLowerCase()} key`}
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
            To proceed, please provide your{" "}
            <span className="font-medium text-green-600">
              Private {capitalize(type)} Key
            </span>{" "}
            to sign the transaction.
          </p>

          <p className="text-xs text-default-400 leading-4">
            Your private key is used only for temporary, local signing. It is{" "}
            <span className="font-semibold text-default-500">never stored</span>{" "}
            or sent anywhere.
          </p>
        </div>
      </div>

      {session?.user?.name && (
        <AvailableAccountList
          switchText="Switch"
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
          {"Sign"}
        </Button>
      </div>
    </div>
  );
}

export default PrivateKeyAuth;
