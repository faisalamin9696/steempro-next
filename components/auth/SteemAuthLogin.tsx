"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { Alert } from "@heroui/alert";
import { Spinner } from "@heroui/spinner";
import { Smartphone, RefreshCw } from "lucide-react";
// The SHARED module-scoped controller (see useSteemAuthKeepAlive), not the
// component-scoped `useSteemAuth()`: that one disposes its session on unmount,
// so a successful login killed the session the phone was still holding — and
// the always-on standby panel minted a SECOND, never-scanned session for the
// first post-login action, which is why that action showed a fresh QR ("Approve
// on your phone") and never put a row in steemauth_messages. One controller now
// spans login → every later operation.
import { useSteemAuthKeepAlive } from "@/hooks/useSteemAuthKeepAlive";
import { toast } from "sonner";
import { steemApi } from "@/libs/steem";
import {
  STEEMAUTH_APP_NAME,
  SESSION_TTL_MS,
  SESSION_TTL_MINUTES,
  AUTH_EXPIRES_IN_MS,
} from "@/libs/steemauthQr";
import OpenInSteemAuthButton from "@/components/ui/OpenInSteemAuthButton";
import { useAccountsContext } from "./AccountsContext";
import { describeQrFailure } from "@/utils/steemAuthError";
import {
  useExpiryCountdown,
  formatCountdown,
} from "@/hooks/useExpiryCountdown";

interface SteemAuthLoginProps {
  onSuccess: () => void;
}

/**
 * Sign in by scanning with the SteemAuthenticator app.
 *
 * The flow proves key possession without the key ever reaching this browser:
 * we mint a challenge, the phone signs it with the account's posting key, and
 * we verify that signature against the account's on-chain public key before
 * creating a session. Like Keychain, nothing secret is stored locally — which
 * is also why every later action has to be approved on the phone.
 */
function SteemAuthLogin({ onSuccess }: SteemAuthLoginProps) {
  const { loginWithSteemAuth } = useAccountsContext();

  const auth = useSteemAuthKeepAlive({
    appName: STEEMAUTH_APP_NAME,
    origin: typeof window !== "undefined" ? window.location.origin : "",
    // The code's lifetime — see SESSION_TTL_MS for why it is longer than the
    // package's 5-minute default.
    ttlMs: SESSION_TTL_MS,
    // White on purpose: a QR on a themed dark card is harder to scan.
    qr: { size: 240, margin: 2, dark: "#000000", light: "#ffffff" },
  });

  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // One-shot PER QR: a re-render must not fire a second sign request, but a
  // SECOND attempt (another account / a refreshed code) carries a NEW
  // qrString and must fire again. The old boolean stayed true for the whole
  // component lifetime, which is why adding a 2nd account never sent its
  // authenticate request (connect pill faded, no sign prompt on the phone).
  const sentForQr = useRef<string | null>(null);
  const runRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    runRef.current = async () => {
      if (!auth.account) return;

      setVerifying(true);
      setError(null);

      try {
        // Structured challenge: the phone signs `message` and — because this
        // goes out as method:"authenticate" — remembers this app as a session
        // the user can revoke from its Sessions tab.
        // v2.2.0 makes `expiresInMs` exclusive to this call: nothing else
        // inherits it, and the challenge window may outlive the QR — but it
        // defaults to a FIXED 5 minutes, independent of the QR's ttlMs. So
        // raising SESSION_TTL_MS alone would not have made login more
        // patient; the two clocks have to be set together.
        const result = await auth.authenticate({
          statement: "Sign in to SteemPro",
          // v2.2.0 makes this window exclusive to the call: it may outlive the
          // QR and leaks into no other operation. The QR still decides whether
          // the request can be *issued*; this decides how long the resulting
          // proof stays good.
          expiresInMs: AUTH_EXPIRES_IN_MS,
        });

        if (!result?.success || !result.message || !result.signature) {
          throw new Error(result?.error || "The request was declined.");
        }

        // The phone enforces this too; checking here keeps a proof that
        // somehow outlived its window from being accepted.
        if (result.expiresAt && Date.now() > result.expiresAt) {
          throw new Error("That proof expired — please scan again.");
        }

        const account = result.account ?? auth.account;
        if (!account) throw new Error("No account signed the challenge.");

        const verified = await steemApi.verifyMessageSignature(
          account,
          result.message,
          result.signature,
        );
        if (!verified) {
          throw new Error("That signature did not match this account.");
        }

        await loginWithSteemAuth(
          account,
          auth.controller?.session?.payload.sid,
        );
        // Diagnostic: proves the login rode the SHARED controller (the fix) —
        // the sid logged here must be the sid your later operations use.
        console.info(
          "[steemauth-login] verified on shared session",
          auth.controller?.session?.payload.sid,
        );

        toast.success(`Signed in as @${account}`, {
          description:
            "Your phone keeps this session — revoke it any time from the SteemAuthenticator Sessions tab.",
        });
        onSuccess();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign-in failed.");
        setVerifying(false);
        // A rejection closes the session on the phone's side, so the next
        // attempt needs a fresh code.
        sentForQr.current = null;
        void auth.refresh();
      }
    };
  });

  // The phone announces itself the moment it scans; send straight after -
  // once per QR code, so a fresh attempt (new qrString) always goes out.
  useEffect(() => {
    const qr = auth.qr?.qrString;
    if (!auth.ready || !qr) return;
    if (sentForQr.current === qr) return;
    sentForQr.current = qr;
    void runRef.current();
  }, [auth.ready, auth.qr?.qrString]);

  const retry = () => {
    sentForQr.current = null;
    setError(null);
    void auth.refresh();
  };

  // The user can revoke this app from the phone's Sessions tab. A revoked
  // session's QR is dead — show that instead of offering a code nobody can
  // answer any more. A request rejected with `revoked` counts too.
  const revoked = auth.status === "revoked" || auth.errorCode === "revoked";
  const revokeReason = revoked
    ? (auth.controller?.session?.revocationReason ?? null)
    : null;
  // Branch on the machine-readable code, never on the message string.
  const failure = describeQrFailure(auth.errorCode);
  // Live countdown on the code, same as the transaction panel.
  const remaining = useExpiryCountdown(auth.expiresAt);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted px-1">
          Scan with the SteemAuthenticator app to prove you own the account —
          your key never leaves your phone.
        </p>
      </div>

      {revoked ? (
        <Alert
          color="warning"
          variant="faded"
          title="Session revoked in the authenticator"
          description={
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                {revokeReason
                  ? revokeReason
                  : "This app was removed from your phone, so the code can no longer be answered."}
              </p>
              <Button size="sm" variant="flat" onPress={retry}>
                <RefreshCw size={14} className="mr-1" />
                Start a new scan
              </Button>
            </div>
          }
        />
      ) : error || auth.error ? (
        <Alert
          color="danger"
          variant="faded"
          title={failure?.title ?? "Could not sign you in"}
          description={
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm">{error ?? auth.error}</p>
                {failure?.hint && (
                  <p className="text-xs text-muted">{failure.hint}</p>
                )}
              </div>
              <Button size="sm" variant="flat" onPress={retry}>
                <RefreshCw size={14} className="mr-1" />
                New QR code
              </Button>
            </div>
          }
        />
      ) : auth.expired && !auth.ready ? (
        // The code's window closed while this screen sat open — offering it
        // would only earn a "QR expired" rejection on the phone. Same
        // condition as QrApprovalPanel's expired branch.
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
                <Button size="sm" variant="flat" onPress={retry}>
                  <RefreshCw size={14} className="mr-1" />
                  New QR code
                </Button>
              </div>
            </div>
          }
        />
      ) : verifying || auth.ready ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Spinner size="lg" color="primary" />
          <p className="text-sm font-medium">Check your phone</p>
          <p className="text-xs text-muted text-center">
            Approve the login request as
            {auth.account ? ` @${auth.account}` : " on your device"}.
          </p>
        </div>
      ) : !auth.qr ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Spinner size="lg" color="default" />
          <p className="text-xs text-muted">Preparing a secure code…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl bg-white p-3 shadow-inner">
            {/* The SVG ships only a viewBox, no width/height, so it must be
                sized by its box — otherwise `auto` inside this shrink-to-fit
                parent collapses it to 0x0 and only the padding shows. */}
            <div
              className="h-[240px] w-[240px] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: auth.qr.svg }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Smartphone size={16} className="text-primary" />
            <p>
              Scan with <span className="font-medium">SteemAuthenticator</span>
            </p>
          </div>
          <p className="text-xs text-muted">
            {remaining !== null
              ? `Code expires in ${formatCountdown(remaining)}`
              : `The code expires after ${SESSION_TTL_MINUTES} minutes.`}
          </p>
          <OpenInSteemAuthButton
            qrString={auth.qr.qrString}
            connected={auth.ready}
          />
        </div>
      )}
    </div>
  );
}

export default SteemAuthLogin;
