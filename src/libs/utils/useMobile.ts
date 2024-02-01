import { useState, useEffect, useMemo } from 'react';

export const useMobile = (): boolean => {
  const [windowWidth, setWindowWidth] = useState<number>(720);

  useEffect(() => {
    const handleResize = (): void => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures that the effect runs only once on mount

  const _isMobile = useMemo(() => windowWidth < 570, [windowWidth]);

  return _isMobile;
};
