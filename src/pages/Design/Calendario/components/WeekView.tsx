import { format, isSameDay } from "date-fns";
import { TarefaCalendario, EventoCalendario } from '../types';
import { TarefaCard } from './TarefaCard';
import { EventoCard } from '@/components/Calendario/EventoCard';
import { getDaysInWeek, getTimeSlots } from '../utils/dateHelpers';
import { getTarefaData } from '../utils/taskHelpers';

interface WeekViewProps {
  currentDate: Date;
  tarefas: TarefaCalendario[];
  eventos: EventoCalendario[];
  onTarefaClick: (tarefa: TarefaCalendario) => void;
  onEventoClick: (evento: EventoCalendario) => void;
  filtroDesigner: string;
}

export const WeekView = ({
  currentDate,
  tarefas,
  eventos,
  onTarefaClick,
  onEventoClick,
  filtroDesigner
}: WeekViewProps) => {
  const weekDays = getDaysInWeek(currentDate);
  const timeSlots = getTimeSlots();

  const getItemsForDayAndTime = (dia: Date, time: string) => {
    const tarefasDoDia = tarefas.filter(tarefa => {
      const data = getTarefaData(tarefa);
      return data && 
        isSameDay(new Date(data), dia) &&
        (filtroDesigner === 'all' || tarefa.executor_id === filtroDesigner);
    });

    const eventosDoDia = eventos.filter(evento => {
      const inicio = new Date(evento.data_inicio);
      const hour = format(inicio, 'HH:00');
      return isSameDay(inicio, dia) && 
        hour === time &&
        (filtroDesigner === 'all' || evento.responsavel_id === filtroDesigner);
    });

    return { tarefas: tarefasDoDia, eventos: eventosDoDia };
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Cabeçalhos */}
        <div className="grid grid-cols-8 gap-2 mb-2 sticky top-0 bg-background z-10 pb-2">
          <div className="text-sm font-semibold"></div>
          {weekDays.map(dia => {
            const isToday = isSameDay(dia, new Date());
            return (
              <div key={dia.toISOString()} className={`text-center p-2 rounded ${isToday ? 'bg-bex text-white' : ''}`}>
                <div className="text-sm font-semibold">{format(dia, 'EEE')}</div>
                <div className="text-xs">{format(dia, 'dd/MM')}</div>
              </div>
            );
          })}
        </div>

        {/* Grade de horários */}
        {timeSlots.map(time => (
          <div key={time} className="grid grid-cols-8 gap-2 mb-1">
            <div className="text-xs text-muted-foreground font-medium py-2">
              {time}
            </div>
            {weekDays.map(dia => {
              const { tarefas: tarefasDoDia, eventos: eventosDoDia } = getItemsForDayAndTime(dia, time);
              
              return (
                <div
                  key={`${dia.toISOString()}-${time}`}
                  className="min-h-[60px] p-1 border rounded bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    {eventosDoDia.map(evento => (
                      <div key={evento.id} onClick={() => onEventoClick(evento)}>
                        <EventoCard evento={evento} variant="compact" />
                      </div>
                    ))}
                    {tarefasDoDia.slice(0, 1).map(tarefa => (
                      <div key={tarefa.id} onClick={() => onTarefaClick(tarefa)}>
                        <TarefaCard tarefa={tarefa} compact />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
