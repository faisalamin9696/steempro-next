import { useState, useEffect } from 'react';

interface DeviceInfo {
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
}

export const useDeviceInfo = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isDesktop: typeof window !== "undefined" && window.innerWidth >= 1024,
    isTablet:
      typeof window !== "undefined" &&
      window.innerWidth >= 768 &&
      window.innerWidth < 1024,
    isMobile: typeof window !== "undefined" && window.innerWidth < 768,
  });

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const isMobile = window.innerWidth < 768;

      setDeviceInfo({
        isDesktop,
        isTablet,
        isMobile,
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
