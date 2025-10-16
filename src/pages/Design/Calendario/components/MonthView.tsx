import { isSameDay, format } from "date-fns";
import { TarefaCalendario, EventoCalendario, DayData } from '../types';
import { TarefaCard } from './TarefaCard';
import { EventoCard } from '@/components/Calendario/EventoCard';
import { getDaysInMonth, getEmptyDaysForMonth } from '../utils/dateHelpers';
import { getTarefaData } from '../utils/taskHelpers';

interface MonthViewProps {
  currentDate: Date;
  tarefas: TarefaCalendario[];
  eventos: EventoCalendario[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onTarefaClick: (tarefa: TarefaCalendario) => void;
  onEventoClick: (evento: EventoCalendario) => void;
  filtroDesigner: string;
}

export const MonthView = ({
  currentDate,
  tarefas,
  eventos,
  selectedDate,
  onDateSelect,
  onTarefaClick,
  onEventoClick,
  filtroDesigner
}: MonthViewProps) => {
  const dias = getDaysInMonth(currentDate);
  const diasVazios = getEmptyDaysForMonth(currentDate);

  const getDayData = (dia: Date): DayData => {
    const tarefasDoDia = tarefas.filter(tarefa => {
      const data = getTarefaData(tarefa);
      return data && 
        isSameDay(new Date(data), dia) &&
        (filtroDesigner === 'all' || tarefa.executor_id === filtroDesigner);
    });
    
    const eventosDoDia = eventos.filter(evento => 
      isSameDay(new Date(evento.data_inicio), dia) &&
      (filtroDesigner === 'all' || evento.responsavel_id === filtroDesigner)
    );

    return {
      data: dia,
      tarefas: tarefasDoDia,
      eventos: eventosDoDia
    };
  };

  const allDays = [...diasVazios, ...dias];

  return (
    <div className="space-y-4">
      {/* Cabeçalhos dos dias da semana */}
      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
          <div key={dia} className="text-center font-semibold text-sm py-2">
            {dia}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-2">
        {allDays.map((dia, index) => {
          // Célula vazia
          if (!dia) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[100px] p-2 border rounded-lg bg-muted/20 border-dashed opacity-40"
              />
            );
          }

          const { tarefas: tarefasDoDia, eventos: eventosDoDia } = getDayData(dia);
          const isSelected = selectedDate && isSameDay(dia, selectedDate);
          const isToday = isSameDay(dia, new Date());
          const hasItems = tarefasDoDia.length > 0 || eventosDoDia.length > 0;

          return (
            <div
              key={dia.toISOString()}
              className={`
                min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all
                ${isSelected ? 'bg-primary/10 border-primary ring-2 ring-primary/30' : 'bg-background border-border hover:bg-muted/50'}
                ${isToday ? 'ring-2 ring-bex/50' : ''}
                ${hasItems ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' : ''}
              `}
              onClick={() => onDateSelect(dia)}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-bex font-bold' : ''}`}>
                {format(dia, 'd')}
              </div>

              <div className="space-y-1">
                {tarefasDoDia.slice(0, 2).map((tarefa) => (
                  <div key={tarefa.id} onClick={(e) => { e.stopPropagation(); onTarefaClick(tarefa); }}>
                    <TarefaCard tarefa={tarefa} compact />
                  </div>
                ))}

                {eventosDoDia.slice(0, 1).map((evento) => (
                  <div key={evento.id} onClick={(e) => { e.stopPropagation(); onEventoClick(evento); }}>
                    <EventoCard evento={evento} compact />
                  </div>
                ))}

                {(tarefasDoDia.length + eventosDoDia.length) > 3 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{(tarefasDoDia.length + eventosDoDia.length) - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
