"use client";

import { useEffect, useState } from "react";
import { SteemAuthController } from "@steempro/steemauth-qr";
import type { TransactionConfirmation } from "@steempro/dsteem";
import {
  setQrBroadcastHandler,
  toWireOperations,
  SESSION_TTL_MS,
} from "@/libs/steemauthQr";

/**
 * The QR session, owned by the app rather than by any component.
 *
 * `useSteemAuth()` disposes on unmount — right for component scope, wrong for
 * this one: the phone may answer long after the panel closes, and there is no
 * queue behind a closed session (the approval would simply be lost). So the
 * controller is module-scoped: mounted once, never disposed by unmount,
 * replaced only by `refresh()` or the code's own expiry. `dispose()`/`start()`
 * are no-ops on the returned object so old call sites can't tear it down.
 */

let shared: SteemAuthController | null = null;

/** The constructor's options — `Parameters<>` cannot be used on a class. */
type KeepAliveOptions = ConstructorParameters<typeof SteemAuthController>[0];

/**
 * Broadcast id of the most recent approved request, so the panel can show it
 * without owning the bridge that received it.
 */
let lastTxId: string | null = null;
const txListeners = new Set<() => void>();

function announceTxId(id: string) {
  lastTxId = id;
  txListeners.forEach((listener) => listener());
}

/** A new code means a new story — drop the previous result with it. */
function clearLastTxId() {
  lastTxId = null;
  txListeners.forEach((listener) => listener());
}

/**
 * Revocation watchers registered by `onSharedRevoked` — bound to the shared
 * controller the moment it exists, whenever that is.
 *
 * The controller is created lazily by the approval/login panels, so a hook
 * that subscribes at app boot (before any panel mounted) must NOT be handed a
 * no-op: `shared === null` there used to mean "never subscribe", and the room
 * path died silently on every page reload. Registration and controller
 * creation are now independent — whichever happens first waits for the other.
 */
const revokedWatchers = new Set<(reason: string) => void>();
let revokedBound = false;

/** Current controller state if it is revoked, else null. */
function revokedState(): { error: string | null } | null {
  const state = shared?.getState();
  return state && (state.status === "revoked" || state.errorCode === "revoked")
    ? state
    : null;
}

/** Attach the single controller subscription that fans out to all watchers. */
function bindRevokedWatcher() {
  if (revokedBound || !shared) return;
  revokedBound = true;
  // subscribe() fires immediately (current state) and on every transition;
  // per-watcher fired-once guards live in the callers, so fanning out on
  // each transition is safe and idempotent.
  shared.subscribe(() => {
    const state = revokedState();
    if (!state) return;
    const reason = state.error || "Revoked in the authenticator.";
    for (const cb of revokedWatchers) cb(reason);
  });
}

function getShared(options: KeepAliveOptions): SteemAuthController {
  if (shared) return shared;

  // `persistSession` is opt-in and defaults to sessionStorage, so a page
  // reload resumes the same session instead of minting a new one — and an
  // in-flight request is re-issued under the same id, so the phone's approval
  // still lands. Without it a refresh is the last remaining way to lose a
  // session the phone may be about to answer.
  shared = new SteemAuthController({
    ...options,
    ttlMs: SESSION_TTL_MS,
    persistSession: true,
  });
  // Any watcher registered before the controller existed (app boot with a
  // persisted account) attaches here — the moment the room path becomes real.
  bindRevokedWatcher();

  // The bridge lives WITH the session, not in a panel: two panels share one
  // module-level slot, so a panel-owned handler let whichever unmounted last
  // clear the other's — leaving no bridge, and no route to the phone, for
  // every later action. Its lifetime has to match the session's.
  setQrBroadcastHandler(async (_username, operations) => {
    // `keyType` is omitted deliberately: the package derives the required
    // authority from the operations themselves, so the phone is never asked
    // for more than the operation actually needs.
    const result = await shared!.broadcast(toWireOperations(operations));

    if (!result?.success) {
      throw new Error(
        result?.error || "The request was rejected on your phone.",
      );
    }

    // The transaction is real the moment the phone says so — remember the id
    // so a result landing after the UI showed "expired" is still presented as
    // the success it is rather than swallowed.
    const id = result.data?.txId;
    if (id) announceTxId(id);

    return {
      id: id ?? "",
      block_num: 0,
      trx_num: 0,
      expired: false,
    } satisfies TransactionConfirmation;
  });

  // `start()` never rejects — a message-plane failure lands in `state.error`,
  // so there is nothing to catch and no reason to await it.
  void shared.start();
  return shared;
}

export function useSteemAuthKeepAlive(options: KeepAliveOptions): ReturnType<
  SteemAuthController["getState"]
> & {
  /** Broadcast id of the latest approved request, if one has landed. */
  lastTxId: string | null;
  broadcast: SteemAuthController["broadcast"];
  /** Off-chain challenge signing — used by the login flow on the shared session. */
  authenticate: SteemAuthController["authenticate"];
  refresh: () => void;
  controller: SteemAuthController;
  dispose: () => void;
  start: () => void;
} {
  // Creating during render is safe here: `shared` is module-scoped and
  // guarded, so StrictMode's double render still yields one controller.
  const controller = getShared(options);
  const [state, setState] = useState(() => controller.getState());
  const [txId, setTxId] = useState<string | null>(lastTxId);

  useEffect(() => {
    // `subscribe` fires immediately with the current state, and the
    // controller caches immutable snapshots, so identity is stable between
    // transitions — this is one render per state change, not per parent render.
    const unsubscribe = controller.subscribe(() =>
      setState(controller.getState()),
    );
    const listener = () => setTxId(lastTxId);
    txListeners.add(listener);
    return () => {
      unsubscribe();
      txListeners.delete(listener);
    };
  }, [controller]);

  return {
    ...state,
    lastTxId: txId,
    broadcast: (operations, keyType) =>
      controller.broadcast(operations, keyType),
    authenticate: (options) => controller.authenticate(options),
    refresh: () => {
      // A fresh code must not leave the previous result on screen: the panel
      // renders success ahead of every failure, so a stale id would mask a
      // decline that just happened.
      clearLastTxId();
      controller.refresh();
    },
    controller,
    dispose: () => {},
    start: () => {},
  };
}

/**
 * Explicitly END the live session ("Phone connected ✕"): the cancel frame is
 * what the phone reacts to (any cancel drops its watch card), then refresh()
 * mints a fresh session so the next action waits for a new scan.
 */
export function endSharedSession(): void {
  if (!shared) return;
  if (shared.getState().requesting) {
    // Settle in-flight requests properly — cancel() walks the pending ids,
    // and at least one frame goes out, which is what the phone keys on.
    shared.cancel(undefined, "Session ended on the requesting site.");
  } else {
    // Nothing pending → cancel() would send NOTHING (it only walks pending
    // ids), so name a target ourselves: the phone ends the session on ANY
    // cancel regardless of the id it carries.
    shared.cancel("session-end", "Session ended on the requesting site.");
  }
  // The INSERT above is already in flight — plane.send is an HTTP INSERT,
  // independent of the channel this teardown closes — so the phone still
  // hears it after refresh() rebuilds the session.
  void shared.refresh();
}

/**
 * Fires when the shared session is revoked in the authenticator — in v3 a
 * revoke is a sealed row in the relay room, delivered live to the shared
 * controller. Registering is order-independent: called before the controller
 * exists (the normal case at app boot) it waits for it; called after a
 * revoke already landed it fires immediately. Returns an unsubscribe.
 */
export function onSharedRevoked(cb: (reason: string) => void): () => void {
  revokedWatchers.add(cb);
  bindRevokedWatcher();
  const state = revokedState();
  if (state) cb(state.error || "Revoked in the authenticator.");
  return () => {
    revokedWatchers.delete(cb);
  };
}

/**
 * Forget the displayed result WITHOUT touching the session (unlike
 * `refresh()`, which mints a new code and would drop a live phone). The panel
 * renders a landed tx id ahead of everything else, so a new cycle — a fresh
 * scan or "Request again" — must clear it first.
 */
export function clearQrResult(): void {
  clearLastTxId();
}
