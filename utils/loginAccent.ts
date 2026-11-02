/**
 * Avatar accent for "how this account signed in".
 *
 * One mapping, used by the navbar and the account list, so a new login method
 * can never end up coloured in one place and left default in another.
 *
 *   primary   (blue)     Keychain extension holds the key
 *   secondary (purple)   SteemAuthenticator — no key exists on this device,
 *                        every action is approved on the phone
 *   success   (green)    active key stored locally
 *   warning   (amber)    posting key stored locally
 *   default              not signed in / unrecognised
 */
export type LoginAccent =
  "default" | "primary" | "secondary" | "success" | "warning";

export function loginAccent(
  account?: Pick<LocalAccount, "loginMethod" | "type"> | null,
): LoginAccent {
  if (!account) return "default";
  if (account.loginMethod === "steemauth") return "secondary";
  if (account.loginMethod === "keychain") return "primary";
  if (account.type === "active") return "success";
  if (account.type === "posting") return "warning";
  return "default";
}
