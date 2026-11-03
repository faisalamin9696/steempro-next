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
import QrNotice from "@/components/ui/QrNotice";
import { describeQrFailure } from "@/utils/steemAuthError";
import {
  useExpiryCountdown,
  formatCountdown,
} from "@/hooks/useExpiryCountdown";

interface QrApprovalPanelProps {
  /** What the phone is about to ask the user to approve, in plain words. */
  description: string;
  /**
   * Runs the caller's broadcast (its `steemApi.*` call, intercepted by the
   * bridge and answered by the phone). Omit for standby mode, where the panel
   * only owns the session/bridge and other components trigger the action —
   * that is how one session serves all 31 `authenticateOperation` callers.
   */
  onBroadcast?: () => Promise<unknown>;
  /** Called once the phone has broadcast the transaction. */
  onSuccess?: () => void;
  /** Called when the user backs out. */
  onCancel: () => void;
  /** Reports live/lost scans so a waiting parent can release its action. */
  onReadyChange?: (ready: boolean) => void;
  /** Steem username this session is for — embedded in the QR so the phone
   *  auto-selects it. Standby passes the logged-in account; login omits it. */
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
  // The session outlives this component (see useSteemAuthKeepAlive): the phone
  // may answer minutes after the code was shown, and unmounting must not close
  // the session underneath it.
  const auth = useSteemAuthKeepAlive({
    appName: STEEMAUTH_APP_NAME,
    origin: typeof window !== "undefined" ? window.location.origin : "",
    account,
    // White on purpose: a QR on a themed dark card is harder to scan.
    qr: { size: 240, margin: 2, dark: "#000000", light: "#ffffff" },
  });

  // One-shot per QR, not UI — a ref so the send effect never re-fires on a
  // plain re-render.
  const sentRef = useRef(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  /** True when the phone answered "no" rather than the request failing. */
  const [declined, setDeclined] = useState(false);
  const runRef = useRef<() => Promise<void>>(async () => {});

  const remaining = useExpiryCountdown(auth.expiresAt);

  // Keep the latest values in refs so the effects depend on `auth.ready` alone
  // (the hook returns a fresh object every render).
  const authRef = useRef(auth);
  const readyChangeRef = useRef(onReadyChange);
  useEffect(() => {
    authRef.current = auth;
    readyChangeRef.current = onReadyChange;
  });

  // The bridge lives with the session (useSteemAuthKeepAlive), not here: two
  // panels share one module slot, so a panel-owned handler was cleared by
  // whichever unmounted last, leaving no route to the phone.

  // Let a waiting parent release its action without polling the session.
  useEffect(() => {
    readyChangeRef.current?.(auth.ready);
  }, [auth.ready]);

  // Action mode: run the caller's thunk. Deliberately does NOT touch the
  // bridge — it must stay installed for whatever the user does next.
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
        // Refusal vs failure need different words: one is a "no", one never
        // got an answer.
        setDeclined(/reject|declin|refus/i.test(message));
        // A rejection ends the code on the phone — the next attempt needs a
        // fresh one.
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
    // `refresh()` also drops the previous result, so a stale success can never
    // mask the failure that prompted the new code.
    void auth.refresh();
  };

  // "Request again": forget the result and run the action once more — action
  // mode re-fires immediately (session usually still live); standby drops back
  // to the connected/QR view so the next — possibly modified — action can be
  // triggered from wherever it lives. Never refresh() here: a new code would
  // drop a phone that is still attached.
  const requestAgain = () => {
    clearQrResult();
    setBroadcastError(null);
    setDeclined(false);
    if (onBroadcast) {
      sentRef.current = false;
      void runRef.current();
    }
  };

  const retryButton = (label: string) => (
    <Button size="sm" variant="flat" onPress={refresh}>
      <RefreshCw size={14} className="mr-1" />
      {label}
    </Button>
  );
  const cancelButton = (
    <Button size="sm" variant="light" onPress={onCancel}>
      Cancel
    </Button>
  );

  const inFlight = auth.ready || auth.requesting;
  // Revocation lands in the room: the status flip is the common path, but a
  // request rejected with `revoked` counts too.
  const revoked = auth.status === "revoked" || auth.errorCode === "revoked";
  const revokeReason = revoked
    ? (auth.controller?.session?.revocationReason ?? null)
    : null;
  const failure = describeQrFailure(auth.errorCode);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full rounded-lg border border-default-200 bg-default-100/60 p-3">
        <p className="text-xs text-muted mb-1">Waiting to approve</p>
        <p className="text-sm font-medium">{description}</p>
      </div>

      {auth.lastTxId ? (
        // A result is the truth even if the UI already gave up: the transaction
        // is on-chain, so present it as the success it is.
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
        <QrNotice
          tone="warning"
          title="Session revoked in the authenticator"
          actions={
            <>
              {retryButton("New QR code")}
              {cancelButton}
            </>
          }
        >
          {revokeReason ??
            "This app was removed from the requesting site on your phone, so the action can no longer be approved."}
        </QrNotice>
      ) : (broadcastError ?? auth.error) ? (
        <QrNotice
          tone="danger"
          title={
            declined
              ? "Declined on your phone"
              : (failure?.title ?? "The request did not go through")
          }
          hint={
            declined
              ? "Nothing was signed and nothing was broadcast."
              : failure?.hint
          }
          actions={
            <>
              {retryButton("New QR code")}
              {cancelButton}
            </>
          }
        >
          {broadcastError ?? auth.error}
        </QrNotice>
      ) : auth.expired && !auth.ready ? (
        // The always-on session outlives its QR: without this a stale code
        // would be offered after its window and the phone would reject the scan.
        <QrNotice
          tone="warning"
          title="Code expired"
          actions={
            <>
              {retryButton("New QR code")}
              {cancelButton}
            </>
          }
        >
          Generate a fresh one, then scan it again.
        </QrNotice>
      ) : !onBroadcast && auth.ready && !auth.requesting ? (
        // Standby: connected, nothing to approve. `requesting` must win,
        // otherwise an in-flight action would show "connected" while the phone
        // is actually waiting on a decision.
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
            {/* The SVG ships only a viewBox, so it must be sized by its box —
                `auto` inside this shrink-to-fit parent collapses it to 0x0. */}
            <div
              className="h-[240px] w-[240px] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: auth.qr.svg }}
            />
          </div>

          <p className="text-center text-sm">
            Scan with <span className="font-medium">SteemAuthenticator</span>
          </p>
          {/* Mobile only: the QR, countdown and handoff button already fill a
              phone-sized card — kept for md+ where there is room for it. */}
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
