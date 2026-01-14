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

export const useDeviceInfo = (customBreakpoints = defaultBreakpoints) => {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  React.useEffect(() => {
    const handleResize = () => setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
