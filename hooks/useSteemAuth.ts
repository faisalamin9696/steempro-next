import { keychainApi } from "@/libs/keychain";
import { authenticateWithEmail } from "@/libs/supabase/database";
import { supabase } from "@/libs/supabase/supabase";
import { encryptPrivateKey } from "@/utils/encryption";
import { secureLocalStorageFresh } from "@/utils/user";
import { PrivateKey } from "@steempro/dsteem";
import { Session, User } from "@supabase/supabase-js";
import moment from "moment";
import { signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { toast } from "sonner";

const STORAGE_KEY = "steem_auth";

export function useSteemAuth() {
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  const [current, setCurrent] = useState<LocalAccount | null>(null);
  const [isPending, setIsPending] = useState(false);

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
      JSON.stringify({ accounts: accs, current: curr })
    );
  };

  const autheticateUser = async (
    username: string
  ): Promise<{ user: User | null; session: Session | null }> => {
    setIsPending(true);
    try {
      // 1. Authenticate with email (auto signup if needed)
      const result = await authenticateWithEmail(
        username + "@steempro.com",
        username
      );

      if (!result.success || !result.session) {
        throw new Error(result.message);
      }

      // Create normalized return object
      const normalizedData = {
        user: result.session.user || null,
        session: result.session,
      };

      // 2. NextAuth Credential Login
      const { error } = await signIn("credentials", {
        username,
        redirect: false,
      });

      if (error) {
        throw new Error(error);
      }

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
            createdAt: moment.now(),
            encrypted: false,
          };

          const updated = [
            ...accounts.filter(
              (a) =>
                !(a.username === res.username && a.loginMethod === "keychain")
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
  // Login With Private Key
  // -------------------------------
  const loginWithKey = async (
    username: string,
    key: string,
    pin?: string,
    type: AccountKeyType = "posting"
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
      createdAt: moment.now(),
      encrypted: !!pin,
    };

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
  const switchAccount = async (username: string, type?: AccountKeyType) => {
    try {
      const acc =
        accounts.find((a) => a.username === username && a.type === type) ||
        null;
      await autheticateUser(username);
      setCurrent(acc);
      persist(accounts, acc);
      toast.success("Success", { description: "Logged in successfully" });
    } catch (error: any) {
      toast.error("Error", { description: error?.message });
    }
  };

  // -------------------------------
  // Remove Account
  // -------------------------------
  const removeAccount = (
    username?: string | null,
    type?: AccountKeyType,
    skipNextCurrent?: boolean
  ) => {
    if (!username) return;
    const updated = accounts.filter(
      (a) => !(a.username === username && a.type === type)
    );
    const newCurrent = updated.length ? updated[0] : null;
    setAccounts(updated);
    if (!skipNextCurrent) {
      setCurrent(newCurrent);
      persist(updated, newCurrent);
    } else {
      persist(updated, null);
    }
  };

  // -------------------------------
  // Logout (remove current only)
  // -------------------------------
  const logout = async (): Promise<void> => {
    if (!current) return;
    await supabase.auth
      .signOut()
      .then(async () => {
        removeAccount(current.username, current.type, true);
        await signOut();
      })
      .catch((e) => {
        throw new Error(e);
      });
  };

  return {
    accounts,
    current,
    loginWithKeychain,
    loginWithKey,
    switchAccount,
    removeAccount,
    logout,
    isPending,
  };
}
