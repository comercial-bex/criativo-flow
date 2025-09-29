import { useState, useEffect } from 'react';

export type DeviceType = 'mobile-small' | 'mobile' | 'tablet' | 'tablet-large' | 'desktop' | 'desktop-large';

const BREAKPOINTS = {
  'mobile-small': 360,
  mobile: 414,
  tablet: 768,
  'tablet-large': 1024,
  desktop: 1366,
  'desktop-large': 1920,
} as const;

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      
      if (width < BREAKPOINTS['mobile-small']) {
        setDeviceType('mobile-small');
      } else if (width < BREAKPOINTS.mobile) {
        setDeviceType('mobile');
      } else if (width < BREAKPOINTS.tablet) {
        setDeviceType('tablet');
      } else if (width < BREAKPOINTS['tablet-large']) {
        setDeviceType('tablet-large');
      } else if (width < BREAKPOINTS.desktop) {
        setDeviceType('desktop');
      } else {
        setDeviceType('desktop-large');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
}

export function useIsMobile(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'mobile-small' || deviceType === 'mobile';
}

export function useIsTablet(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'tablet' || deviceType === 'tablet-large';
}

export function useIsDesktop(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'desktop' || deviceType === 'desktop-large';
}

export function useIsMobileSmall(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'mobile-small';
}

export function useIsTabletLarge(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'tablet-large';
}

export function useIsDesktopLarge(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'desktop-large';
}