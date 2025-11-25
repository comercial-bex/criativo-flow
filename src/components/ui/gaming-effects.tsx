import { useThemeManager } from "@/contexts/ThemeManagerContext";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GamingEffectsProps {
  children: ReactNode;
  className?: string;
  effect?: 'glow' | 'blur' | 'both';
}

export function GamingEffects({ children, className, effect = 'both' }: GamingEffectsProps) {
  const { theme } = useThemeManager();
  const isGaming = theme === 'bex-gamer';

  return (
    <div
      className={cn(
        className,
        isGaming && effect === 'glow' && 'shadow-bex-glow',
        isGaming && effect === 'blur' && 'backdrop-blur-md',
        isGaming && effect === 'both' && 'backdrop-blur-md shadow-bex-glow'
      )}
    >
      {children}
    </div>
  );
}
