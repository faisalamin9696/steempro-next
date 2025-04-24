import { AsyncUtils } from "@/libs/utils/async.utils";
import { getCredentials, getUserAuth, saveSessionKey } from "@/libs/utils/user";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";

import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLogin } from "../AuthProvider";
import secureLocalStorage from "react-secure-storage";
import { encryptPrivateKey } from "@/libs/utils/encryption";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  onLoginSuccess?: (auth: User) => void;
}
function UnlockAcccount(props: Props) {
  const { onClose, onSuccess, onLoginSuccess } = props;
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { data: session, status } = useSession();
  let credentials = getCredentials();
  const [remember, setRemember] = useState(
    credentials?.type === "POSTING" || credentials?.type === "MEMO"
  );
  const { authenticateUser } = useLogin();

  async function handleUnlock() {
    const _password = password;
    if (!_password) {
      toast.info("Invalid pin code");
      return;
    }
    if (!session?.user?.name) {
      toast.error("Something went wrong!");
      return;
    }

    setIsPending(true);
    await AsyncUtils.sleep(2);

    credentials = getCredentials(_password);

    if (!credentials?.key) {
      toast.error("Invalid credentials");
      setIsPending(false);
      return;
    }
    const enc = saveSessionKey(_password);
    if (remember) {
      const auth = getUserAuth();
      if (auth)
        secureLocalStorage.setItem(
          `token_${credentials.username}`,
          encryptPrivateKey(_password, auth?.key.toString()?.substring(0, 20))
        );
    }

    toast.success("Unlocked");
    onLoginSuccess && onLoginSuccess({ ...credentials, key: enc });
    onSuccess();
    onClose();
    setIsPending(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        size="sm"
        autoFocus
        value={password}
        isRequired
        onValueChange={setPassword}
        isDisabled={isPending}
        label="Encryption password"
        placeholder="Enter password to unlock account"
        type="password"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleUnlock();
          }
        }}
      />

      <div className="flex flex-row justify-between items-center">
        {(credentials?.type === "POSTING" || credentials?.type === "MEMO") && (
          <Checkbox
            size="sm"
            isSelected={remember}
            isDisabled={isPending}
            onValueChange={setRemember}
          >
            Remember me
          </Checkbox>
        )}

        <Button
          className="text-default-500"
          variant="light"
          isDisabled={isPending}
          onPress={() => {
            authenticateUser(true);
          }}
        >
          Forgot password?
        </Button>
      </div>

      <div className="flex gap-2 items-center">
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
          onPress={handleUnlock}
        >
          Unlock
        </Button>
      </div>
    </div>
  );
}

export default UnlockAcccount;
