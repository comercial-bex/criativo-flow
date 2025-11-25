import { Badge } from "@/components/ui/badge";
import { useThemeManager } from "@/contexts/ThemeManagerContext";
import { cn } from "@/lib/utils";

interface AdaptiveBadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'pending';
  children: React.ReactNode;
  className?: string;
}

export function AdaptiveBadge({ variant, children, className }: AdaptiveBadgeProps) {
  const { theme } = useThemeManager();
  
  const variantClasses = {
    light: {
      success: 'bg-green-800 text-white border-green-900',
      warning: 'bg-yellow-700 text-white border-yellow-800',
      error: 'bg-red-700 text-white border-red-800',
      info: 'bg-blue-700 text-white border-blue-800',
      pending: 'bg-amber-700 text-white border-amber-800',
    },
    dark: {
      success: 'bg-green-600/20 text-green-400 border-green-500/50',
      warning: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/50',
      error: 'bg-red-600/20 text-red-400 border-red-500/50',
      info: 'bg-blue-600/20 text-blue-400 border-blue-500/50',
      pending: 'bg-amber-600/20 text-amber-400 border-amber-500/50',
    },
    'bex-gamer': {
      success: 'bg-green-500/10 text-green-400 border-green-500/60 shadow-[0_0_10px_rgba(34,197,94,0.3)]',
      warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/60 shadow-[0_0_10px_rgba(234,179,8,0.3)]',
      error: 'bg-red-500/10 text-red-400 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
      info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    },
  };
  
  return (
    <Badge 
      className={cn(
        'border font-semibold',
        variantClasses[theme][variant],
        className
      )}
    >
      {children}
    </Badge>
  );
}
