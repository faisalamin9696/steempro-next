import type { SteemAuthErrorCode } from "@steempro/steemauth-qr";

/**
 * Display copy for a machine-readable `SteemAuthErrorCode`.
 *
 * The package's rule is to branch on `code`, never on the message string —
 * messages are byte-stable for display but must not be matched. This maps
 * the codes that need a *different* recovery action to the words for it, and
 * returns `null` for anything whose own message is already specific enough
 * (`invalid-request` carries the exact validation failure, for example).
 *
 * Returning null means "use `auth.error` verbatim".
 */
export interface QrFailureCopy {
  title: string;
  hint?: string;
}

export function describeQrFailure(
  code: SteemAuthErrorCode | null,
): QrFailureCopy | null {
  switch (code) {
    case "revoked":
      return {
        title: "Session revoked in the authenticator",
        hint: "This app was removed on your phone, so it can no longer be approved.",
      };
    case "session-expired":
      return {
        title: "This code expired",
        hint: "Generate a new one to carry on.",
      };
    case "plane-failed":
    case "plane-timeout":
      return {
        title: "Couldn't reach the secure message channel",
        hint: "Check your connection and try again.",
      };
    case "timeout":
      return {
        title: "No answer from your phone",
        hint: "Open SteemAuthenticator and approve the request there.",
      };
    case "not-connected":
      return {
        title: "Not connected yet",
        hint: "Scan the code before requesting anything.",
      };
    case "no-account":
      return {
        title: "Open SteemAuthenticator first",
        hint: "The phone announces which account it is acting as when it scans.",
      };
    default:
      return null;
  }
}
