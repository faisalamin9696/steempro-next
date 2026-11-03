import { keychainApi } from "@/libs/keychain";
import { authenticateWithEmail } from "@/libs/supabase/database";
import { supabase } from "@/libs/supabase/supabase";
import { encryptPrivateKey } from "@/utils/encryption";
import {
  clearBiometric,
  saveBiometric,
  type BiometricEnrollment,
} from "@/utils/biometrics";
import { secureLocalStorageFresh } from "@/utils/user";
import { PrivateKey } from "@steempro/dsteem";
import { Session, User } from "@supabase/supabase-js";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { toast } from "sonner";

const STORAGE_KEY = "steem_auth";

export function useSteemAuth() {
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  const [current, setCurrent] = useState<LocalAccount | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  // NextAuth does NOT notify this observer when signIn() is called with
  // `redirect: false` — see autheticateUser below.
  const { update } = useSession();

  // -------------------------------
  // Load from secure storage
  // -------------------------------
  useEffect(() => {
    const raw = secureLocalStorageFresh(STORAGE_KEY, "@secure.s") as string;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);

      setAccounts(parsed.accounts || []);
      setCurrent(parsed.current || null);
    } catch {
      // corrupted data → reset
      secureLocalStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = (accs: LocalAccount[], curr: LocalAccount | null) => {
    secureLocalStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accounts: accs, current: curr }),
    );
  };

  const autheticateUser = async (
    username: string,
  ): Promise<{ user: User | null; session: Session | null }> => {
    setIsPending(true);
    try {
      // 1. Authenticate with email (auto signup if needed)
      const result = await authenticateWithEmail(
        username + "@steempro.com",
        username,
      );

      if (!result.success || !result.session) {
        throw new Error(result.message);
      }

      // Create normalized return object
      const normalizedData = {
        user: result.session.user || null,
        session: result.session,
      };

      // 2. NextAuth Credential Login.
      // next-auth's `signIn()` redirects to the /error page whenever
      // `getProviders()` fails to load (returns null) — even with
      // `redirect: false`. Pre-check providers so a transient failure throws
      // here instead of bouncing the user to an auth error page.
      const providers = await getProviders().catch(() => null);
      if (!providers) {
        throw new Error("Authentication service unavailable. Please retry.");
      }

      const { error } = await signIn("credentials", {
        username,
        redirect: false,
      });

      if (error) {
        throw new Error(error);
      }

      // Two refreshes, doing two different jobs:
      //
      // 1. `update()` — the client-side observer. It re-reads cookies and
      //    calls setSession(), so every useSession() subscriber re-renders and
      //    re-derives its SWR keys. Without it AppWrapper keeps fetching
      //    `account-<previous user>` and the navbar renders the old session:
      //    NextAuth never fires this for signIn(..., { redirect: false }).
      // 2. `router.refresh()` — the server side. Re-runs RSCs against the new
      //    cookie so the SSR payload matches.
      //
      // Observer first, so the new keys start fetching while the server
      // re-renders rather than after it.
      await update();
      router.refresh();

      return normalizedData;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown authentication error";
      throw new Error(message);
    } finally {
      setIsPending(false);
    }
  };
  // -------------------------------
  // Login With Keychain
  // -------------------------------
  const loginWithKeychain = async (username: string): Promise<void> => {
    keychainApi.validateKeychain();
    return new Promise((resolve, reject) => {
      keychainApi
        .loginWithKeychain(username)
        .then(async (res) => {
          if (!res.username) return reject(new Error("Keychain login failed"));

          const acc: LocalAccount = {
            username: res.username,
            loginMethod: "keychain",
            createdAt: Date.now(),
            encrypted: false,
          };

          const updated = [
            ...accounts.filter(
              (a) =>
                !(a.username === res.username && a.loginMethod === "keychain"),
            ),
            acc,
          ];
          await autheticateUser(username);
          setAccounts(updated);
          setCurrent(acc);
          persist(updated, acc);

          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  // -------------------------------
  // Login With SteemAuthenticator (QR)
  // -------------------------------
  /**
   * Record a QR login: the caller already verified the signature against the
   * on-chain key, so nothing secret is stored — and every later action must
   * be approved on the phone, because this browser never holds a key for it.
   */
  const loginWithSteemAuth = async (
    username: string,
    sid?: string,
    relayUrl?: string,
  ): Promise<void> => {
    const acc: LocalAccount = {
      username,
      loginMethod: "steemauth",
      // Remembered so the account can be watched for revocation later — the
      // registry row is keyed by sid, and the login modal unmounts on success.
      sid,
      relayUrl,
      createdAt: Date.now(),
      encrypted: false,
    };

    const updated = [
      ...accounts.filter(
        (a) => !(a.username === username && a.loginMethod === "steemauth"),
      ),
      acc,
    ];
    await autheticateUser(username);
    setAccounts(updated);
    setCurrent(acc);
    persist(updated, acc);
  };

  // -------------------------------
  // Login With Private Key
  // -------------------------------
  const loginWithKey = async (
    username: string,
    key: string,
    pin?: string,
    type: AccountKeyType = "posting",
    biometric?: BiometricEnrollment,
  ): Promise<void> => {
    let privateKey: PrivateKey;

    try {
      privateKey = PrivateKey.fromString(key);
    } catch {
      throw new Error("Invalid private key");
    }

    // const pub = privateKey.createPublic().toString();

    // If pin provided, encrypt the key
    let encKey = encryptPrivateKey(key, process.env.NEXT_PUBLIC_AUTH_SECRET!);
    if (pin) encKey = encryptPrivateKey(key, pin);

    const acc: LocalAccount = {
      username: username,
      type: type,
      key: encKey,
      loginMethod: "private-key",
      createdAt: Date.now(),
      encrypted: !!pin,
      // A second copy under the device secret. `encKey` above is untouched,
      // so the PIN keeps working even if WebAuthn is unavailable later.
      ...(biometric
        ? {
            biometric: true as const,
            bioKey: encryptPrivateKey(key, biometric.secret),
          }
        : {}),
    };

    if (biometric) saveBiometric(username, type, biometric);

    const updated = [
      ...accounts.filter((a) => !(a.username === username && a.type === type)),
      acc,
    ];
    await autheticateUser(username);
    setAccounts(updated);
    setCurrent(acc);
    persist(updated, acc);
  };

  // -------------------------------
  // Switch Account
  // -------------------------------
  const switchAccount = async (
    username: string,
    type?: AccountKeyType,
    silent?: boolean,
  ) => {
    try {
      const acc =
        accounts.find((a) => a.username === username && a.type === type) ||
        null;
      await autheticateUser(username);
      setCurrent(acc);
      persist(accounts, acc);
      if (!silent)
        toast.success("Success", { description: "Logged in successfully" });
    } catch (error: any) {
      if (!silent) toast.error("Error", { description: error?.message });
    }
  };

  // -------------------------------
  // Remove Account
  // -------------------------------
  const removeAccount = (
    username?: string | null,
    type?: AccountKeyType,
    skipNextCurrent?: boolean,
  ) => {
    if (!username) return;
    // Drop the device secret too — otherwise a stale credential survives an
    // account that's no longer in the list.
    clearBiometric(username, type);
    const updated = accounts.filter(
      (a) => !(a.username === username && a.type === type),
    );
    const newCurrent = updated.length ? updated[0] : null;
    setAccounts(updated);
    if (!skipNextCurrent) {
      setCurrent(newCurrent);
      persist(updated, newCurrent);
    } else {
      persist(updated, null);
      setCurrent(null);
    }
  };

  // -------------------------------
  // Logout (remove current only)
  // -------------------------------
  const logout = async (): Promise<void> => {
    if (!current) return;
    try {
      // Best-effort FIRST, and non-blocking: this app's own auth session must
      // never be able to abort the real sign-out below. It used to run first
      // unguarded, so one throw (offline, unconfigured) skipped signOut() +
      // account removal + reload — and callers that swallow (`void logout()`,
      // the revocation hook) left the user signed in while a toast claimed
      // "Signed out".
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (e) {
        console.warn("Supabase signOut failed — continuing logout:", e);
      }
      await signOut();
      removeAccount(current.username, current.type, true);
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to logout",
      );
    }
  };

  return {
    accounts,
    current,
    loginWithKeychain,
    loginWithKey,
    loginWithSteemAuth,
    switchAccount,
    removeAccount,
    logout,
    isPending,
  };
}
