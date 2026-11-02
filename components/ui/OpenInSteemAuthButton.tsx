"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, ButtonProps } from "@heroui/button";
import {
  STEEMAUTH_PLAY_STORE_URL,
  isTouchDevice,
  openInSteemAuthenticator,
} from "@/libs/steemauthQr";

/**
 * How long to wait after firing `steemauth://` before offering the fallback.
 * Short on purpose: a phone that is going to take the link takes it within a
 * frame or two (the in-app browser intercepts synchronously, the OS intent
 * either fires or it doesn't), and anything still sitting here after this long
 * has nowhere to go.
 */
const HANDOFF_TIMEOUT_MS = 1500;

interface OpenInSteemAuthButtonProps {
  /**
   * The raw QR payload (`auth.qr.qrString`) — passed straight to the deep
   * link and nowhere else: it contains the session key `k`, so it is never
   * logged, stored or transmitted beyond `steemauth://…`.
   */
  qrString: string;
  /**
   * `auth.ready` — true once the phone has joined the session.
   *
   * Second line of defence for the *navigating* transports: if the phone joins
   * while the watchdog is running (or just after it fired), the hint is
   * dropped rather than claiming "not opened". The in-app case no longer
   * needs it — `'bridge'` never starts the timer — but it costs nothing and
   * still covers a scheme handoff that took the page away late.
   */
  connected?: boolean;
  size?: ButtonProps["size"];
}

/**
 * The accelerator shown under a session QR: "Open in SteemAuthenticator".
 *
 * The QR stays the primary path at all times — this only *adds* a tap for the
 * same-device case, and its fallback never hides or replaces the code.
 *
 * The tap goes through the package's `handoffToSteemAuthenticator` (the ONE
 * supported contract, docs/handoff.md) and gets back which transport carried
 * it, and only the navigating transport gets a "didn't open" watchdog:
 *
 *   - `'bridge'` — inside the app's own browser: a WebView message, connected
 *     in place, **no navigation at all** (Android never delivers custom-scheme
 *     navigations to a WebView anyway — it would only flash a route). No
 *     timeout is started: "still visible" is the *expected* outcome here, and
 *     the app draws its own Connected/error pill.
 *   - `'scheme'` — plain external mobile browsers: `steemauth://…` via the OS
 *     intent. This is the case that can genuinely fail (app not installed), so
 *     the try-then-timeout pattern runs: page backgrounded or unloading
 *     (`visibilitychange`/`pagehide`) → the OS handed off, hint dropped;
 *     `connected` goes true → phone joined anyway, hint dropped; still visible
 *     **and** focused after `HANDOFF_TIMEOUT_MS` → show the Play Store /
 *     scan-the-code fallback.
 *   - `'none'` — no target at all: same watchdog, which then reports honestly.
 *
 * Touch devices only: on desktop there is no second device to hand off *to*,
 * so the button is not rendered and the QR is untouched.
 */
export default function OpenInSteemAuthButton({
  qrString,
  connected,
  size = "sm",
}: OpenInSteemAuthButtonProps) {
  const [showFallback, setShowFallback] = useState(false);
  const timerRef = useRef<number | null>(null);
  const connectedRef = useRef(connected);

  // Stable identity so the listeners below can be registered once.
  const cancelHint = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowFallback(false);
  }, []);

  // Mirrored without a setState so no effect writes state synchronously; the
  // timer reads it to decide whether the app already took the link.
  useEffect(() => {
    connectedRef.current = connected;
  });

  // The OS taking the scheme is detectable (page leaves), so drop the hint.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") cancelHint();
    };
    const onPageHide = () => cancelHint();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [cancelHint]);

  const handlePress = () => {
    // The one and only place the payload goes. No wrapper, no logging.
    // Which transport took it decides whether a hint is even meaningful:
    const transport = openInSteemAuthenticator(qrString);
    // A retry starts from a clean slate rather than stacking timers.
    cancelHint();
    // 'bridge' (in the app's own browser) posts a WebView message and connects
    // IN PLACE — nothing navigates, so "still visible after 1.5s" would be a
    // false failure every time. The app renders its own Connected/error pill
    // on that surface, so no page-side fallback is needed there.
    if (transport === "bridge") return;
    // 'scheme' (external browser → OS intent) and 'none' (no target) are the
    // cases the timeout exists for: app missing, or nothing took the link.
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (connectedRef.current) return;
      if (document.visibilityState === "visible" && document.hasFocus()) {
        setShowFallback(true);
      }
    }, HANDOFF_TIMEOUT_MS);
  };

  // Hooks stay unconditional above; this gate only decides what renders.
  if (!isTouchDevice) return null;

  // `!connected` at render time is the other half of the suppression: `connected`
  // is a prop, so its arrival re-renders and hides an already-visible hint
  // without the effect ever writing state.
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button size={size} variant="light" onPress={handlePress}>
        Open in SteemAuthenticator
      </Button>
      {showFallback && !connected && (
        <p
          role="status"
          className="max-w-[17rem] text-center text-xs text-muted"
        >
          SteemAuthenticator didn&apos;t open —{" "}
          <a
            href={STEEMAUTH_PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            get it from the Play Store
          </a>{" "}
          or scan the code instead.
        </p>
      )}
    </div>
  );
}
