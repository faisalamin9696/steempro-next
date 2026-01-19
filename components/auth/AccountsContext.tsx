import PinModal from "./PinModal";
import { decryptPrivateKey, encryptPrivateKey } from "@/utils/encryption";
import { useSteemAuth } from "@/hooks/useSteemAuth";
import { createContext, useContext, ReactNode, useState } from "react";
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
    type?: AccountKeyType
  ) => Promise<void>;
  authenticateOperation: (
    opsType: AccountKeyType
  ) => Promise<{ key?: string; useKeychain?: boolean }>;
  removeAccount: (username?: string | null, type?: AccountKeyType) => void;
  switchAccount: (username: string, type?: AccountKeyType) => void;
  isPending: boolean;
  manageAccounts: () => void;
  logout: () => Promise<void>;
  manageLogout: () => void;
}

const AccountsContext = createContext<AccountsContextState>(
  {} as AccountsContextState
);

let SESSION_PIN: string | null = null; // Encrypted PIN stored in memory for session

export const AccountsProvider = ({ children }: { children: ReactNode }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pinModal, setPinModal] = useState<{
    isOpen: boolean;
    mode?: "pin" | "key";
    requiredType?: AccountKeyType;
    resolve?: (result: string, remember: boolean) => void;
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

  const loginWithKeychain = async (username: string) => {
    SESSION_PIN = null;
    return _loginWithKeychain(username);
  };

  const loginWithKey = async (
    username: string,
    key: string,
    pin?: string,
    type: AccountKeyType = "posting"
  ) => {
    SESSION_PIN = null;
    return _loginWithKey(username, key, pin, type);
  };

  const removeAccount = (username?: string | null, type?: AccountKeyType) => {
    SESSION_PIN = null;
    return _removeAccount(username, type);
  };

  const switchAccount = async (username: string, type?: AccountKeyType) => {
    SESSION_PIN = null;
    return _switchAccount(username, type);
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
    opsType: AccountKeyType = "posting"
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
          process.env.NEXT_PUBLIC_AUTH_SECRET!
        );
        if (key) return resolve({ key, useKeychain: false });
        else return reject(new Error("Failed to decrypt key"));
      }

      // Encrypted, ask for PIN
      // Check if we have a session PIN

      if (SESSION_PIN) {
        const decryptedPin = decryptPrivateKey(
          SESSION_PIN,
          process.env.NEXT_PUBLIC_AUTH_SECRET!
        );
        if (decryptedPin) {
          const key = decryptPrivateKey(current.key!, decryptedPin);
          if (key) return resolve({ key, useKeychain: false });
        }
      }

      setPinModal({
        isOpen: true,
        resolve: (pin, remember) => {
          if (remember) {
            SESSION_PIN = encryptPrivateKey(
              pin,
              process.env.NEXT_PUBLIC_AUTH_SECRET!
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
