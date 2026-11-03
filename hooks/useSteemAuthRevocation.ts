"use client";

import { useEffect, useRef } from "react";
import { watchRevocation } from "@steempro/steemauth-qr";
import { onSharedRevoked } from "@/hooks/useSteemAuthKeepAlive";

/**
 * Sign the user out the moment they revoke this app in the authenticator's
 * Sessions tab. Two paths feed ONE fired-once callback:
 *
 *   1. Room path (instant): a revoke travels in the relay room while the
 *      shared keep-alive controller owns it — zero latency, needs nothing
 *      beyond the session that is already connected.
 *
 *   2. Registry watch (durable): `watchRevocation(account.sid)` asks the
 *      relay to watch this LOGIN sid in its Supabase-backed registry —
 *      it keeps working after the room is swept, after a page reload, and
 *      across session refreshes (the session mints a new sid on refresh(),
 *      the account's login sid never changes). Supabase itself never
 *      touches this client: only the relay holds that credential.
 *
 * Both paths call the same `fire` — whichever lands first wins, the other
 * becomes a no-op. Fail-open throughout: an account without a stored sid
 * (pre-registry) or a relay without a registry simply runs the room path,
 * and a malformed sid can never take down sign-in.
 */
export default function useSteemAuthRevocation(
  account: LocalAccount | null,
  onRevoked: (reason: string) => void,
) {
  const cb = useRef(onRevoked);
  useEffect(() => {
    cb.current = onRevoked;
  });

  const active = account?.loginMethod === "steemauth";
  const sid = account?.sid;
  const relayUrl = account?.relayUrl;

  useEffect(() => {
    if (!active) return;
    let fired = false;
    const fire = (reason: string) => {
      if (fired) return;
      fired = true;
      cb.current(reason);
    };

    // 1. In-room revoke — instant while the room lives.
    const offRoom = onSharedRevoked(fire);

    // 2. Registry watch — the durable path, keyed by the LOGIN sid.
    let watch: { close(): void } | null = null;
    if (sid) {
      try {
        watch = watchRevocation({ sid, relayUrl, onRevoked: fire });
      } catch {
        // Malformed sid on a legacy account — the room path still covers
        // in-room revokes; a watch we cannot open must never break login.
      }
    }

    return () => {
      offRoom();
      watch?.close();
    };
  }, [active, sid, relayUrl]);
}
