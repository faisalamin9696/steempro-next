import {
  bufferToBase64url,
  create,
  get,
  supported,
} from "@github/webauthn-json/extended";
import { decryptPrivateKey } from "@/utils/encryption";

/**
 * Device-unlock (fingerprint / Face ID / Windows Hello) for PIN-protected keys.
 *
 * There is no JavaScript API that scans a fingerprint or a face. The browser
 * reaches the platform authenticator only through WebAuthn, and what comes
 * back is a signature proving the user was *verified* — never a secret. So a
 * biometric can't be the AES passphrase the way a PIN is.
 *
 * Instead, enabling it mints a random device secret, stores it alongside the
 * account, and re-encrypts a second copy of the private key with it. WebAuthn
 * then gates access to that secret: `userVerification: "required"` is what
 * forces the OS to ask for a fingerprint / face / device PIN before the
 * secret is ever read out of storage.
 *
 * The WebAuthn protocol itself is `@github/webauthn-json`'s job — the JSON
 * <-> ArrayBuffer conversion, the browser-support probe, `create()`/`get()`.
 * What lives here is only SteemPro's storage shape, the four reasons device
 * unlock can be unavailable, and a PIN fallback that always still works.
 *
 * Scope, honestly stated: this guards against someone else using an unlocked
 * device and keeps the PIN off screen. It is not a defence against XSS — the
 * secret has to be readable by the page to be usable, exactly like the
 * NEXT_PUBLIC_AUTH_SECRET-encrypted keys that already live in localStorage.
 */

const STORAGE_PREFIX = "steempro:biometric:";
const CHALLENGE_BYTES = 32;
const USER_ID_BYTES = 16;
const TIMEOUT = 60_000; // ms, before the browser's own prompt timer kicks in

export type BiometricEnrollment = {
  /** base64url credential id to allow when asking for an assertion */
  credentialId: string;
  /** AES passphrase for `LocalAccount.bioKey` */
  secret: string;
};

/**
 * Why device unlock is (or isn't) on offer.
 *
 * Only `ready` renders the checkbox. The other three exist so the UI can say
 * *why* rather than silently hiding — "not available" with no reason is
 * untestable on a real phone.
 */
export type BiometricStatus =
  | "ready"
  /** http:// or a LAN IP — nothing here can run until the URL is https */
  | "insecure-context"
  /** no WebAuthn: old browser, or an in-app browser / WebView */
  | "unsupported"
  /** WebAuthn exists but this device has no authenticator to verify against */
  | "no-authenticator";

function randomBase64Url(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bufferToBase64url(bytes.buffer);
}

/* ------------------------------------------------------------------ */
/* Capability                                                          */
/* ------------------------------------------------------------------ */

/**
 * Probes the environment and returns the reason it can't do device unlock,
 * or `ready`.
 *
 * `isSecureContext` is checked first on purpose: on plain http the browser
 * drops `PublicKeyCredential` entirely, and reporting that as "unsupported"
 * would send anyone debugging straight at the wrong thing.
 */
export async function getBiometricStatus(): Promise<BiometricStatus> {
  if (typeof window === "undefined") return "unsupported";
  if (!window.isSecureContext) return "insecure-context";
  if (!supported()) return "unsupported";

  try {
    const probe = (
      PublicKeyCredential as unknown as {
        isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
      }
    ).isUserVerifyingPlatformAuthenticatorAvailable;

    if (typeof probe !== "function") return "no-authenticator";

    const available = await probe.call(PublicKeyCredential);
    return available ? "ready" : "no-authenticator";
  } catch {
    return "no-authenticator";
  }
}

/** Human-readable reason, for the login step. */
export function describeBiometricStatus(status: BiometricStatus): string {
  switch (status) {
    case "insecure-context":
      return "Biometric unlock needs a secure connection. This page is on plain HTTP (a LAN address, for example), so it can't run.";
    case "no-authenticator":
      return "No fingerprint or face unlock is set up on this device, so there's nothing to verify you against.";
    case "unsupported":
      return "This browser doesn't support device unlock — in-app browsers like Facebook, Instagram and Telegram never will. Your PIN still works.";
    default:
      return "";
  }
}

/**
 * Turn a failure from the WebAuthn call into something actionable.
 *
 * This exists because the prompt previously failed *silently*, which is what
 * makes the feature impossible to debug on a real device: every branch names
 * a distinct cause.
 */
export function describeBiometricError(error: unknown): string {
  const err = error as { name?: unknown; message?: unknown } | null;
  const name = err && typeof err === "object" ? String(err.name ?? "") : "";
  const message =
    err && typeof err === "object" ? String(err.message ?? "") : "";

  switch (name) {
    case "NotAllowedError":
      return "The prompt was dismissed or blocked. Open the site in Safari/Chrome rather than an in-app browser and try again.";
    case "SecurityError":
      return "Blocked by the browser: the page must be served over HTTPS.";
    case "NotSupportedError":
      return "This device or browser doesn't support platform biometrics.";
    case "InvalidStateError":
      return "This account is already enrolled on this device.";
    case "AbortError":
      return "The prompt timed out before it was answered.";
    case "UnknownError":
      return "The device's biometric service refused the request. Check that a screen lock is set up.";
    default:
      return message || "Device unlock could not be started.";
  }
}

/* ------------------------------------------------------------------ */
/* WebAuthn                                                            */
/* ------------------------------------------------------------------ */

/**
 * Prompts once (fingerprint / face / device unlock) and returns the new
 * credential id.
 *
 * `authenticatorAttachment: "platform"` keeps this on the device's own
 * authenticator so a hardware key can't silently satisfy it, and
 * `userVerification: "required"` makes the OS ask for verification rather
 * than mere presence.
 *
 * Rejects with the browser's DOMException — callers should surface it via
 * `describeBiometricError`.
 */
export async function createBiometricCredential(
  username: string,
  type: AccountKeyType,
): Promise<string> {
  const credential = await create({
    publicKey: {
      rp: { name: "SteemPro", id: window.location.hostname },
      user: {
        id: randomBase64Url(USER_ID_BYTES),
        name: `${username}:${type}`,
        displayName: `${username} (${type})`,
      },
      challenge: randomBase64Url(CHALLENGE_BYTES),
      // ES256 (Android / iOS / Apple Silicon) and RS256 (older Windows Hello).
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      attestation: "none",
      timeout: TIMEOUT,
    },
  });

  if (!credential?.id) throw new Error("No credential created");
  return credential.id;
}

/**
 * One-call enrolment: prompt once for the authenticator, mint the device
 * secret the key will be re-encrypted with, and hand back both.
 *
 * The caller persists the result via `saveBiometric` (done inside
 * `loginWithKey`), so an aborted login leaves nothing behind.
 */
export async function enrollBiometric(
  username: string,
  type: AccountKeyType,
): Promise<BiometricEnrollment> {
  const credentialId = await createBiometricCredential(username, type);
  return { credentialId, secret: randomBase64Url(32) };
}

/**
 * Asks the authenticator to verify the user for a stored credential.
 *
 * Resolves false — never throws — when the prompt is dismissed, the
 * credential lives in another context (e.g. created in Safari but now
 * opening the app from an in-app browser), or WebAuthn isn't available.
 * Callers treat that as "fall back to the PIN".
 */
export async function verifyBiometric(
  credentialId: string,
): Promise<boolean> {
  if (typeof window === "undefined" || !window.isSecureContext) return false;

  try {
    const assertion = await get({
      publicKey: {
        challenge: randomBase64Url(CHALLENGE_BYTES),
        allowCredentials: [{ type: "public-key", id: credentialId }],
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: TIMEOUT,
      },
    });
    return !!assertion;
  } catch {
    // NotAllowedError = dismissed, unsupported, or wrong authenticator.
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Device-secret storage                                               */
/* ------------------------------------------------------------------ */

function storageKey(username: string, type?: AccountKeyType): string {
  return `${STORAGE_PREFIX}${username}:${type || "posting"}`;
}

export function saveBiometric(
  username: string,
  type: AccountKeyType | undefined,
  enrollment: BiometricEnrollment,
): void {
  try {
    localStorage.setItem(storageKey(username, type), JSON.stringify(enrollment));
  } catch {
    // Private browsing / quota — account just won't offer biometric unlock.
  }
}

export function loadBiometric(
  username: string,
  type: AccountKeyType | undefined,
): BiometricEnrollment | null {
  try {
    const raw = localStorage.getItem(storageKey(username, type));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.credentialId || !parsed?.secret) return null;
    return {
      credentialId: String(parsed.credentialId),
      secret: String(parsed.secret),
    };
  } catch {
    return null;
  }
}

export function clearBiometric(
  username: string,
  type: AccountKeyType | undefined,
): void {
  try {
    localStorage.removeItem(storageKey(username, type));
  } catch {
    // Nothing to do.
  }
}

/* ------------------------------------------------------------------ */
/* Unlock                                                              */
/* ------------------------------------------------------------------ */

/**
 * Verify the user and, on success, return the plaintext private key.
 *
 * Returns null when anything at all goes wrong — no enrollment, prompt
 * dismissed, WebAuthn unsupported here, or a bad secret — so the caller can
 * simply show the PIN modal.
 */
export async function unlockWithBiometric(
  account: LocalAccount,
): Promise<string | null> {
  if (!account.biometric || !account.bioKey) return null;

  const enrollment = loadBiometric(account.username, account.type);
  if (!enrollment) return null;

  if (!(await verifyBiometric(enrollment.credentialId))) return null;

  try {
    const key = decryptPrivateKey(account.bioKey, enrollment.secret);
    return key || null;
  } catch {
    return null;
  }
}
