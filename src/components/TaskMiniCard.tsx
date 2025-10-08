// BEX 3.0 - Card Compacto de Tarefa para Kanban
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, AlertTriangle, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTaskTimer } from '@/hooks/useTaskTimer';
import { Tarefa } from '@/types/tarefa';
import { cn } from '@/lib/utils';
import { getPrioridadeConfig, getStatusPrazoClasses } from '@/utils/tarefaUtils';

interface TaskMiniCardProps {
  task: Tarefa;
  onClick?: () => void;
  profiles?: any[];
}

export function TaskMiniCard({ task, onClick, profiles = [] }: TaskMiniCardProps) {
  const { timeRemaining, status: statusPrazo, formattedTime, isUrgent } = useTaskTimer(task.prazo_executor);
  const responsavel = profiles.find(p => p.id === task.executor_id || p.id === task.responsavel_id);
  const prioridadeConfig = getPrioridadeConfig(task.prioridade);
  const prazoClasses = getStatusPrazoClasses(statusPrazo);

  const getTipoIcon = (tipo?: string) => {
    const icons: Record<string, string> = {
      roteiro_reels: '🎬',
      criativo_card: '🎨',
      criativo_carrossel: '📸',
      planejamento_estrategico: '📊',
      datas_comemorativas: '🎉',
      trafego_pago: '💰',
      contrato: '📄'
    };
    return icons[tipo || ''] || '📋';
  };

  const isAtrasada = statusPrazo === 'vermelho';

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative bg-card rounded-lg border shadow-sm cursor-pointer",
        "hover:shadow-md hover:scale-[1.02] hover:border-primary/30",
        "transition-all duration-200 group",
        isAtrasada && "ring-2 ring-destructive/50"
      )}
    >
      {/* Barra de prioridade */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 rounded-t-lg", prioridadeConfig.color)} />
      
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{getTipoIcon(task.tipo)}</span>
            <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
              {task.titulo}
            </h4>
          </div>
          {isAtrasada && (
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          )}
        </div>

        {/* SLA Cronômetro */}
        {task.prazo_executor && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md w-fit",
            prazoClasses.bg,
            prazoClasses.text
          )}>
            <Clock className="h-3 w-3" />
            <span className="font-semibold">{formattedTime}</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={cn("text-xs px-1.5 py-0", prioridadeConfig.badge)}>
            {task.prioridade}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t">
          {task.data_entrega_prevista && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.data_entrega_prevista), 'dd/MM', { locale: ptBR })}</span>
            </div>
          )}
          
          {responsavel && (
            <Avatar className="h-5 w-5">
              <AvatarImage src={responsavel.avatar_url} />
              <AvatarFallback className="text-[10px]">
                {responsavel.nome?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}
