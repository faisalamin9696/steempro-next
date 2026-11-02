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
 * `useSteemAuth()` disposes its session on unmount. That is right for a
 * component-scoped use and wrong for this one: the phone keeps a single
 * pending request in memory and may answer it long after the user walked away from the approval screen — dismissing the
 * panel, re-rendering a parent or navigating must not close the session
 * underneath them, because there is no queue behind it. A closed session
 * means the approval is simply lost and the user has to scan again.
 *
 * So the controller lives here, module-scoped and shared: mounted once, never
 * disposed by a component going away. It is replaced only by an explicit
 * `refresh()` (a new code) or by the code's own expiry — never by React.
 *
 * `dispose()` and `start()` are deliberately no-ops on the returned object so
 * call sites that used `useSteemAuth` keep compiling without acquiring a way
 * to tear the shared session down by accident.
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

function getShared(options: KeepAliveOptions): SteemAuthController {
  if (shared) {
    console.debug("[steemauth] keep-alive: reusing shared controller");
    return shared;
  }
  console.info("[steemauth] keep-alive: creating shared controller");

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

  // The bridge is installed WITH the session it serves, not by any panel.
  //
  // It used to live in QrApprovalPanel's effect, whose cleanup called
  // `setQrBroadcastHandler(null)` — but there are two panels (the always-on
  // standby and the modal's own) sharing ONE module-level slot. Whichever
  // panel unmounted last left nothing installed, so every later action found
  // no bridge, no key and no way to reach the phone: the Approvals tab simply
  // stayed empty. Owning it here makes the handler's lifetime match the
  // session's, which is what it was always supposed to track.
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
 * Explicitly END the live shared session — the "Phone connected ✕" control.
 *
 * While a session is live no QR ever pops up (actions pass straight through),
 * so without this the only way back to a scan was waiting out the QR's TTL.
 * The cancel frame is what the phone needs to hear: it treats ANY cancel as
 * "the session is over" (drops its watch card and persisted copy), and
 * refresh() then mints a fresh session so the next action waits for a new
 * scan again.
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
 * Forget the last displayed result WITHOUT touching the session — unlike
 * `refresh()`, which also mints a new code (and would drop a live phone).
 *
 * The panel renders a landed tx id ahead of every other state, so a stale
 * one has to be cleared whenever a NEW approval cycle starts ("Request
 * again", or a fresh scan request) — otherwise the previous success hides
 * the QR the user needs, and its only button cancels the action they came
 * for.
 */
export function clearQrResult(): void {
  clearLastTxId();
}
