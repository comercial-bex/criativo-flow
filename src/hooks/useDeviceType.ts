import { useState, useEffect } from 'react';

export type DeviceType = 'mobile-small' | 'mobile' | 'tablet' | 'tablet-lg' | 'desktop' | 'desktop-lg';

const BREAKPOINTS = {
  'mobile-small': 360,
  mobile: 414,
  tablet: 768,
  'tablet-lg': 1024,
  desktop: 1366,
  'desktop-lg': 1920,
} as const;

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      
      // DEBUG: Log para verificar detecção
      console.log('🔍 Device Detection:', { 
        width, 
        breakpoints: BREAKPOINTS,
        detected: width >= BREAKPOINTS['desktop-lg'] ? 'desktop-lg' :
                 width >= BREAKPOINTS.desktop ? 'desktop' :
                 width >= BREAKPOINTS['tablet-lg'] ? 'tablet-lg' :
                 width >= BREAKPOINTS.tablet ? 'tablet' :
                 width >= BREAKPOINTS.mobile ? 'mobile' : 'mobile-small'
      });
      
      // Lógica corrigida: verificar de maior para menor
      if (width >= BREAKPOINTS['desktop-lg']) {
        setDeviceType('desktop-lg');
      } else if (width >= BREAKPOINTS.desktop) {
        setDeviceType('desktop');
      } else if (width >= BREAKPOINTS['tablet-lg']) {
        setDeviceType('tablet-lg');
      } else if (width >= BREAKPOINTS.tablet) {
        setDeviceType('tablet');
      } else if (width >= BREAKPOINTS.mobile) {
        setDeviceType('mobile');
      } else {
        setDeviceType('mobile-small');
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
  return deviceType === 'tablet' || deviceType === 'tablet-lg';
}

export function useIsDesktop(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'desktop' || deviceType === 'desktop-lg';
}

export function useIsMobileSmall(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'mobile-small';
}

export function useIsTabletLarge(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'tablet-lg';
}

export function useIsDesktopLarge(): boolean {
  const deviceType = useDeviceType();
  return deviceType === 'desktop-lg';
}