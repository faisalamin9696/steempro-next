"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Smartphone, RefreshCw } from "lucide-react";
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
import QrNotice from "@/components/ui/QrNotice";
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
 * Sign in by scanning: the phone signs a challenge with the account's posting
 * key and we verify it against the on-chain key before creating a session.
 * Nothing secret is stored here — which is also why every later action is
 * approved on the phone.
 *
 * It rides the SHARED controller from `useSteemAuthKeepAlive`, never a
 * component-scoped session: that one disposed on unmount, so a successful
 * login killed the session the phone was holding and the first post-login
 * action showed a fresh QR again. One controller spans login → every later
 * operation.
 */
function SteemAuthLogin({ onSuccess }: SteemAuthLoginProps) {
  const { loginWithSteemAuth } = useAccountsContext();

  const auth = useSteemAuthKeepAlive({
    appName: STEEMAUTH_APP_NAME,
    origin: typeof window !== "undefined" ? window.location.origin : "",
    ttlMs: SESSION_TTL_MS,
    // White on purpose: a QR on a themed dark card is harder to scan.
    qr: { size: 240, margin: 2, dark: "#000000", light: "#ffffff" },
  });

  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Latest-closure refs: the hook hands back a fresh object every render, so
  // keeping the live values in refs lets the effects below depend on
  // `auth.ready`/the QR alone instead of re-running on every render.
  const sentForQr = useRef<string | null>(null);
  const runRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    runRef.current = async () => {
      if (!auth.account) return;
      setVerifying(true);
      setError(null);
      try {
        // `expiresInMs` is exclusive to this call: the signed proof may outlive
        // the QR (7 days), while the QR only gates issuing it.
        const result = await auth.authenticate({
          statement: "Sign in to SteemPro",
          expiresInMs: AUTH_EXPIRES_IN_MS,
        });

        if (!result?.success || !result.message || !result.signature) {
          throw new Error(result?.error || "The request was declined.");
        }
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

        // The login sid + relay are what the revocation watch keys on — the
        // session's own sid changes on refresh(), the account's never does.
        const login = auth.controller?.session?.payload;
        await loginWithSteemAuth(account, login?.sid, login?.rt);
        toast.success(`Signed in as @${account}`, {
          description:
            "Your phone keeps this session — revoke it any time from the SteemAuthenticator Sessions tab.",
        });
        onSuccess();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign-in failed.");
        setVerifying(false);
        // A rejection ends the code on the phone's side — mint a fresh one.
        sentForQr.current = null;
        void auth.refresh();
      }
    };
  });

  // One sign-request per QR code; a fresh code (retry, second account) fires
  // again because it carries a new qrString.
  useEffect(() => {
    const qr = auth.qr?.qrString;
    if (!auth.ready || !qr || sentForQr.current === qr) return;
    sentForQr.current = qr;
    void runRef.current();
  }, [auth.ready, auth.qr?.qrString]);

  const retry = () => {
    sentForQr.current = null;
    setError(null);
    void auth.refresh();
  };

  const retryButton = (label: string) => (
    <Button size="sm" variant="flat" onPress={retry}>
      <RefreshCw size={14} className="mr-1" />
      {label}
    </Button>
  );

  // Revoked: the user removed this app from the phone's Sessions tab, so the
  // QR on screen can never be answered. Branch on the machine-readable code,
  // never on the message string.
  const revoked = auth.status === "revoked" || auth.errorCode === "revoked";
  const revokeReason = revoked
    ? (auth.controller?.session?.revocationReason ?? null)
    : null;
  const failure = describeQrFailure(auth.errorCode);
  const remaining = useExpiryCountdown(auth.expiresAt);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted px-1">
        Scan with the SteemAuthenticator app to prove you own the account — your
        key never leaves your phone.
      </p>

      {revoked ? (
        <QrNotice
          tone="warning"
          title="Session revoked in the authenticator"
          actions={retryButton("Start a new scan")}
        >
          {revokeReason ??
            "This app was removed from your phone, so the code can no longer be answered."}
        </QrNotice>
      ) : error || auth.error ? (
        <QrNotice
          tone="danger"
          title={failure?.title ?? "Could not sign you in"}
          hint={failure?.hint}
          actions={retryButton("New QR code")}
        >
          {error ?? auth.error}
        </QrNotice>
      ) : auth.expired && !auth.ready ? (
        <QrNotice
          tone="warning"
          title="Code expired"
          actions={retryButton("New QR code")}
        >
          Generate a fresh one, then scan it again.
        </QrNotice>
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
            {/* The SVG ships only a viewBox, so it must be sized by its box —
                `auto` inside this shrink-to-fit parent collapses it to 0x0. */}
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
