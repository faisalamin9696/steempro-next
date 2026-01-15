import { encryptPrivateKey, secureDecrypt } from "./encryption";
import secureLocalStorage from "react-secure-storage";
import CryptoJS from "crypto-js";
import { Constants } from "@/constants";
import { empty_settings } from "@/constants/templates";
import { updateActiveSettings } from ".";
const SETTINGS_STORAGE_KEY = "@secure.j.settings";

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
    Constants.activeSettings = setting;
    return setting;
  } else {
    Constants.activeSettings = empty_settings();
    return empty_settings();
  }
}

export function updateSettings(setting: Setting) {
  const lsSettings =
    (secureLocalStorage.getItem("settings") as Setting) ?? empty_settings();
  const newSetting = { ...lsSettings, ...setting };
  secureLocalStorage.setItem("settings", newSetting);
  updateActiveSettings(newSetting);
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
  static atLeast = (type: Keys | undefined, target: Keys): boolean => {
    if (!type) return false;
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

export function secureLocalStorageFresh(
  key: string,
  prefix: "@secure.j" | "@secure.s"
) {
  const STORAGE_KEY = `${prefix}.${key}`;
  const freshData = secureDecrypt(
    localStorage.getItem(STORAGE_KEY) ?? "",
    process.env.NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY
  );
  return freshData;
}

export const getChatMemoKey = (username: string) => {
  return secureLocalStorageFresh(
    `chat_memo_key_${username}`,
    "@secure.s"
  ) as string;
};
