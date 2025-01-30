import { useState, useEffect } from "react";

interface DeviceInfo {
  isLarge: boolean;
  is2Large: boolean;
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isBetween920AndMobile: boolean;
}

export const useDeviceInfo = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    is2Large: typeof window !== "undefined" && window.innerWidth >= 1200,
    isLarge: typeof window !== "undefined" && window.innerWidth >= 1180,
    isDesktop: typeof window !== "undefined" && window.innerWidth >= 1024,
    isTablet:
      typeof window !== "undefined" &&
      window.innerWidth >= 768 &&
      window.innerWidth < 1024,
    isMobile: typeof window !== "undefined" && window.innerWidth < 768,
    isBetween920AndMobile:
      typeof window !== "undefined" && window.innerWidth < 920,
  });

  useEffect(() => {
    const handleResize = () => {
      const is2Large = window.innerWidth >= 1200;
      const isLarge = window.innerWidth >= 1180;
      const isDesktop = window.innerWidth >= 1024;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const isBetween920AndMobile = window.innerWidth < 920;
      const isMobile = window.innerWidth < 768;

      setDeviceInfo({
        is2Large,
        isLarge,
        isDesktop,
        isTablet,
        isMobile,
        isBetween920AndMobile,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return deviceInfo;
};
