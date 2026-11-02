import type { Operation, TransactionConfirmation } from "@steempro/dsteem";
import {
  handoffToSteemAuthenticator,
  isTouchBrowser,
  type HandoffResult,
} from "@steempro/steemauth-qr";

/**
 * Hand-off point between a live SteemAuthenticator QR session and
 * `steemApi.broadcast()`.
 *
 * Every operation method in `libs/steem.ts` builds its own operations and then
 * broadcasts. Rather than thread a third "approve this on my phone" argument
 * through ~25 method signatures — and every modal that calls them — a panel
 * driving a QR session registers a handler here for the duration of exactly
 * one broadcast. `broadcast()` asks for a handler first and, when it gets one,
 * hands over the operations and returns the phone's transaction id.
 *
 * Two rules make this safe:
 *
 * 1. **No fallback.** `broadcast()` returns as soon as a handler answers, so a
 *    live QR flow can never fall through to a locally stored key. The user
 *    chose the phone; the phone holds the key.
 * 2. **Always cleared.** The panel clears the handler in a `finally`, so a
 *    closed modal, a rejection or a thrown error all leave the normal
 *    key / Keychain path intact for the next operation.
 *
 * It is deliberately minimal state: one pending handler, no session, no queue.
 */
export type QrBroadcastHandler = (
  username: string,
  operations: Operation[],
) => Promise<TransactionConfirmation>;

let handler: QrBroadcastHandler | null = null;

/**
 * `@steempro/dsteem` models an operation as an interface with numeric keys —
 * `{ 0: name, 1: params }` — while the QR package expects a real tuple,
 * `[name, params]`. Identical on the wire, but a numeric-keyed interface is
 * not assignable to a tuple, so the conversion lives here instead of being
 * repeated (and cast) at every call site.
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

/**
 * `null` outside the browser and whenever no QR flow is running, so server
 * rendering always takes the ordinary path.
 */
export function getQrBroadcastHandler(): QrBroadcastHandler | null {
  if (typeof window === "undefined") return null;
  return handler;
}

/**
 * Shown on the phone alongside the origin, so the person scanning can tell
 * which site is asking before they approve anything.
 */
export const STEEMAUTH_APP_NAME = "SteemPro";

/**
 * How long a QR session stays valid — the lifetime of the *code*, not of the
 * user's login (NextAuth sessions are separate and far longer).
 *
 * The package default is 5 minutes; raised to 15 because the phone is not
 * always within reach. For a `steemauth` account this clock is felt every
 * time anything is approved, and a dead code costs a full rescan.
 *
 * Why the increase is low-risk: the QR carries the session key `k`, but a
 * stranger who scans it joins with *their* phone and can only approve as
 * *their* account — a phone refuses operations that do not involve its own
 * account, so a longer window does not let anyone else act as this user. The
 * code still expires, still needs the phone's biometrics or PIN to approve,
 * and still lives only on a screen this user controls.
 *
 * The phone reads the same value from the payload's `exp`, so this is the
 * single source of truth for both ends. Minimum enforced by the package: 30s.
 */
export const SESSION_TTL_MS = 15 * 60_000;

/** `SESSION_TTL_MS` in minutes, for user-facing copy. */
export const SESSION_TTL_MINUTES = Math.round(SESSION_TTL_MS / 60_000);

/**
 * Same-device handoff to the authenticator.
 *
 * Delegates to `handoffToSteemAuthenticator` in @steempro/steemauth-qr — the
 * ONE supported handoff contract (see the package's docs/handoff.md):
 *
 *   1. bridge — inside the authenticator's own in-app browser, the page posts
 *      `{ t: "steemauth.handoff", c: <payload> }` through the WebView bridge:
 *      the app connects in place — no OS intent, no route transit (which is
 *      what used to flash white screens on Android, where custom schemes
 *      never reach the WebView).
 *   2. scheme — plain external mobile browsers: `steemauth://scan?payload=…`,
 *      which the OS routes into the app. `encodeURIComponent` on the whole
 *      payload means an `&`, `#` or `+` inside it can neither truncate the
 *      query nor inject a second parameter — the app reads it back with
 *      `/(?:^|&)payload=([^&]*)/` + `decodeURIComponent`.
 *   3. none — desktop: nothing to hand off to; callers show the QR instead
 *      (gated by `isTouchDevice`).
 *
 * Returns which transport carried it. The payload never leaves the device,
 * and is never logged, stored or sent anywhere else.
 */
export function openInSteemAuthenticator(qrString: string): HandoffResult {
  return handoffToSteemAuthenticator(qrString);
}

/**
 * "Get it from the Play Store" target of the not-opened fallback — built from
 * the app's own `applicationId` (android/app/build.gradle), so it becomes the
 * right link the moment the listing is live. Kept here beside the handoff that
 * uses it; `Constants.mobile_app_link` is a different app (SteemPro itself).
 */
export const STEEMAUTH_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.steempro.authenticator";

/**
 * Touch devices are exactly the ones that cannot point a camera at their own
 * screen. Delegates to the package's `isTouchBrowser` — same UA check, one
 * source of truth beside the handoff contract that uses it.
 */
export const isTouchDevice = isTouchBrowser();

/**
 * How long an **authentication challenge** stays verifiable — the login
 * proof, not the code.
 *
 * Deliberately a different number from `SESSION_TTL_MS`, because v2.2.0 made
 * the two clocks exclusive and independent:
 *
 *   SESSION_TTL_MS   → the QR's life, and the window every *ordinary*
 *                      request rides (votes, transfers, …). Short on purpose:
 *                      it is a credential on screen.
 *   AUTH_EXPIRES_IN_MS → this call only. It governs the signed challenge after
 *                      `authenticate()` returns, may outlive the QR, and
 *                      leaks into nothing else.
 *
 * The QR still gates *issuing* the request: you have `SESSION_TTL_MS` to scan
 * it. Once issued, the proof stands for seven days — long enough that a
 * login isn't invalidated by walking away mid-flow.
 *
 * Trade-off worth knowing: a captured `message` + `signature` pair is
 * replayable for the length of this window. Our flow verifies once, in the
 * moment, and never persists the proof, so nothing here holds that value.
 */
export const AUTH_EXPIRES_IN_MS = 7 * 24 * 60 * 60_000;

/**
 * Protocol v3 has no endpoint to configure: the transport is the package's
 * public relay constant (`DEFAULT_RELAY_URL` → `wss://relay.steempro.com`),
 * resolved inside the controller, and no credential ships in this bundle.
 * The v2 `planeEndpoint()` Supabase pinning was deleted along with the relay
 * migration — see the package's docs/message-plane.md ("discovery, config
 * endpoints and embedded credentials are gone by design").
 *
 * Supabase is still used by this app — the `useSteemAuthRevocation` row-watch
 * over `steemauth_sessions` (the durable control plane the app still writes),
 * chat and snippets — just never as the session transport.
 */
