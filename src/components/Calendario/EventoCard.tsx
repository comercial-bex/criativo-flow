import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EventoCardProps {
  evento: any;
  compact?: boolean;
  onClick?: () => void;
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

export const EventoCard = ({ evento, compact = false, onClick }: EventoCardProps) => {
  const isAutomatico = evento.is_automatico;
  const isExtra = evento.is_extra;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded p-2 text-xs text-white mb-1 cursor-pointer transition-all hover:shadow-md',
        tipoColors[evento.tipo] || 'bg-gray-500',
        isAutomatico && 'opacity-70 border-2 border-dashed border-white',
        isExtra && 'ring-2 ring-offset-1 ring-white',
        compact && 'p-1'
      )}
    >
      <div className="font-medium truncate">{evento.titulo}</div>
      {!compact && (
        <>
          <div className="text-xs opacity-90">
            {format(new Date(evento.data_inicio), 'HH:mm')} - {format(new Date(evento.data_fim), 'HH:mm')}
          </div>
          {evento.modo_criativo && (
            <Badge variant="secondary" className="text-xs mt-1">
              {evento.modo_criativo === 'lote' ? `📦 ${evento.quantidade_pecas || 12} peças` : '📄 Avulso'}
            </Badge>
          )}
          {isExtra && <Badge variant="outline" className="text-xs bg-white/20 text-white border-white">Extra</Badge>}
          {isAutomatico && <Badge variant="outline" className="text-xs bg-white/20 text-white border-white">Auto</Badge>}
        </>
      )}
    </div>
  );
};