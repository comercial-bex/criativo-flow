import { memo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Tabela virtualizada para renderizar grandes datasets (1000+ rows)
 * Performance otimizada com scrolling eficiente
 */

export interface VirtualizedTableColumn<T> {
  header: string;
  width: number;
  render: (item: T, index: number) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface VirtualizedTableProps<T> {
  data: T[];
  columns: VirtualizedTableColumn<T>[];
  height: number;
  rowHeight?: number;
  headerHeight?: number;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
}

function VirtualizedTableComponent<T>({
  data,
  columns,
  height,
  rowHeight = 60,
  headerHeight = 48,
  className,
  emptyMessage = 'Nenhum dado encontrado',
  onRowClick,
}: VirtualizedTableProps<T>) {
  
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  const TableHeader = () => (
    <div 
      className="flex border-b border-border bg-muted/50 sticky top-0 z-10"
      style={{ height: headerHeight, width: totalWidth }}
    >
      {columns.map((col, idx) => (
        <div
          key={idx}
          className={cn(
            "flex items-center px-4 font-semibold text-sm text-muted-foreground",
            col.align === 'center' && 'justify-center',
            col.align === 'right' && 'justify-end',
            col.className
          )}
          style={{ width: col.width }}
        >
          {col.header}
        </div>
      ))}
    </div>
  );

  if (data.length === 0) {
    return (
      <div className={cn("border rounded-lg overflow-hidden", className)}>
        <TableHeader />
        <div 
          className="flex items-center justify-center text-muted-foreground"
          style={{ height: height - headerHeight }}
        >
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <TableHeader />
      <div 
        className="overflow-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-background"
        style={{ height: height - headerHeight }}
      >
        <div style={{ height: data.length * rowHeight }}>
          {data.map((item, index) => (
            <div
              key={index}
              style={{ height: rowHeight, width: totalWidth }}
              className={cn(
                "flex border-b border-border hover:bg-muted/50 transition-colors",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(item, index)}
            >
              {columns.map((col, colIdx) => (
                <div
                  key={colIdx}
                  className={cn(
                    "flex items-center px-4 text-sm",
                    col.align === 'center' && 'justify-center',
                    col.align === 'right' && 'justify-end',
                    col.className
                  )}
                  style={{ width: col.width }}
                >
                  {col.render(item, index)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const VirtualizedTable = memo(VirtualizedTableComponent) as typeof VirtualizedTableComponent;
