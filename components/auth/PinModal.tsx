import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import SModal from "../ui/SModal";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { decryptPrivateKey } from "@/utils/encryption";
import { Lock } from "lucide-react";
import { capitalize } from "@/utils";
import { keychainApi } from "@/libs/keychain";
import { KeychainIcon } from "@/components/icons/KeychainIcon";

// Keychain presence never changes while the page is loaded (only an extension
// install/removal + reload does), so there is nothing to subscribe to and the
// server snapshot can stay a constant `false`.
const subscribeNoop = () => () => {};
const getKeychainAvailable = () => keychainApi.isAvailable();
const falseSnapshot = () => false;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string, remember: boolean) => void;
  /**
   * Resolve the operation via Keychain instead of a pasted key. Only offered
   * when the caller is in key mode and the extension is actually installed.
   */
  onKeychain?: () => void;
  encryptedKey: string;
  mode?: "pin" | "key";
  username?: string;
  requiredType?: AccountKeyType;
}

export default function PinModal({
  isOpen,
  onClose,
  onSubmit,
  onKeychain,
  encryptedKey,
  mode,
  username,
  requiredType,
}: Props) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const isKeyMode = mode === "key";
  const authorityLabel = capitalize(requiredType || "active") || "Private";

  // Keychain injects `window.steem_keychain` from the extension, which does
  // not exist during SSR. useSyncExternalStore keeps hydration safe: React uses
  // the `false` server snapshot while hydrating, then reads the real client
  // value — the same pattern as hooks/redux/useDeviceInfo.tsx. Keychain's
  // presence cannot change without a full page reload, so there is nothing to
  // subscribe to.
  const hasKeychain = useSyncExternalStore(
    subscribeNoop,
    getKeychainAvailable,
    falseSnapshot,
  );

  const showKeychain = isKeyMode && hasKeychain && !!onKeychain;

  const handleKeychain = () => {
    setPin("");
    onKeychain?.();
  };

  const handleSubmit = () => {
    if (!pin) {
      toast.error(isKeyMode ? "Key required" : "PIN required");
      return;
    }
    setLoading(true);

    if (isKeyMode) {
      // Simple validation for Steem private key (starts with 5, usually 51 chars)
      if (!pin.startsWith("5") || pin.length < 51) {
        toast.error("Invalid Private Key format");
        setLoading(false);
        return;
      }
      onSubmit(pin, false); // Don't remember raw keys for now
      setPin("");
      onClose();
      setLoading(false);
      return;
    }

    // Verify PIN by attempting decryption
    // Note: In a real scenario, we might want to verify without returning the key here,
    // but typically we just define correctness by whether it produces a valid key or if we can't verify easily until usage.
    // However, `decryptPrivateKey` returns empty string if fail usually?
    // Looking at `utils/encryption.ts` (assumed), it uses AES.
    // If we want to fail fast:
    try {
      const decrypted = decryptPrivateKey(encryptedKey, pin);
      if (!decrypted) {
        throw new Error("Incorrect PIN");
      }
      onSubmit(pin, remember);
      setPin("");
      setRemember(false);
      onClose();
    } catch {
      toast.error("Incorrect PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isKeyMode ? "Authentication Required" : "Security Check"}
      size="sm"
    >
      {() => (
        <>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <p className="text-center text-muted text-sm">
                {isKeyMode
                  ? `This transaction requires your ${
                      requiredType || "Active"
                    } Authority. ${
                      showKeychain
                        ? "Sign with Keychain, or enter your private key to sign locally."
                        : "Please enter your private key."
                    }`
                  : "This transaction requires your Active Authority. Please enter your PIN code to verify your identity."}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {isKeyMode && (
                <Alert
                  variant="faded"
                  color="success"
                  title=""
                  description=" Your private key will never be stored. It is only used to
                    sign this specific transaction locally on your device."
                />
              )}

              <Input
                value={pin}
                onValueChange={setPin}
                type="password"
                label={
                  isKeyMode ? `Enter ${authorityLabel} Key` : "Enter PIN Code"
                }
                placeholder={isKeyMode ? "5J..." : "****"}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoFocus
                startContent={<Lock size={16} className="text-default-400" />}
              />

              {!isKeyMode && (
                <Checkbox isSelected={remember} onValueChange={setRemember}>
                  <span className="text-sm">Remember for this session</span>
                </Checkbox>
              )}
            </div>
          </div>
          <div className="flex flex-row flex-wrap justify-end gap-2 self-end">
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            {showKeychain && (
              <Button
                variant="bordered"
                onPress={handleKeychain}
                startContent={<KeychainIcon size={18} className="text-primary" />}
              >
                Sign with Keychain
              </Button>
            )}
            <Button color="primary" onPress={handleSubmit} isLoading={loading}>
              {isKeyMode ? `Sign with ${authorityLabel} Key` : "Confirm"}
            </Button>
          </div>
        </>
      )}
    </SModal>
  );
}
