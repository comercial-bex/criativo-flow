import { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

/**
 * Lista virtualizada genérica para renderizar grandes quantidades de items
 * Performance otimizada para 1000+ items
 * 
 * @example
 * ```tsx
 * <VirtualizedList
 *   items={clientes}
 *   height={600}
 *   rowHeight={72}
 *   renderItem={({ item, index, style }) => (
 *     <div style={style} className="px-4">
 *       <ClienteCard cliente={item} />
 *     </div>
 *   )}
 * />
 * ```
 */

export interface VirtualizedListProps<T> {
  /** Array de items para renderizar */
  items: T[];
  
  /** Altura total da lista em pixels */
  height: number;
  
  /** Altura de cada row em pixels */
  rowHeight: number;
  
  /** Largura da lista (default: 100%) */
  width?: number | string;
  
  /** Função para renderizar cada item */
  renderItem: (props: {
    item: T;
    index: number;
    style: React.CSSProperties;
  }) => React.ReactNode;
  
  /** Número de items extras para renderizar fora da viewport */
  overscanCount?: number;
  
  /** Classe CSS adicional */
  className?: string;
  
  /** Mensagem quando a lista está vazia */
  emptyMessage?: string;
  
  /** Key extractor para cada item (default: usa index) */
  itemKey?: (index: number, item: T) => string | number;
}

function VirtualizedListComponent<T>({
  items,
  height,
  rowHeight,
  width = '100%',
  renderItem,
  overscanCount = 5,
  className,
  emptyMessage = 'Nenhum item encontrado',
  itemKey,
}: VirtualizedListProps<T>) {
  
  // Se não há items, mostra mensagem vazia
  if (items.length === 0) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  // Row renderer para react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    if (!item) return null;
    
    return <>{renderItem({ item, index, style })}</>;
  };

  return (
    <List
      height={height}
      width={width}
      itemCount={items.length}
      itemSize={rowHeight}
      overscanCount={overscanCount}
      className={cn("scrollbar-thin scrollbar-thumb-border scrollbar-track-background", className)}
      itemKey={itemKey}
    >
      {Row}
    </List>
  );
}

export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;
