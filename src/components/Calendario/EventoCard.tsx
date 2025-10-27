import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface EventoCardProps {
  evento: any;
  variant?: 'compact' | 'default' | 'detailed';
  onClick?: () => void;
  onDragStart?: (evento: any) => void;
  onDragEnd?: () => void;
}

const tipoColors: Record<string, string> = {
  criacao_avulso: 'bg-blue-500',
  criacao_lote: 'bg-blue-600',
  edicao_curta: 'bg-purple-500',
  edicao_longa: 'bg-purple-600',
  captacao_interna: 'bg-orange-500',
  captacao_externa: 'bg-red-500',
  planejamento: 'bg-green-500',
  reuniao: 'bg-cyan-500',
  pausa_automatica: 'bg-gray-400',
  deslocamento: 'bg-yellow-500',
  preparacao: 'bg-amber-500',
  backup: 'bg-orange-600'
};

export const EventoCard = ({ 
  evento, 
  variant = 'default', 
  onClick, 
  onDragStart,
  onDragEnd 
}: EventoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isAutomatico = evento.is_automatico;
  const isExtra = evento.is_extra;
  
  const getDuration = () => {
    const diff = new Date(evento.data_fim).getTime() - new Date(evento.data_inicio).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (variant === 'compact') {
    return (
      <div
        draggable
        onDragStart={() => onDragStart?.(evento)}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative cursor-pointer"
      >
        <div
          className={cn(
            'rounded px-1.5 py-0.5 text-xs font-medium transition-all duration-300',
            tipoColors[evento.tipo] || 'bg-gray-500',
            'text-white truncate animate-in fade-in slide-in-from-top-1',
            isAutomatico && 'opacity-70 border-2 border-dashed border-white',
            isExtra && 'ring-2 ring-offset-1 ring-white',
            isHovered && 'scale-105 shadow-lg z-10',
          )}
        >
          {evento.titulo}
        </div>
        {isHovered && (
          <div className="absolute left-0 top-full z-50 mt-1 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
            <Card className="border-2 p-3 shadow-xl bg-card">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm leading-tight">{evento.titulo}</h4>
                  <div className={cn("h-3 w-3 rounded-full flex-shrink-0", tipoColors[evento.tipo] || 'bg-gray-500')} />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(evento.data_inicio), 'HH:mm')} - {format(new Date(evento.data_fim), 'HH:mm')}
                  </span>
                  <span className="text-[10px]">({getDuration()})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {evento.modo_criativo && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {evento.modo_criativo === 'lote' ? `📦 ${evento.quantidade_pecas || 12} peças` : '📄 Avulso'}
                    </Badge>
                  )}
                  {isExtra && <Badge variant="outline" className="text-[10px] h-5">Extra</Badge>}
                  {isAutomatico && <Badge variant="outline" className="text-[10px] h-5">Auto</Badge>}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        draggable
        onDragStart={() => onDragStart?.(evento)}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'cursor-pointer rounded-lg p-3 transition-all duration-300',
          tipoColors[evento.tipo] || 'bg-gray-500',
          'text-white animate-in fade-in slide-in-from-left-2',
          isAutomatico && 'opacity-70 border-2 border-dashed border-white',
          isExtra && 'ring-2 ring-offset-1 ring-white',
          isHovered && 'scale-[1.03] shadow-2xl ring-2 ring-white/50',
        )}
      >
        <div className="font-semibold">{evento.titulo}</div>
        <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
          <Clock className="h-3 w-3" />
          {format(new Date(evento.data_inicio), 'HH:mm')} - {format(new Date(evento.data_fim), 'HH:mm')}
        </div>
        {isHovered && (
          <div className="mt-2 flex flex-wrap gap-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
            {evento.modo_criativo && (
              <Badge variant="secondary" className="text-xs">
                {evento.modo_criativo === 'lote' ? `📦 ${evento.quantidade_pecas || 12} peças` : '📄 Avulso'}
              </Badge>
            )}
            {isExtra && <Badge variant="outline" className="text-xs">Extra</Badge>}
            {isAutomatico && <Badge variant="outline" className="text-xs">Auto</Badge>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(evento)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <div
        className={cn(
          'cursor-pointer rounded px-2 py-1 text-xs font-medium transition-all duration-300',
          tipoColors[evento.tipo] || 'bg-gray-500',
          'text-white animate-in fade-in slide-in-from-left-1',
          isAutomatico && 'opacity-70 border-2 border-dashed border-white',
          isExtra && 'ring-2 ring-offset-1 ring-white',
          isHovered && 'scale-105 shadow-lg z-10',
        )}
      >
        <div className="truncate">{evento.titulo}</div>
      </div>
      {isHovered && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
          <Card className="border-2 p-4 shadow-xl bg-card">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold leading-tight">{evento.titulo}</h4>
                <div className={cn("h-4 w-4 rounded-full flex-shrink-0", tipoColors[evento.tipo] || 'bg-gray-500')} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {format(new Date(evento.data_inicio), 'HH:mm')} - {format(new Date(evento.data_fim), 'HH:mm')}
                  </span>
                  <span className="text-[10px]">({getDuration()})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {evento.modo_criativo && (
                    <Badge variant="secondary" className="text-xs">
                      {evento.modo_criativo === 'lote' ? `📦 ${evento.quantidade_pecas || 12} peças` : '📄 Avulso'}
                    </Badge>
                  )}
                  {isExtra && <Badge variant="outline" className="text-xs">Extra</Badge>}
                  {isAutomatico && <Badge variant="outline" className="text-xs">Auto</Badge>}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};