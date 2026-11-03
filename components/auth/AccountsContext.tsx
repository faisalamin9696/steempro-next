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
import { toast } from "sonner";
import useSteemAuthRevocation from "@/hooks/useSteemAuthRevocation";
import LogoutModal from "../ui/LogoutModal";
import QrApprovalPanel from "../ui/QrApprovalPanel";
import { clearQrResult } from "@/hooks/useSteemAuthKeepAlive";
import { endSharedSession } from "@/hooks/useSteemAuthKeepAlive";
import { Button } from "@heroui/button";
import { X } from "lucide-react";

interface AccountsContextState {
  accounts: LocalAccount[];
  current: LocalAccount | null;
  loginWithKeychain: (username: string) => Promise<void>;
  /** QR login via the SteemAuthenticator app (no key is stored). */
  loginWithSteemAuth: (
    username: string,
    sid?: string,
    relayUrl?: string,
  ) => Promise<void>;
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
  /**
   * True while the shared SteemAuthenticator session has a live phone
   * attached. Rendered by the navbar as its "Phone connected" status, on both
   * breakpoints.
   */
  phoneConnected: boolean;
  /**
   * Closes the live phone session: the phone drops its watch card and the
   * next action waits for a fresh scan. Backs the × on the navbar status.
   */
  endPhoneSession: () => void;
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
    loginWithSteemAuth: _loginWithSteemAuth,
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
  // SteemAuth: the current account may only act through the phone, so one
  // session lives here for as long as the account is current. `awaitingScan`
  // gates the overlay; the refs hold the action that is waiting on a scan.
  const [awaitingScan, setAwaitingScan] = useState(false);
  /** The shared session is connected right now (drives the live pill). */
  const [phoneConnected, setPhoneConnected] = useState(false);
  const phoneReadyRef = useRef(false);
  const phoneWaiterRef = useRef<((ok: boolean) => void) | null>(null);

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

  /** QR login via the SteemAuthenticator app - signature already verified. */
  const loginWithSteemAuth = async (
    username: string,
    sid?: string,
    relayUrl?: string,
  ) => {
    SESSION_PIN = null;
    return _loginWithSteemAuth(username, sid, relayUrl);
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

  /**
   * A QR account's session is only as live as the phone says it is. The login
   * modal unmounts on success, so without this the app would stay signed in
   * on a session the user had already revoked from the Sessions tab.
   */
  useSteemAuthRevocation(current, (reason) => {
    toast.error("Signed out — session revoked", {
      description: reason,
    });
    void logout();
  });

  /**
   * Hold an action until the phone has scanned — the SteemAuth equivalent of
   * waiting for a PIN or a Keychain prompt.
   *
   * Resolves immediately when the always-on session is already live, so the
   * phone is only consulted once per scan rather than once per action. The
   * panel behind the overlay owns the session and installs the broadcast
   * bridge, so callers afterwards need no special handling at all.
   */
  const awaitPhoneApproval = (): Promise<void> => {
    if (phoneReadyRef.current) return Promise.resolve();

    // The panel renders a landed tx id first, so without this a stale success
    // hides the QR the new cycle needs.
    clearQrResult();
    setAwaitingScan(true);
    return new Promise<void>((resolve, reject) => {
      phoneWaiterRef.current = (ok) =>
        ok ? resolve() : reject(new Error("Approval cancelled."));
    });
  };

  /** The panel reports this as the phone gains or loses a live scan. */
  const handlePhoneReadyChange = (ready: boolean) => {
    phoneReadyRef.current = ready;
    setPhoneConnected(ready);
    if (ready && phoneWaiterRef.current) {
      const release = phoneWaiterRef.current;
      phoneWaiterRef.current = null;
      setAwaitingScan(false);
      release(true);
    }
  };

  /**
   * End the live subscription on demand: the phone drops its watch card
   * (cancel frame), and the frontend falls back to a fresh QR — the next
   * action shows the scan window again instead of passing straight through.
   */
  const endPhoneSession = () => {
    endSharedSession();
    setPhoneConnected(false);
    toast("Phone connection ended — the next action will show a new QR.");
  };

  const cancelPhoneApproval = () => {
    setAwaitingScan(false);
    if (phoneWaiterRef.current) {
      const release = phoneWaiterRef.current;
      phoneWaiterRef.current = null;
      release(false);
    }
  };

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

      // A SteemAuth account stores no key in this browser — every action is
      // signed on the phone instead. Rather than refusing (which would break
      // all 31 callers), wait for the scan: the panel installs a bridge that
      // intercepts the broadcast inside steemApi.broadcast(), so the action
      // proceeds unchanged once the phone has agreed.
      if (current.loginMethod === "steemauth") {
        awaitPhoneApproval().then(
          () => resolve({}),
          (e) =>
            reject(e instanceof Error ? e : new Error("Approval cancelled.")),
        );
        return;
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
        loginWithSteemAuth,
        removeAccount,
        switchAccount,
        isPending,
        phoneConnected,
        endPhoneSession,
        manageAccounts,
        logout,
        manageLogout,
        authenticateOperation,
      }}
    >
      {children}
      <AuthModal isOpen={showAuthModal} onOpenChange={setShowAuthModal} />

      {/* SteemAuth standby: mounted whenever a phone account is current so the
          session exists before an action needs it, but visually hidden until
          one does. Hiding rather than unmounting is the point — unmounting
          would tear down the session and the broadcast bridge with it. */}
      {current?.loginMethod === "steemauth" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Approve on your phone"
          className={
            awaitingScan
              ? "fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4"
              : "hidden"
          }
        >
          <div className="w-full max-w-sm rounded-2xl border border-divider bg-background p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Approve on your phone</p>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                aria-label="Cancel"
                onPress={cancelPhoneApproval}
              >
                <X size={16} />
              </Button>
            </div>
            {/* Remount per cycle so panel-local state can't leak between
                actions; the module session survives it, the result is
                cleared in awaitPhoneApproval. */}
            <QrApprovalPanel
              key={awaitingScan ? "scan" : "idle"}
              account={current?.username}
              description="Scan to unlock this action"
              onCancel={cancelPhoneApproval}
              onReadyChange={handlePhoneReadyChange}
            />
          </div>
        </div>
      )}

      {/* The live-session control (status + ×) lives in the navbar after the
          logo — see SNavbar. */}
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
