"use client";

import { useEffect, useRef } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Watch a `steemauth` account's session row and fire when the user revokes
 * this app from the SteemAuthenticator Sessions tab.
 *
 * Why this hook exists: the package's own revocation watch only lives inside
 * a mounted `SteemAuthSession` — i.e. while a QR is on screen. On a
 * successful login the modal unmounts, so nothing is watching any more, and
 * the user stays signed in on a session their phone has already cut off. The
 * account therefore stores the `sid` it authenticated with, and this hook
 * keeps watching that row for as long as the account is current.
 *
 * Deliberate choice: only `revoked_at` ends the session. `expires_at` is the
 * *QR code's* five-minute lifetime, not the standing session's — treating it
 * as a logout trigger would silently sign everyone out five minutes after
 * they logged in.
 *
 * Everything degrades silently when Supabase isn't configured: there is
 * simply nothing to watch, and a missing control plane must never lock a user
 * out of an app that still works.
 */

let client: SupabaseClient | null = null;

function getControlPlane(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}

export default function useSteemAuthRevocation(
  account: LocalAccount | null,
  onRevoked: (reason: string) => void,
) {
  const sid =
    account?.loginMethod === "steemauth" && account.sid
      ? account.sid
      : undefined;

  // The callback comes from a provider that re-renders constantly; keying the
  // effect on its identity would tear the channel down on every render.
  const onRevokedRef = useRef(onRevoked);
  useEffect(() => {
    onRevokedRef.current = onRevoked;
  });

  useEffect(() => {
    if (!sid) return;
    const supabase = getControlPlane();
    if (!supabase) return;

    let fired = false;
    const fire = (reason: string) => {
      if (fired) return;
      fired = true;
      onRevokedRef.current(reason);
    };

    // Subscribe before reading, so a revoke landing mid-flight is caught by
    // realtime instead of falling between the two.
    const channel = supabase
      .channel(`steemauth-revoke:${sid}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "steemauth_sessions",
          filter: `sid=eq.${sid}`,
        },
        (payload) => {
          const row = payload.new as {
            revoked_at: string | null;
            revoked_reason: string | null;
          };
          if (row.revoked_at) {
            fire(row.revoked_reason || "Revoked in the authenticator.");
          }
        },
      )
      .subscribe();

    // Realtime only covers changes from now on — this catches a revocation
    // that already happened, e.g. in another tab or while this one was closed.
    void supabase
      .from("steemauth_sessions")
      .select("revoked_at, revoked_reason")
      .eq("sid", sid)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || fired || !data) return;
        if (data.revoked_at) {
          fire(
            (data.revoked_reason as string | null) ||
              "Revoked in the authenticator.",
          );
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sid]);
}
