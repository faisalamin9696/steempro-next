import { useState, useEffect } from 'react';

function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const mobileWidth = 768; // You can adjust this value according to your needs
      setIsMobile(window.innerWidth < mobileWidth);
    };

    handleResize(); // Initial check

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default useMobile;