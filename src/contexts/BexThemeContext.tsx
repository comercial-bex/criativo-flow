import { createContext, useContext, ReactNode } from 'react';
import { bexTheme } from '@/styles/bex-theme';

interface BexThemeContextType {
  theme: typeof bexTheme;
  applyGamingStyle: (componentType: 'dialog' | 'card' | 'button') => string;
}

const BexThemeContext = createContext<BexThemeContextType | undefined>(undefined);

export const BexThemeProvider = ({ children }: { children: ReactNode }) => {
  const applyGamingStyle = (componentType: 'dialog' | 'card' | 'button') => {
    const styles = {
      dialog: 'backdrop-blur-md bg-black/40 border border-bex/20',
      card: 'bg-card border-bex/30 shadow-lg shadow-bex/20',
      button: 'bg-bex hover:bg-bex-dark text-white shadow-bex-glow'
    };
    return styles[componentType];
  };

  return (
    <BexThemeContext.Provider value={{ theme: bexTheme, applyGamingStyle }}>
      {children}
    </BexThemeContext.Provider>
  );
};

export const useBexTheme = () => {
  const context = useContext(BexThemeContext);
  if (!context) throw new Error('useBexTheme must be used within BexThemeProvider');
  return context;
};
