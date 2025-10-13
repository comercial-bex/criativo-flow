import { Plus } from 'lucide-react';
import { BexButton } from './ui/bex-button';
import { cn } from '@/lib/utils';

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  icon = <Plus className="h-6 w-6" />, 
  label,
  className 
}: FABProps) {
  return (
    <BexButton
      variant="bexGaming"
      size="lg"
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-40 h-16 w-16 rounded-full shadow-2xl",
        "animate-pulse-glow hover:scale-110 transition-transform duration-300",
        "md:bottom-8 md:right-8",
        className
      )}
      aria-label={label || "Ação rápida"}
    >
      {icon}
    </BexButton>
  );
}
