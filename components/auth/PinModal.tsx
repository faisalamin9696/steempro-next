import { Alert, Button, Checkbox, Input } from "@heroui/react";
import SModal from "../ui/SModal";
import { useState } from "react";
import { toast } from "sonner";
import { decryptPrivateKey } from "@/utils/encryption";
import { Lock } from "lucide-react";
import { capitalize } from "@/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string, remember: boolean) => void;
  encryptedKey: string;
  mode?: "pin" | "key";
  username?: string;
  requiredType?: AccountKeyType;
}

export default function PinModal({
  isOpen,
  onClose,
  onSubmit,
  encryptedKey,
  mode,
  username,
  requiredType,
}: Props) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const isKeyMode = mode === "key";

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
                    } Authority. Please enter your private key.`
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
                  isKeyMode
                    ? `Enter ${capitalize(requiredType!) || "Private"} Key`
                    : "Enter PIN Code"
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
          <div className="flex flex-row gap-2 self-end">
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={loading}>
              Confirm
            </Button>
          </div>
        </>
      )}
    </SModal>
  );
}
