"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "steempro:sidebar-collapsed";

// Hydration-safe collapsed state. The server cannot read localStorage, so the
// server snapshot is always "expanded" and React uses that same value for the
// hydration render — the server and client trees always match, so hydration
// never throws. The stored preference is applied on the first client render
// after hydration (same approach as hooks/redux/useDeviceInfo.tsx).
const subscribeSidebar = (onStoreChange: () => void) => {
  // Keeps multiple tabs in sync.
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
};

const getSidebarCollapsed = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Storage blocked (private mode / disabled cookies) — always expanded.
    return false;
  }
};

const getSidebarCollapsedOnServer = () => false;

export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarCollapsed,
    getSidebarCollapsedOnServer,
  );

  const setCollapsed = useCallback((next: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // Persisting failed, but the UI should still respond — fall through to
      // the notify below so this tab at least updates.
    }
    // useSyncExternalStore only re-reads when its subscribe callback fires, and
    // browsers never dispatch a `storage` event to the tab that made the
    // change — so notify our own subscribers explicitly.
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!getSidebarCollapsed());
  }, [setCollapsed]);

  return { collapsed, toggle, setCollapsed };
}
