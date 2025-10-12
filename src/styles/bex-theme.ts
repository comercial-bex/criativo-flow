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
