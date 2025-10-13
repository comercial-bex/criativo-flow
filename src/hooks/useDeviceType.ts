import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

export function useDeviceType(): DeviceType {
  const getInitialDeviceType = (): DeviceType => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    
    // iOS sempre usa layout mobile/tablet (mesmo em iPads grandes)
    if (isIOS || isTouchDevice) {
      return width < BREAKPOINTS.mobile ? 'mobile' : 'tablet';
    }
    
    // Desktop tradicional
    if (width < BREAKPOINTS.mobile) return 'mobile';
    if (width < BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  };

  const [deviceType, setDeviceType] = useState<DeviceType>(getInitialDeviceType);

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      
      if (isIOS || isTouchDevice) {
        setDeviceType(width < BREAKPOINTS.mobile ? 'mobile' : 'tablet');
      } else {
        if (width < BREAKPOINTS.mobile) {
          setDeviceType('mobile');
        } else if (width < BREAKPOINTS.tablet) {
          setDeviceType('tablet');
        } else {
          setDeviceType('desktop');
        }
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    window.addEventListener('orientationchange', updateDeviceType);
    
    return () => {
      window.removeEventListener('resize', updateDeviceType);
      window.removeEventListener('orientationchange', updateDeviceType);
    };
  }, []);

  return deviceType;
}

export function useIsMobile(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'mobile';
}

export function useIsTablet(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'tablet';
}

export function useIsDesktop(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'desktop';
}