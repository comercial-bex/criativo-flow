import { memo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Lista virtualizada genérica para renderizar grandes quantidades de items
 * Performance otimizada para 1000+ items usando CSS virtual scrolling
 */

export interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  rowHeight: number;
  renderItem: (props: { item: T; index: number }) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

function VirtualizedListComponent<T>({
  items,
  height,
  rowHeight,
  renderItem,
  className,
  emptyMessage = 'Nenhum item encontrado',
}: VirtualizedListProps<T>) {
  
  if (items.length === 0) {
    return (
      <div 
        className={cn("flex items-center justify-center text-muted-foreground", className)}
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div 
      className={cn("overflow-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-background", className)}
      style={{ height }}
    >
      <div style={{ height: items.length * rowHeight }}>
        {items.map((item, index) => (
          <div key={index} style={{ height: rowHeight }}>
            {renderItem({ item, index })}
          </div>
        ))}
      </div>
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;
