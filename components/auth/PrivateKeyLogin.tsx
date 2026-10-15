import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import { useEffect, useState } from "react";
import { useAccountsContext } from "./AccountsContext";
import { steemApi } from "@/libs/steem";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Fingerprint,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { PrivateKey } from "@steempro/dsteem";
import SInput from "../ui/SInput";
import { normalizeUsername } from "@/utils/editor";
import {
  describeBiometricError,
  describeBiometricStatus,
  enrollBiometric,
  getBiometricStatus,
  type BiometricEnrollment,
  type BiometricStatus,
} from "@/utils/biometrics";

function PrivateKeyLogin({ onSuccess }: { onSuccess: () => void }) {
  const { loginWithKey, isPending } = useAccountsContext();
  let [username, setUsername] = useState("");
  const [key, setKey] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [verifiedType, setVerifiedType] = useState<
    "posting" | "active" | "owner" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  // Posting keys are allowed to log in without a PIN. The user has to opt in
  // explicitly; Active/Owner keys are always PIN-protected regardless.
  const [usePin, setUsePin] = useState(false);
  // Device unlock (fingerprint / Face ID) is only offered where the browser
  // has a platform authenticator that verifies the user — and only alongside
  // a PIN, which stays the fallback for contexts without WebAuthn.
  const [useBiometric, setUseBiometric] = useState(false);
  // null = not probed yet. The three non-"ready" values each carry their own
  // explanation so the form can say *why* device unlock is missing.
  const [bioStatus, setBioStatus] = useState<BiometricStatus | null>(null);

  useEffect(() => {
    let alive = true;
    const check = () => {
      getBiometricStatus().then((status) => {
        if (alive) setBioStatus(status);
      });
    };

    check();

    // Re-probe when the tab is focused or becomes visible. Some browsers
    // only settle the availability promise once the page is actually in
    // front, so a single mount-time "no" would otherwise stick forever.
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const bioAvailable = bioStatus === "ready";

  const isVerified = !!verifiedType;
  const isHighAuth = verifiedType === "active" || verifiedType === "owner";
  const showPinFields = isHighAuth || usePin;

  async function handleVerify() {
    username = normalizeUsername(username);
    if (!username.trim() || !key.trim()) {
      toast.error("Username and Key required");
      return;
    }
    setLoading(true);
    try {
      let keyToVerify = key;
      let isPassword = false;

      // Check if it looks like a WIF (starts with 5, ~51 chars)
      // Or just try to create PrivateKey. If fail, it's a password.
      try {
        PrivateKey.fromString(key);
      } catch {
        isPassword = true;
      }

      if (isPassword) {
        // Derive Active Key from Password
        try {
          const derivedKey = PrivateKey.fromLogin(
            username,
            key,
            "active",
          ).toString();
          keyToVerify = derivedKey;
          toast.info("Master Password verified", {
            description: "Derived Active Key for security.",
          });
        } catch (e) {
          throw new Error("Invalid Key or Password format");
        }
      }

      const type = await steemApi.detectKeyAuthority(username, keyToVerify);

      if (type === "unknown") {
        toast.error("Invalid key", {
          description: "This key does not belong to the user.",
        });
        setVerifiedType(null);
      } else if (type === "memo") {
        toast.error("Memo Key Detected", {
          description:
            "Please use your Posting or Active key. You can add your Memo key later in settings.",
        });
        setVerifiedType(null);
      } else if (type === "owner") {
        toast.error("Security Warning", {
          description:
            "Owner Keys are not allowed. Please use your Active or Posting key.",
        });
        setVerifiedType(null);
      } else {
        setVerifiedType(type as "posting" | "active");
        if (isPassword) {
          setKey(keyToVerify); // Replace password with derived key
        }
        toast.success(`Verified: ${type.toUpperCase()} Key`);
      }
    } catch (e: any) {
      toast.error("Error", { description: e.message });
      setVerifiedType(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    username = normalizeUsername(username);

    // Posting keys can skip the PIN — the key is then encrypted with the app
    // secret instead of a user PIN. Active/Owner keys must always have one.
    const pinToSave = showPinFields ? pin : "";

    if (isHighAuth && (!pinToSave || pinToSave.length < 4)) {
      toast.error("PIN Required", {
        description:
          "A PIN of at least 4 digits is required for Active/Owner keys.",
      });
      return;
    }

    if (pinToSave && pinToSave.length < 4) {
      toast.error("PIN Too Short", {
        description: "Please use a PIN of at least 4 characters.",
      });
      return;
    }

    if (pinToSave && pinToSave !== confirmPin) {
      toast.error("PIN Mismatch", { description: "PINs do not match." });
      return;
    }

    // Everything above is synchronous, so the browser still holds the user
    // activation from the Login press — which is what `credentials.create()`
    // needs. Do this before `loginWithKey` (which awaits) or the prompt is
    // silently refused.
    let biometric: BiometricEnrollment | undefined;
    if (useBiometric && showPinFields && bioAvailable && pinToSave) {
      try {
        biometric = await enrollBiometric(
          username,
          (verifiedType as AccountKeyType) || "posting",
        );
      } catch (e) {
        toast.warning("Device unlock skipped", {
          description: `${describeBiometricError(e)} You can still log in with your PIN.`,
        });
      }
    }

    try {
      await loginWithKey(
        username,
        key,
        pinToSave || undefined,
        (verifiedType as "posting" | "active" | "memo") || "posting",
        biometric,
      );
      onSuccess();
    } catch (e: any) {
      toast.error("Login Failed", { description: e.message });
    }
  }

  const resetPin = () => {
    setPin("");
    setConfirmPin("");
    setUsePin(false);
    setUseBiometric(false);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex flex-col gap-4">
      <SInput
        value={username}
        onValueChange={(val) => {
          setUsername(val);
          setVerifiedType(null);
        }}
        placeholder="Enter username"
        label="Username"
        isDisabled={isVerified}
      />

      <Input
        value={key}
        onValueChange={(val) => {
          setKey(val);
          setVerifiedType(null);
          resetPin();
        }}
        placeholder="Private Key (Posting or Active)"
        label="Private Key"
        isDisabled={isVerified}
        type={isVisible ? "text" : "password"}
        classNames={{ inputWrapper: "bg-default-100" }}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={toggleVisibility}
          >
            {isVisible ? (
              <EyeOff className="text-2xl text-default-400 pointer-events-none" />
            ) : (
              <Eye className="text-2xl text-default-400 pointer-events-none" />
            )}
          </button>
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") handleVerify();
        }}
      />

      {!isVerified && (
        <Button
          color="primary"
          variant="flat"
          onPress={handleVerify}
          isLoading={loading}
        >
          Verify Key
        </Button>
      )}

      {isVerified && (
        <div className="flex flex-col gap-4 animate-appearance-in">
          <Alert
            variant="faded"
            color={isHighAuth ? "warning" : "success"}
            title={`${verifiedType?.toUpperCase()} Key Verified Successfully`}
            description={
              isHighAuth
                ? "Setting a PIN code is mandatory for Active authority keys to ensure security."
                : "We recommend setting a PIN code to add an extra layer of security."
            }
            icon={<div>{isHighAuth ? <ShieldAlert /> : <ShieldCheck />}</div>}
          />

          {!isHighAuth && (
            <Checkbox isSelected={usePin} onValueChange={setUsePin}>
              <span className="text-sm">Set a PIN code (optional)</span>
            </Checkbox>
          )}

          {showPinFields && (
            <div className="flex flex-col gap-2 animate-appearance-in">
              <Input
                value={pin}
                onValueChange={setPin}
                placeholder="Set PIN Code"
                label="Secure PIN"
                type="password"
                classNames={{ inputWrapper: "bg-default-100" }}
                isRequired={isHighAuth}
              />
              {pin && (
                <Input
                  value={confirmPin}
                  onValueChange={setConfirmPin}
                  placeholder="Confirm PIN Code"
                  label="Confirm PIN"
                  type="password"
                  classNames={{ inputWrapper: "bg-default-100" }}
                  errorMessage={
                    pin !== confirmPin && confirmPin ? "PINs do not match" : ""
                  }
                  isInvalid={!!confirmPin && pin !== confirmPin}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                />
              )}

              {/* Only rendered when the platform authenticator reports it
                  can verify the user. Android may still answer with the
                  device PIN rather than a fingerprint, hence the wording. */}
              {bioAvailable && (
                <Checkbox
                  isSelected={useBiometric}
                  onValueChange={setUseBiometric}
                >
                  <span className="flex items-center gap-1.5 text-sm">
                    <Fingerprint
                      size={14}
                      className="text-primary shrink-0"
                      aria-hidden="true"
                    />
                    Use Face ID / fingerprint (or device PIN)
                  </span>
                </Checkbox>
              )}

              {/* Say *why* it's missing instead of only hiding it — a silent
                  "not available" is untestable on a real phone. */}
              {bioStatus && !bioAvailable && (
                <p className="text-xs leading-relaxed text-default-500">
                  {describeBiometricStatus(bioStatus)}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              color="danger"
              variant="light"
              onPress={() => {
                setVerifiedType(null);
                resetPin();
              }}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              color="primary"
              onPress={handleLogin}
              className="flex-1 font-medium"
              isLoading={isPending}
            >
              Login
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivateKeyLogin;
