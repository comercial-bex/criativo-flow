export const bexTheme = {
  gradients: {
    primary: 'from-bex via-bex-light to-bex-dark',
    card: 'from-bex/20 to-bex-dark/10',
    cardHover: 'from-bex/30 to-bex-dark/20',
    accent: 'from-bex to-bex-light',
    gaming: 'from-bex/30 via-bex-light/20 to-black/50',
    overlay: 'from-black/50 via-black/30 to-transparent',
  },
  colors: {
    primary: '#54C43D',
    primaryLight: '#6dd34f',
    primaryDark: '#47a834',
    accent: '#54C43D',
    accentLight: '#6dd34f',
    success: '#54C43D',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  borders: {
    primary: 'border-bex/30',
    accent: 'border-bex-light/30',
    muted: 'border-bex/20',
    gaming: 'border-bex/10',
    subtle: 'border-white/10',
  },
  shadows: {
    green: 'shadow-lg shadow-bex/20',
    greenGlow: 'shadow-xl shadow-bex/40',
    gaming: 'shadow-2xl shadow-bex/30',
    glow: 'shadow-[0_0_30px_rgba(84,196,61,0.4)]',
  },
  animations: {
    fadeIn: 'animate-fade-in',
    scaleIn: 'animate-scale-in',
    slideIn: 'animate-slide-in-right',
    pulseGlow: 'animate-pulse-glow',
  },
  glassEffect: {
    light: 'backdrop-blur-sm bg-white/5 border border-white/10',
    medium: 'backdrop-blur-md bg-black/30 border border-bex/20',
    dark: 'backdrop-blur-lg bg-black/50 border border-bex/30',
    gaming: 'backdrop-blur-md bg-black/40 border border-bex/20',
  },
  hover: {
    lift: 'transition-all duration-200 hover:-translate-y-1 hover:shadow-bex-lg',
    glow: 'transition-all duration-300 hover:shadow-bex-glow',
    scale: 'transition-transform duration-200 hover:scale-105',
  }
};

// BEX Gaming V3 - Dark Clean Theme
export const bexThemeV3 = {
  colors: {
    // Base
    bg: '#0F1320',
    surface: '#151A2B',
    surfaceHover: '#1A2035',
    
    // Primary (Cyan Neon)
    primary: '#00D1FF',
    primaryHover: '#00B8E6',
    primaryGlow: 'rgba(0, 209, 255, 0.3)',
    
    // Accent (Lime Neon)
    accent: '#C3F012',
    accentHover: '#AAD60F',
    accentGlow: 'rgba(195, 240, 18, 0.3)',
    
    // Text
    text: '#E8ECF3',
    textMuted: '#9BA3B4',
    textDark: '#6B7280',
    
    // Semantic
    success: '#00D38D',
    warning: '#FFC857',
    danger: '#FF5C5C',
    info: '#00D1FF',
    
    // Charts
    chart1: '#00D1FF',
    chart2: '#C3F012',
    chart3: '#FF5C5C',
    chart4: '#FFC857',
    chart5: '#00D38D',
  },
  
  typography: {
    heading: '"Poppins", system-ui, sans-serif',
    body: '"Montserrat", system-ui, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  radius: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
    md: '0 4px 16px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.2)',
    glow: '0 0 20px var(--glow-color, rgba(0, 209, 255, 0.3))',
    glowLg: '0 0 40px var(--glow-color, rgba(0, 209, 255, 0.4))',
  },
  
  animation: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};
