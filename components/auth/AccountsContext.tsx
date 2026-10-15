import PinModal from "./PinModal";
import { decryptPrivateKey, encryptPrivateKey } from "@/utils/encryption";
import {
  unlockWithBiometric,
  type BiometricEnrollment,
} from "@/utils/biometrics";
import { useSteemAuth } from "@/hooks/useSteemAuth";
import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import AuthModal from "./AuthModal";
import LogoutModal from "../ui/LogoutModal";

interface AccountsContextState {
  accounts: LocalAccount[];
  current: LocalAccount | null;
  loginWithKeychain: (username: string) => Promise<void>;
  loginWithKey: (
    username: string,
    key: string,
    pin?: string,
    type?: AccountKeyType,
    biometric?: BiometricEnrollment,
  ) => Promise<void>;
  authenticateOperation: (
    opsType: AccountKeyType,
  ) => Promise<{ key?: string; useKeychain?: boolean }>;
  removeAccount: (username?: string | null, type?: AccountKeyType) => void;
  switchAccount: (
    username: string,
    type?: AccountKeyType,
    silent?: boolean,
  ) => void;
  isPending: boolean;
  manageAccounts: () => void;
  logout: () => Promise<void>;
  manageLogout: () => void;
}

const AccountsContext = createContext<AccountsContextState>(
  {} as AccountsContextState,
);

let SESSION_PIN: string | null = null; // Encrypted PIN stored in memory for session

export const AccountsProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pinModal, setPinModal] = useState<{
    isOpen: boolean;
    mode?: "pin" | "key";
    requiredType?: AccountKeyType;
    resolve?: (result: string, remember: boolean) => void;
    /** Resolve the operation through Keychain instead of a pasted key. */
    useKeychain?: () => void;
    /** Offer device unlock inside the modal; only when the account is enrolled. */
    onBiometric?: () => Promise<boolean>;
    reject?: (reason?: any) => void;
  }>({ isOpen: false });

  const {
    accounts,
    current,
    loginWithKey: _loginWithKey,
    loginWithKeychain: _loginWithKeychain,
    removeAccount: _removeAccount,
    switchAccount: _switchAccount,
    isPending,
    logout: _logout,
  } = useSteemAuth();

  // Auto-restore the stored account when the NextAuth session is missing.
  // `_switchAccount` gets a new identity on every render of `useSteemAuth`,
  // so using it as an effect dependency made this effect re-fire on every
  // render — on silent sign-in failure that became an endless loop of
  // authenticate/signIn/router.refresh requests (and could bounce the user to
  // NextAuth's /api/auth/error page). Key the attempt so it runs at most once
  // per stored account while logged out.
  const autoLoginAttemptRef = useRef<string | null>(null);
  const switchAccountRef = useRef(_switchAccount);
  switchAccountRef.current = _switchAccount;

  useEffect(() => {
    if (status === "authenticated") {
      autoLoginAttemptRef.current = null;
      return;
    }
    if (status !== "unauthenticated" || !current || isPending) return;

    const attemptKey = `${current.username}:${current.type ?? ""}`;
    if (autoLoginAttemptRef.current === attemptKey) return;
    autoLoginAttemptRef.current = attemptKey;
    switchAccountRef.current(current.username, current.type, true);
  }, [status, current, isPending]);

  const loginWithKeychain = async (username: string) => {
    SESSION_PIN = null;
    return _loginWithKeychain(username);
  };

  const loginWithKey = async (
    username: string,
    key: string,
    pin?: string,
    type: AccountKeyType = "posting",
    biometric?: BiometricEnrollment,
  ) => {
    SESSION_PIN = null;
    return _loginWithKey(username, key, pin, type, biometric);
  };

  const removeAccount = (username?: string | null, type?: AccountKeyType) => {
    SESSION_PIN = null;
    return _removeAccount(username, type);
  };

  const switchAccount = async (
    username: string,
    type?: AccountKeyType,
    silent?: boolean,
  ) => {
    SESSION_PIN = null;
    return _switchAccount(username, type, silent);
  };

  const logout = async () => {
    SESSION_PIN = null;
    return _logout();
  };

  function manageAccounts() {
    setShowAuthModal(!showAuthModal);
  }

  function manageLogout() {
    setShowLogoutModal(!showLogoutModal);
  }

  const authenticateOperation = async (
    opsType: AccountKeyType = "posting",
  ): Promise<{ key?: string; useKeychain?: boolean }> => {
    return new Promise((resolve, reject) => {
      if (!current) {
        return reject(new Error("Login required"));
      }

      if (current.loginMethod === "keychain" && opsType !== "owner") {
        return resolve({ useKeychain: true });
      }

      // Check if current key satisfies the requiremnts
      // If opsType is Active but we only have Posting, fail?
      // For now, assuming current.type handles this or we rely on user to be logged in with correct key.
      // But we can check:
      if (
        (opsType === "active" && current.type !== "active") ||
        opsType === "owner"
      ) {
        setPinModal({
          isOpen: true,
          mode: "key",
          requiredType: opsType,
          resolve: (key, remember) => {
            // In key mode, the result is the private key itself
            resolve({ key, useKeychain: false });
          },
          // A posting-key session can still delegate the broadcast to Keychain
          // if the extension is installed — `broadcast()` already routes
          // `useKeychain: true` to the correct authority.
          useKeychain: () => resolve({ useKeychain: true }),
          reject: (err) => {
            reject(err || new Error("Cancelled"));
          },
        });
        return;
      }

      if (!current.encrypted) {
        // Not encrypted, use global secret
        const key = decryptPrivateKey(
          current.key!,
          process.env.NEXT_PUBLIC_AUTH_SECRET!,
        );
        if (key) return resolve({ key, useKeychain: false });
        else return reject(new Error("Failed to decrypt key"));
      }

      // Encrypted. A remembered session wins outright: ticking "Remember for
      // this session" is an explicit opt-in to skip verification until the
      // tab goes away, so device unlock must not re-prompt behind it.
      const unlockWithSessionPin = (): boolean => {
        if (!SESSION_PIN) return false;
        const decryptedPin = decryptPrivateKey(
          SESSION_PIN,
          process.env.NEXT_PUBLIC_AUTH_SECRET!,
        );
        if (!decryptedPin) return false;
        const key = decryptPrivateKey(current.key!, decryptedPin);
        if (!key) return false;
        resolve({ key, useKeychain: false });
        return true;
      };

      if (unlockWithSessionPin()) return;

      const askForPin = () => {
        setPinModal({
          isOpen: true,
          // An enrolled account needs an explicit way back into device
          // unlock. Without it, declining the automatic prompt strands the
          // user on the PIN screen with no way to retry until the next
          // transaction.
          onBiometric: current.biometric
            ? async () => {
                const unlocked = await unlockWithBiometric(current);
                if (!unlocked) return false;
                setPinModal((m) => ({ ...m, isOpen: false }));
                resolve({ key: unlocked, useKeychain: false });
                return true;
              }
            : undefined,
          resolve: (pin, remember) => {
            if (remember) {
              SESSION_PIN = encryptPrivateKey(
                pin,
                process.env.NEXT_PUBLIC_AUTH_SECRET!,
              );
            }
            const key = decryptPrivateKey(current.key!, pin);
            if (key) resolve({ key, useKeychain: false });
            else reject(new Error("Invalid PIN"));
          },
          reject: (err) => {
            reject(err || new Error("Cancelled"));
          },
        });
      };

      // No remembered session — offer device unlock before falling back to
      // typing the PIN. Every failure mode falls through deliberately:
      // dismissed prompt, an in-app browser with no WebAuthn, or a
      // credential minted in another context.
      if (current.biometric) {
        void unlockWithBiometric(current)
          .then((unlocked) => {
            if (unlocked) resolve({ key: unlocked, useKeychain: false });
            else askForPin();
          })
          .catch(() => askForPin());
        return;
      }

      askForPin();
    });
  };

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        current,
        loginWithKey,
        loginWithKeychain,
        removeAccount,
        switchAccount,
        isPending,
        manageAccounts,
        logout,
        manageLogout,
        authenticateOperation,
      }}
    >
      {children}
      <AuthModal isOpen={showAuthModal} onOpenChange={setShowAuthModal} />
      <LogoutModal isOpen={showLogoutModal} onOpenChange={setShowLogoutModal} />
      <PinModal
        isOpen={pinModal.isOpen}
        onClose={() => {
          setPinModal({ ...pinModal, isOpen: false });
          pinModal.reject?.(new Error("User cancelled"));
        }}
        encryptedKey={current?.key || ""}
        mode={pinModal.mode}
        username={current?.username}
        requiredType={pinModal.requiredType}
        onKeychain={
          pinModal.useKeychain
            ? () => {
                pinModal.useKeychain!();
                setPinModal({ ...pinModal, isOpen: false });
              }
            : undefined
        }
        onBiometric={pinModal.onBiometric}
        onSubmit={(result, remember) => {
          pinModal.resolve?.(result, remember);
          setPinModal({ ...pinModal, isOpen: false });
        }}
      />
    </AccountsContext.Provider>
  );
};

export const useAccountsContext = () => {
  const ctx = useContext(AccountsContext);
  if (!ctx)
    throw new Error("useAccountsContext must be used inside AccountsProvider");
  return ctx;
};
