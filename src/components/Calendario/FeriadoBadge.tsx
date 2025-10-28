import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeriadoBadgeProps {
  nome: string;
  tipo?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FeriadoBadge = ({ nome, tipo = 'nacional', className, size = 'md' }: FeriadoBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const getTipoColor = () => {
    switch (tipo) {
      case 'nacional':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'facultativo':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      case 'estadual':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'municipal':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium flex items-center gap-1.5 border-2',
        getTipoColor(),
        sizeClasses[size],
        className
      )}
    >
      <Calendar className="h-3 w-3" />
      <span>{nome}</span>
    </Badge>
  );
};
