import React from "react";

const defaultBreakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type Breakpoint = keyof typeof defaultBreakpoints;
type BreakpointValue = (typeof defaultBreakpoints)[Breakpoint];

// Hydration-safe window size: the server can't know the viewport, so the
// server snapshot is 0x0 and React uses it for the hydration render too —
// client and server trees always match. After hydration (and on plain
// client-side mounts) the real size is read. Reading window.innerWidth during
// render made any isMobile/width branch render different markup on the client
// than the server did, which threw React #418 "Hydration failed" and made
// React throw away the whole server-rendered subtree.
const subscribeWindowResize = (onStoreChange: () => void) => {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
};
const getWindowWidth = () => window.innerWidth;
const getWindowHeight = () => window.innerHeight;
const getWindowSizeOnServer = () => 0;

export const useDeviceInfo = (customBreakpoints = defaultBreakpoints) => {
  const width = React.useSyncExternalStore(
    subscribeWindowResize,
    getWindowWidth,
    getWindowSizeOnServer,
  );
  const height = React.useSyncExternalStore(
    subscribeWindowResize,
    getWindowHeight,
    getWindowSizeOnServer,
  );
  const windowSize = React.useMemo(() => ({ width, height }), [width, height]);

  const breakpoints = React.useMemo(() => {
    return Object.entries(customBreakpoints).sort(([, a], [, b]) => a - b) as [Breakpoint, number][];
  }, [customBreakpoints]);

  const currentBreakpoint = React.useMemo(() => {
    return breakpoints.reduce((current, [key, value]) => {
      return windowSize.width >= value ? key : current;
    }, breakpoints[0][0]);
  }, [windowSize.width, breakpoints]);

  // ✅ Dynamic calculations instead of static memo
  const isMobile = windowSize.width < customBreakpoints.md;
  const isTablet = windowSize.width >= customBreakpoints.md && windowSize.width < customBreakpoints.xl;
  const isDesktop = windowSize.width >= customBreakpoints.lg;
  const isLargeScreen = windowSize.width >= customBreakpoints.xl;

  const useGreater = (bp: Breakpoint) => windowSize.width > customBreakpoints[bp];
  const useGreaterOrEqual = (bp: Breakpoint) => windowSize.width >= customBreakpoints[bp];
  const useSmaller = (bp: Breakpoint) => windowSize.width < customBreakpoints[bp];
  const useSmallerOrEqual = (bp: Breakpoint) => windowSize.width <= customBreakpoints[bp];
  const useBetween = (min: Breakpoint, max: Breakpoint) =>
    windowSize.width >= customBreakpoints[min] && windowSize.width < customBreakpoints[max];
  const useBreakpoint = (bp: Breakpoint) => currentBreakpoint === bp;

  return {
    width: windowSize.width,
    height: windowSize.height,
    breakpoint: currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    useGreater,
    useGreaterOrEqual,
    useSmaller,
    useSmallerOrEqual,
    useBetween,
    useBreakpoint,
  };
};
