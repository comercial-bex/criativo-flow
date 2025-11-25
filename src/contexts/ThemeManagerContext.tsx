import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'bex-gamer';

interface ThemeManagerContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeManagerContext = createContext<ThemeManagerContextType | undefined>(undefined);

export const ThemeManagerProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('bex-theme-mode');
    return (stored as ThemeMode) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remover classes antigas
    root.classList.remove('light', 'dark', 'bex-gamer');
    
    // Adicionar nova classe
    root.classList.add(theme);
    
    // Salvar preferência
    localStorage.setItem('bex-theme-mode', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'bex-gamer';
      return 'light';
    });
  };

  return (
    <ThemeManagerContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeManagerContext.Provider>
  );
};

export const useThemeManager = () => {
  const context = useContext(ThemeManagerContext);
  if (!context) throw new Error('useThemeManager must be used within ThemeManagerProvider');
  return context;
};
