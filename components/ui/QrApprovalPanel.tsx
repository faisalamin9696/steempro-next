"use client";

import { useEffect, useRef, useState } from "react";
import {
  useSteemAuthKeepAlive,
  clearQrResult,
} from "@/hooks/useSteemAuthKeepAlive";
import { Button } from "@heroui/button";
import { Alert } from "@heroui/alert";
import { Spinner } from "@heroui/spinner";
import { Smartphone, RefreshCw, X } from "lucide-react";
import { STEEMAUTH_APP_NAME, SESSION_TTL_MINUTES } from "@/libs/steemauthQr";
import OpenInSteemAuthButton from "@/components/ui/OpenInSteemAuthButton";
import { describeQrFailure } from "@/utils/steemAuthError";
import {
  useExpiryCountdown,
  formatCountdown,
} from "@/hooks/useExpiryCountdown";

interface QrApprovalPanelProps {
  /** What the phone is about to ask the user to approve, in plain words. */
  description: string;
  /**
   * Performs the broadcast by calling a `steemApi.*` method with no key and
   * `useKeychain: false`. The bridge registered as soon as the phone scans
   * intercepts it inside `steemApi.broadcast()` and hands the operations to
   * the phone instead.
   *
   * **Omit for standby mode**: the panel then only owns the session and the
   * bridge, so the action may be triggered later by any other component —
   * that is how one session serves all 31 `authenticateOperation` callers.
   */
  onBroadcast?: () => Promise<unknown>;
  /** Called once the phone has broadcast the transaction. */
  onSuccess?: () => void;
  /** Called when the user backs out. */
  onCancel: () => void;
  /**
   * Fires as the phone gains or loses a live scan, so a parent waiting to
   * release an action can resolve without polling the session.
   */
  onReadyChange?: (ready: boolean) => void;
  /**
   * Target account (optional): the Steem username this session is for. It is
   * embedded in the QR so the phone auto-selects it on connect — multi-account
   * users never switch by hand. The standby panel passes the logged-in
   * account; login flows omit it (the scan establishes the account).
   */
  account?: string;
}

export default function QrApprovalPanel({
  description,
  onBroadcast,
  onSuccess,
  onCancel,
  onReadyChange,
  account,
}: QrApprovalPanelProps) {
  // The session outlives this component — see useSteemAuthKeepAlive. The phone
  // may answer minutes after the code was shown, and there is no queue behind
  // a closed session, so unmounting must not tear it down.
  const auth = useSteemAuthKeepAlive({
    appName: STEEMAUTH_APP_NAME,
    origin: typeof window !== "undefined" ? window.location.origin : "",
    // Targeting: embedded in the QR/session so the phone switches to this
    // account on connect (first creator of the shared controller wins; the
    // standby panel is the persistent one).
    account,
    // White background on purpose: a QR on a themed dark card is harder for a
    // phone camera to lock onto.
    qr: { size: 240, margin: 2, dark: "#000000", light: "#ffffff" },
  });

  // A one-shot guard, not UI — nothing renders from it, so a ref keeps the
  // send effect from firing on every re-render without a state write.
  const sentRef = useRef(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  /** True when the phone answered "no" rather than the request failing. */
  const [declined, setDeclined] = useState(false);
  const runRef = useRef<() => Promise<void>>(async () => {});

  const remaining = useExpiryCountdown(auth.expiresAt);

  // The hook hands back a fresh object every render; keep the latest in refs
  // so the effects below can depend on `auth.ready` alone.
  const authRef = useRef(auth);
  const readyChangeRef = useRef(onReadyChange);
  useEffect(() => {
    authRef.current = auth;
    readyChangeRef.current = onReadyChange;
  });

  // The bridge is NOT here — it belongs to useSteemAuthKeepAlive, alongside
  // the session it serves. Two panels share that one module-level slot, so a
  // panel-owned handler meant whichever panel unmounted last cleared the
  // other's, and every subsequent action found no bridge, no key and no route
  // to the phone: the Approvals tab stayed empty.

  // Let a waiting parent release its action without polling the session.
  useEffect(() => {
    readyChangeRef.current?.(auth.ready);
  }, [auth.ready]);

  // Action mode: run the caller's thunk. Deliberately does NOT touch the
  // bridge — it has to stay installed for whatever the user does next.
  useEffect(() => {
    runRef.current = async () => {
      if (!onBroadcast) return;
      try {
        await onBroadcast();
        onSuccess?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "The request failed.";
        setBroadcastError(message);
        // A refusal and a failure need different words: one means the user
        // said no, the other means we never got an answer.
        setDeclined(/reject|declin|refus/i.test(message));
        // A rejection closes the session on the phone's side, so the next
        // attempt needs a fresh code.
        sentRef.current = false;
        void authRef.current.refresh();
      }
    };
  });

  // Fire the pending action as soon as the phone scans (action mode only).
  useEffect(() => {
    if (!auth.ready || !onBroadcast || sentRef.current) return;
    sentRef.current = true;
    void runRef.current();
  }, [auth.ready, onBroadcast]);

  const refresh = () => {
    sentRef.current = false;
    setBroadcastError(null);
    setDeclined(false);
    // `auth.refresh()` also clears the previous result, so a stale success
    // can never mask the failure that prompted this new code.
    void auth.refresh();
  };

  // "Request again": forget the result and let the action run once more — in
  // action mode the caller's thunk fires again immediately (the session is
  // usually still live, so no new code is needed); in standby mode the panel
  // drops back to its connected/QR view, where the next — possibly modified,
  // e.g. another voting weight — action can be triggered from wherever it
  // lives. Deliberately does NOT refresh the session: a new code would drop
  // a phone that is still attached.
  const requestAgain = () => {
    clearQrResult();
    setBroadcastError(null);
    setDeclined(false);
    if (onBroadcast) {
      sentRef.current = false;
      void runRef.current();
    }
  };

  const inFlight = auth.ready || auth.requesting;

  // Revoking this app on the phone ends the session immediately; a revoked
  // QR cannot be answered, so it must not keep rendering as if it could.
  // Both signals count: the status flip is the common path, but a request
  // rejected with `revoked` must land here too.
  const revoked = auth.status === "revoked" || auth.errorCode === "revoked";
  const revokeReason = revoked
    ? (auth.controller?.session?.revocationReason ?? null)
    : null;
  // Branch on the machine-readable code, never on the message string.
  const failure = describeQrFailure(auth.errorCode);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full rounded-lg border border-default-200 bg-default-100/60 p-3">
        <p className="text-xs text-muted mb-1">Waiting to approve</p>
        <p className="text-sm font-medium">{description}</p>
      </div>

      {auth.lastTxId ? (
        // A result is the truth even if the UI had already given up: the
        // transaction is on-chain, so present it as the success it is.
        <Alert
          color="success"
          variant="flat"
          title="Approved and broadcast"
          description={
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                Your phone signed this and it is now on the chain.
              </p>
              <p className="break-all font-mono text-xs">{auth.lastTxId}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="flat" onPress={requestAgain}>
                  Request again
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => (onSuccess ? onSuccess() : onCancel())}
                >
                  Done
                </Button>
              </div>
            </div>
          }
        />
      ) : revoked ? (
        <Alert
          color="warning"
          variant="faded"
          title="Session revoked in the authenticator"
          description={
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                {revokeReason
                  ? revokeReason
                  : "This app was removed from the requesting site on your phone, so the action can no longer be approved."}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="flat" onPress={refresh}>
                  <RefreshCw size={14} className="mr-1" />
                  New QR code
                </Button>
                <Button size="sm" variant="light" onPress={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          }
        />
      ) : (broadcastError ?? auth.error) ? (
        <Alert
          color="danger"
          variant="faded"
          title={
            declined
              ? "Declined on your phone"
              : (failure?.title ?? "The request did not go through")
          }
          description={
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm">{broadcastError ?? auth.error}</p>
                <p className="text-xs text-muted">
                  {declined
                    ? "Nothing was signed and nothing was broadcast."
                    : failure?.hint}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="flat" onPress={refresh}>
                  <RefreshCw size={14} className="mr-1" />
                  New QR code
                </Button>
                <Button size="sm" variant="light" onPress={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          }
        />
      ) : auth.expired && !auth.ready ? (
        // The always-on session outlives its QR: without this a stale code
        // would be offered after five minutes and the phone would reject the
        // scan as expired.
        <Alert
          color="warning"
          variant="faded"
          title="Code expired"
          description={
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                Generate a fresh one, then scan it again.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="flat" onPress={refresh}>
                  <RefreshCw size={14} className="mr-1" />
                  New QR code
                </Button>
                <Button size="sm" variant="light" onPress={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          }
        />
      ) : !onBroadcast && auth.ready && !auth.requesting ? (
        // Standby: connected with nothing to approve yet. This single panel is
        // the whole QR surface — every action reaches the phone through it —
        // so `requesting` must win, otherwise an in-flight action would show
        // "connected" while the phone was actually waiting on a decision.
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
            <Smartphone size={22} />
          </div>
          <p className="text-sm font-medium">Connected to @{auth.account}</p>
          <p className="max-w-[16rem] text-center text-xs text-muted">
            The next thing you do on this site is sent here, and waits on the{" "}
            <span className="font-medium">Approvals</span> tab for you to
            approve.
          </p>
          <Button size="sm" variant="light" onPress={onCancel}>
            Cancel
          </Button>
        </div>
      ) : inFlight ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Spinner size="lg" color="primary" />
          <p className="text-sm font-medium">Waiting for your phone</p>
          <p className="max-w-[16rem] text-center text-xs text-muted">
            Open <span className="font-medium">SteemAuthenticator</span> →{" "}
            <span className="font-medium">Approvals</span>, then approve with
            biometrics or your PIN. You can leave it open and come back to it —
            the code stays valid until it expires.
          </p>
          {auth.account && (
            <p className="text-xs text-muted">Approving as @{auth.account}</p>
          )}
        </div>
      ) : !auth.qr ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Spinner size="lg" color="default" />
          <p className="text-xs text-muted">Preparing a secure code…</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-white p-3 shadow-inner">
            <div
              // The SVG ships only a viewBox, no width/height, so it must be
              // sized by its box — `auto` inside this shrink-to-fit parent
              // collapses it to 0x0 and only the white padding shows.
              className="h-[240px] w-[240px] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
              // Generated in-page by `qrcode` from the session payload — the
              // same data the phone validates before it will show anything.
              dangerouslySetInnerHTML={{ __html: auth.qr.svg }}
            />
          </div>

          <p className="text-center text-sm">
            Scan with <span className="font-medium">SteemAuthenticator</span>
          </p>
          {/* Mobile only: the QR, countdown and handoff button already fill a
              phone-sized card, so this secondary instruction is kept for md+
              where there is room for it. */}
          <p className="hidden max-w-[16rem] text-center text-xs text-muted md:block">
            Then review it on the <span className="font-medium">Approvals</span>{" "}
            tab and approve with biometrics or your PIN.
          </p>

          <p className="text-xs text-muted">
            {remaining !== null
              ? `Code expires in ${formatCountdown(remaining)}`
              : `The code expires after ${SESSION_TTL_MINUTES} minutes`}
          </p>
          <OpenInSteemAuthButton
            qrString={auth.qr.qrString}
            connected={auth.ready}
          />

          <Button
            size="sm"
            variant="light"
            className="text-muted"
            onPress={onCancel}
          >
            <X size={14} className="mr-1" />
            Use another method
          </Button>
        </>
      )}
    </div>
  );
}
