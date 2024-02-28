import useMobileDetect from 'use-mobile-detect-hook';


export const useMobile = (): boolean => {
  const detectMobile = useMobileDetect();

  return detectMobile.isMobile();
};
