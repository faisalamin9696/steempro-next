import type { Operation, TransactionConfirmation } from "@steempro/dsteem";
import {
  handoffToSteemAuthenticator,
  isTouchBrowser,
  type HandoffResult,
} from "@steempro/steemauth-qr";

/**
 * Phone-approval bridge for one broadcast: `steemApi.broadcast()` consults
 * this first and, when set, hands the operations to the phone and returns its
 * tx id — so a live QR flow can never fall through to a stored key. The panel
 * installs it for a single call and clears it in `finally`, leaving the
 * key/Keychain path intact. One pending handler: no session, no queue.
 */
export type QrBroadcastHandler = (
  username: string,
  operations: Operation[],
) => Promise<TransactionConfirmation>;

let handler: QrBroadcastHandler | null = null;

/**
 * dsteem's `{0: name, 1: params}` interface isn't assignable to the tuple the
 * QR package expects — convert once here instead of casting at every site.
 */
export type WireOperation = [string, Record<string, unknown>];

export function toWireOperations(
  operations: readonly Operation[],
): WireOperation[] {
  return operations.map((op): WireOperation => [op[0], op[1]]);
}

/** Called by the QR panel before it triggers the broadcast. */
export function setQrBroadcastHandler(next: QrBroadcastHandler | null): void {
  handler = next;
}

/** `null` during SSR, so server rendering always takes the ordinary path. */
export function getQrBroadcastHandler(): QrBroadcastHandler | null {
  if (typeof window === "undefined") return null;
  return handler;
}

/** Shown on the phone so the person scanning can tell which site is asking. */
export const STEEMAUTH_APP_NAME = "SteemPro";

/**
 * Lifetime of the CODE, not of the login (NextAuth is separate). Raised from
 * the package's 5-minute default to 15: the phone is often out of reach and a
 * dead code costs a full rescan. Safe at 15 because a stranger who scans it
 * joins with their own phone and can approve only as themselves. Both ends
 * read `exp` from the payload — single source of truth (package min 30 s).
 */
export const SESSION_TTL_MS = 15 * 60_000;

/** `SESSION_TTL_MS` in minutes, for user-facing copy. */
export const SESSION_TTL_MINUTES = Math.round(SESSION_TTL_MS / 60_000);

/**
 * Same-device handoff through the package's one supported contract
 * (`handoffToSteemAuthenticator`, docs/handoff.md): `'bridge'` posts a WebView
 * message and connects in place inside the authenticator's own browser — no
 * navigation, since a custom scheme never reaches a WebView and only flashes a
 * route; `'scheme'` fires `steemauth://scan?payload=…` for external mobile
 * browsers; `'none'` is desktop → show the QR. The payload is percent-encoded,
 * so an `&`/`#` inside it cannot truncate the query, and it is never logged,
 * stored or sent anywhere else.
 */
export function openInSteemAuthenticator(qrString: string): HandoffResult {
  return handoffToSteemAuthenticator(qrString);
}

/**
 * Fallback link for the not-opened hint, built from the app's own
 * `applicationId` — `Constants.mobile_app_link` is a different app (SteemPro).
 */
export const STEEMAUTH_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.steempro.authenticator";

/** The devices that can't point a camera at their own screen — the package's
 *  `isTouchBrowser`, one source of truth with the handoff above. */
export const isTouchDevice = isTouchBrowser();

/**
 * Validity of the signed login challenge — deliberately not `SESSION_TTL_MS`:
 * the QR (15 min) only gates *issuing* it, while the proof stands 7 days so a
 * login survives walking away mid-flow. A captured message+signature is
 * replayable for that window; we verify once and never persist it.
 */
export const AUTH_EXPIRES_IN_MS = 7 * 24 * 60 * 60_000;

/**
 * No endpoint or config lives here by design (protocol v3): the transport is
 * the package's public relay constant and no credential ships in the bundle.
 * Supabase stays for app features only (chat, community, backend) — never as
 * the session transport, and no longer for revocation either: a revoke is a
 * sealed row in the relay room, read off the shared controller's state.
 */
