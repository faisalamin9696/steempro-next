import {
  decryptPrivateKey,
  encryptPrivateKey,
  secureDecrypt,
} from "./encryption";
import secureLocalStorage from "react-secure-storage";
import { empty_settings } from "../constants/Placeholders";
import CryptoJS from "crypto-js";
import { updateCurrentSetting } from "../constants/AppConstants";
const AUTH_STORAGE_KEY = "@secure.j.auth";
const SETTINGS_STORAGE_KEY = "@secure.j.settings";

export function getCredentials(password?: string): User | undefined {
  const credentialsString = secureDecrypt(
    localStorage.getItem(AUTH_STORAGE_KEY) ?? "",
    process.env.NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY
  );

  const credentials = JSON.parse(credentialsString || `{}`) as User;

  try {
    if (credentials && credentials?.username) {
      const isKeychain = credentials.key === "keychain";

      if (isKeychain) {
        return {
          ...credentials,
          keychainLogin: credentials.key === "keychain",
        };
      }

      const privateKey = password
        ? decryptPrivateKey(
            credentials.key,
            credentials.passwordless ? "steempro" : password
          )
        : credentials.key;

      if (privateKey) {
        return {
          username: credentials.username,
          type: credentials.type,
          memo: credentials.memo,
          passwordless: credentials.passwordless,
          key: privateKey,
        };
      }
      return { ...credentials, key: privateKey };
    }
  } catch (e) {
    return undefined;
  }
}

export const parsePostMeta = (metaData: string) => {
  const metadata = JSON.parse(metaData || "{}");
  const postTags = metadata?.tags;
  return {
    image: metadata?.image || undefined,
    users: metadata?.users || [],
    tags: typeof postTags === "string" ? [postTags] : postTags || [],
    app: metadata?.app || "",
    format: metadata?.format || "",
  };
};

export function getAllCredentials(): User[] {
  const accounts = (secureLocalStorage.getItem("accounts") ?? []) as User[];
  const credentials = accounts.map((item) => {
    return { ...item, keychainLogin: item.key === "keychain" };
  });
  return credentials;
}

export function addToCurrent(
  username: string,
  encKey: string,
  keyType: Keys,
  passwordless: boolean,
  memoKey: string
) {
  secureLocalStorage.setItem("auth", {
    username: username,
    key: encKey,
    type: keyType,
    memo: memoKey || "",
    passwordless,
  } as User);
}

export function removeCredentials(credentials: User) {
  try {
    if (credentials) {
      logoutSession();
      removeSessionToken(credentials?.username);
      let allAccounts = getAllCredentials();
      allAccounts = allAccounts.filter(
        (user) =>
          !(
            user.username === credentials.username &&
            user.type === credentials.type
          )
      );
      secureLocalStorage.setItem("accounts", allAccounts);
    }
  } catch {}
}

export function updateMemoKey(key: string) {
  const credentials = getCredentials();
  if (credentials) {
    secureLocalStorage.setItem("auth", {
      ...credentials,
      memo: key,
    } as User);
    const isPasswordLess =
      credentials?.passwordless ||
      ["keychain", "steempro"].includes(credentials.key);

    addToAccounts(
      credentials.username,
      credentials.key,
      credentials.type,
      isPasswordLess,
      key
    );
  }
}

function addToAccounts(
  username: string,
  encKey: string,
  keyType: Keys,
  passwordless: boolean,
  memoKey?: string
) {
  const accounts = (secureLocalStorage.getItem("accounts") ?? []) as User[];
  const index = accounts.findIndex(
    (account) => account.username === username && account.type === keyType
  );
  const updatedAccounts =
    index !== -1
      ? [
          ...accounts.slice(0, index),
          Object.assign({}, accounts[index], {
            key: encKey,
            type: keyType,
            memo: memoKey || "",
            passwordless,
          }),
          ...accounts.slice(index + 1),
        ]
      : accounts.concat({
          username: username,
          key: encKey,
          type: keyType,
          memo: memoKey || "",
          passwordless,
        });

  secureLocalStorage.setItem("accounts", updatedAccounts);
}

export function saveCredentials(
  username: string,
  privateKey: string,
  password: string,
  keyType: Keys,
  passwordless: boolean,
  current?: boolean,
  isKeychain?: boolean,
  memoKey = ""
): User | undefined {
  const existAuth = getUserAuth() as User;

  if (isKeychain) {
    if (!existAuth || current || existAuth?.username === username) {
      addToCurrent(username, privateKey, keyType, passwordless, memoKey);

      if (username !== existAuth?.username) {
        removeSessionToken(existAuth?.username);
      }
    }

    addToAccounts(username, privateKey, keyType, passwordless, memoKey);
    return {
      username: username,
      key: privateKey,
      type: keyType,
      memo: memoKey,
      passwordless,
    };
  }

  const encryptedKey = encryptPrivateKey(privateKey, password);
  if (encryptedKey) {
    if (!existAuth || current || existAuth?.username === username) {
      addToCurrent(username, encryptedKey, keyType, passwordless, memoKey);

      if (username !== existAuth?.username) {
        removeSessionToken(existAuth?.username);
      }
    }

    addToAccounts(username, encryptedKey, keyType, passwordless, memoKey);
    return {
      username: username,
      key: encryptedKey,
      type: keyType,
      memo: memoKey,
      passwordless,
    };
  }
}

export function validatePassword(input: string): boolean {
  // const uppercaseRegex = /[A-Z]/;
  // const lowercaseRegex = /[a-z]/;
  // const digitRegex = /[0-9]/;
  // const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

  return (
    input.length >= 4
    // uppercaseRegex.test(input) &&
    // lowercaseRegex.test(input) &&
    // digitRegex.test(input) &&
    // specialCharRegex.test(input)
  );
}

export function getSettings(): Setting {
  const settingsString = secureDecrypt(
    localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "",
    process.env.NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY
  );

  const lsSettings = JSON.parse(settingsString || `{}`) as Setting;

  if (Object.keys(lsSettings).length > 0) {
    const setting = { ...empty_settings(), ...lsSettings };
    updateCurrentSetting(setting);
    return setting;
  } else {
    updateCurrentSetting(empty_settings());
    return empty_settings();
  }
}
export function updateSettings(setting: Setting) {
  const lsSettings =
    (secureLocalStorage.getItem("settings") as Setting) ?? empty_settings();
  const newSetting = { ...lsSettings, ...setting };
  secureLocalStorage.setItem("settings", newSetting);
  updateCurrentSetting(newSetting);
  return newSetting;
}

export class PrivKey {
  static LEVELS = ["MEMO", "POSTING", "ACTIVE", "OWNER", "MASTER"];

  static level = (type: Keys): number => {
    const level = PrivKey.LEVELS.indexOf(String(type));
    if (level === -1) {
      throw new Error("Invalid type: " + type);
    }

    return level;
  };
  static atLeast = (type: Keys, target: Keys): boolean => {
    const roleLevel = PrivKey.level(type);
    const targetLevel = PrivKey.level(target);
    return roleLevel >= targetLevel;
  };
}

export const checkPromotionText = (body: string): boolean => {
  if (!body) return false;
  const regex = /posted using \[steempro/;
  if (regex.test(body?.toLowerCase())) {
    return true;
  } else {
    return false;
  }
};

export const calculatePowerUsage = (Wp: number): number => {
  const Pu = (Wp + 0.0049) / 50;
  return Pu;
};

export let sessionAppPass = CryptoJS.lib.WordArray.random(36).toString();

export let sessionKey = "";

export const saveSessionKey = (userPassword: string) => {
  const enc = encryptPrivateKey(userPassword, sessionAppPass);
  sessionKey = enc;
  return enc;
};

export const getSessionKey = (username?: string | null) => {
  const credentials = getCredentials();
  const token = getSessionToken(username);
  if (token && credentials?.type !== "ACTIVE") {
    const auth = getUserAuth();
    if (auth)
      return decryptPrivateKey(token, auth?.key?.toString()?.substring(0, 20));
  }
  return decryptPrivateKey(sessionKey, sessionAppPass);
};

export const logoutSession = () => {
  secureLocalStorage.removeItem("auth");
};

export function removeSessionToken(username?: string | null) {
  if (!!username) secureLocalStorage.removeItem(`token_${username}`);
}

export function getSessionToken(username?: string | null) {
  if (username)
    return secureDecrypt(
      localStorage.getItem(`@secure.s.token_${username}`) ?? "",
      process.env.NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY
    );
  return "";
}

export function getUserAuth() {
  const credentialsString = secureDecrypt(
    localStorage.getItem(AUTH_STORAGE_KEY) ?? "",
    process.env.NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY
  );
  const credentials = JSON.parse(credentialsString || `{}`) as User;
  if (credentials?.username) return credentials;
}

