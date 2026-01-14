import { Button } from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccountsContext } from "./AccountsContext";
import SInput from "../ui/SInput";
import { normalizeUsername } from "@/utils/editor";

interface KeychainLoginProps {
  onSuccess: () => void;
}

function KeychainLogin({ onSuccess }: KeychainLoginProps) {
  const { loginWithKeychain } = useAccountsContext();
  let [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    username = normalizeUsername(username);

    if (!username.trim()) {
      toast.error("Username required", {
        description: "Please enter your Steem username",
      });
      return;
    }

    setLoading(true);

    try {
      await loginWithKeychain(username);
      onSuccess();
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <SInput
          value={username}
          onValueChange={setUsername}
          placeholder="Enter username"
          label="Username"
          classNames={{
            inputWrapper: "bg-default-100",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />
        <p className="text-xs text-muted px-1">
          Login securely using Steem Keychain extension.
        </p>
      </div>

      <Button
        onPress={handleLogin}
        isLoading={loading}
        color="primary"
        className="font-medium"
        fullWidth
      >
        Login with Keychain
      </Button>
    </div>
  );
}

export default KeychainLogin;
