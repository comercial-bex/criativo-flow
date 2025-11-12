import { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

/**
 * Tabela virtualizada para renderizar grandes datasets (1000+ rows)
 * Performance otimizada com virtual scrolling
 * 
 * @example
 * ```tsx
 * <VirtualizedTable
 *   data={tarefas}
 *   columns={[
 *     { header: 'Título', width: 300, render: (item) => item.titulo },
 *     { header: 'Status', width: 120, render: (item) => <Badge>{item.status}</Badge> },
 *   ]}
 *   height={600}
 *   rowHeight={60}
 * />
 * ```
 */

export interface VirtualizedTableColumn<T> {
  /** Título da coluna */
  header: string;
  
  /** Largura da coluna em pixels */
  width: number;
  
  /** Função para renderizar o conteúdo da célula */
  render: (item: T, index: number) => React.ReactNode;
  
  /** Classe CSS adicional para a coluna */
  className?: string;
  
  /** Alinhamento do texto */
  align?: 'left' | 'center' | 'right';
}

export interface VirtualizedTableProps<T> {
  /** Array de dados */
  data: T[];
  
  /** Definição das colunas */
  columns: VirtualizedTableColumn<T>[];
  
  /** Altura total da tabela */
  height: number;
  
  /** Altura de cada row */
  rowHeight?: number;
  
  /** Altura do header */
  headerHeight?: number;
  
  /** Classe CSS adicional */
  className?: string;
  
  /** Mensagem quando vazio */
  emptyMessage?: string;
  
  /** Callback ao clicar em uma row */
  onRowClick?: (item: T, index: number) => void;
  
  /** Key extractor */
  rowKey?: (item: T, index: number) => string | number;
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
  rowKey,
}: VirtualizedTableProps<T>) {
  
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  // Header da tabela
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

  // Renderiza cada row
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    if (!item) return null;

    return (
      <div
        style={{ ...style, width: totalWidth }}
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
    );
  };

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
      <List
        height={height - headerHeight}
        width={totalWidth}
        itemCount={data.length}
        itemSize={rowHeight}
        overscanCount={5}
        className="scrollbar-thin scrollbar-thumb-border scrollbar-track-background"
        itemKey={rowKey ? (index) => rowKey(data[index], index) : undefined}
      >
        {Row}
      </List>
    </div>
  );
}

export const VirtualizedTable = memo(VirtualizedTableComponent) as typeof VirtualizedTableComponent;
