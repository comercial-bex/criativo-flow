import { Clock, AlertCircle, CheckCircle, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TarefaCalendario } from '../types';
import { getPrioridadeColor, getStatusColor, getTarefaData } from '../utils/taskHelpers';
import { isOverdue, isUrgent } from '../utils/dateHelpers';

interface TarefaCardProps {
  tarefa: TarefaCalendario;
  onClick?: () => void;
  compact?: boolean;
}

export const TarefaCard = ({ tarefa, onClick, compact = false }: TarefaCardProps) => {
  const data = getTarefaData(tarefa);
  const overdue = isOverdue(data || undefined);
  const urgent = isUrgent(data || undefined);
  const completed = tarefa.status?.toLowerCase() === 'concluída' || tarefa.status?.toLowerCase() === 'concluida';

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 rounded border cursor-pointer transition-all hover:shadow-md hover:scale-105",
        getPrioridadeColor(tarefa.prioridade),
        "text-white relative",
        compact && "p-1 text-xs"
      )}
    >
      {/* Indicadores visuais */}
      <div className="absolute -top-1 -right-1 flex gap-1">
        {overdue && !completed && (
          <div className="h-3 w-3 bg-red-600 rounded-full border-2 border-white" />
        )}
        {urgent && !overdue && !completed && (
          <Clock className="h-3 w-3 text-yellow-300" />
        )}
        {completed && (
          <CheckCircle className="h-3 w-3 text-green-300" />
        )}
        {tarefa.anexos_count && tarefa.anexos_count > 0 && (
          <Paperclip className="h-3 w-3 text-white" />
        )}
      </div>

      <div className="font-medium truncate pr-6">{tarefa.titulo}</div>
      
      {!compact && (
        <div className="text-xs opacity-90 mt-1 space-y-1">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs bg-white/20 text-white">
              {tarefa.prioridade}
            </Badge>
            <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/30">
              {tarefa.status}
            </Badge>
          </div>
          {tarefa.executor_nome && (
            <div className="truncate">👤 {tarefa.executor_nome}</div>
          )}
        </div>
      )}
    </div>
  );
};
