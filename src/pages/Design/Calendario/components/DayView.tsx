import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TarefaCalendario, EventoCalendario } from '../types';
import { TarefaCard } from './TarefaCard';
import { EventoCard } from '@/components/Calendario/EventoCard';
import { getTimeSlots, formatDate } from '../utils/dateHelpers';

interface DayViewProps {
  currentDate: Date;
  tarefas: TarefaCalendario[];
  eventos: EventoCalendario[];
  onTarefaClick: (tarefa: TarefaCalendario) => void;
  onEventoClick: (evento: EventoCalendario) => void;
  filtroDesigner: string;
}

export const DayView = ({
  currentDate,
  tarefas,
  eventos,
  onTarefaClick,
  onEventoClick,
  filtroDesigner
}: DayViewProps) => {
  const timeSlots = getTimeSlots();

  const tarefasDoDia = tarefas.filter(tarefa => {
    const data = tarefa.prazo_executor;
    return data && 
      isSameDay(new Date(data), currentDate) &&
      (filtroDesigner === 'all' || tarefa.executor_id === filtroDesigner);
  });

  const eventosDoDia = eventos.filter(evento => 
    isSameDay(new Date(evento.data_inicio), currentDate) &&
    (filtroDesigner === 'all' || evento.responsavel_id === filtroDesigner)
  );

  const tarefasSemHorario = tarefasDoDia.filter(t => {
    if (!t.prazo_executor) return true;
    const hour = parseInt(format(new Date(t.prazo_executor), 'HH'));
    return hour < 8 || hour > 18;
  });

  const getItemsForTime = (time: string) => {
    const eventosNoHorario = eventosDoDia.filter(evento => {
      const inicio = new Date(evento.data_inicio);
      const hour = format(inicio, 'HH:00');
      return hour === time;
    });

    const tarefasNoHorario = tarefasDoDia.filter(tarefa => {
      if (!tarefa.prazo_executor) return false;
      const hour = format(new Date(tarefa.prazo_executor), 'HH:00');
      return hour === time;
    });

    return { eventos: eventosNoHorario, tarefas: tarefasNoHorario };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho do dia */}
      <div className="text-center p-6 bg-gradient-to-r from-bex/10 to-bex/5 rounded-lg border">
        <h2 className="text-2xl font-bold capitalize">
          {formatDate(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {tarefasDoDia.length} tarefa(s) • {eventosDoDia.length} evento(s)
        </p>
      </div>

      {/* Timeline com horários */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <div className="h-1 w-8 bg-bex rounded"></div>
          Timeline do Dia
        </h3>

        <div className="border-l-2 border-bex/30 pl-6 space-y-4 ml-12">
          {timeSlots.map(time => {
            const { eventos: eventosNoHorario, tarefas: tarefasNoHorario } = getItemsForTime(time);
            
            if (eventosNoHorario.length === 0 && tarefasNoHorario.length === 0) {
              return (
                <div key={time} className="relative">
                  <div className="absolute -left-[1.6rem] w-3 h-3 bg-muted border-2 border-bex/30 rounded-full"></div>
                  <div className="text-sm text-muted-foreground font-mono">{time}</div>
                </div>
              );
            }

            return (
              <div key={time} className="relative space-y-2">
                <div className="absolute -left-[1.6rem] w-3 h-3 bg-bex border-2 border-white rounded-full"></div>
                <div className="text-sm font-semibold font-mono text-bex">{time}</div>
                
                <div className="space-y-2">
                  {eventosNoHorario.map(evento => (
                    <div key={evento.id} onClick={() => onEventoClick(evento)} className="cursor-pointer">
                      <EventoCard evento={evento} />
                    </div>
                  ))}
                  
                  {tarefasNoHorario.map(tarefa => (
                    <div key={tarefa.id} onClick={() => onTarefaClick(tarefa)} className="cursor-pointer">
                      <TarefaCard tarefa={tarefa} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tarefas sem horário */}
      {tarefasSemHorario.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <div className="h-1 w-8 bg-muted rounded"></div>
            Sem Horário Definido ({tarefasSemHorario.length})
          </h3>
          <div className="grid gap-2">
            {tarefasSemHorario.map(tarefa => (
              <div key={tarefa.id} onClick={() => onTarefaClick(tarefa)} className="cursor-pointer">
                <TarefaCard tarefa={tarefa} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tarefasDoDia.length === 0 && eventosDoDia.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Nenhuma tarefa ou evento para este dia</p>
          <p className="text-sm">Aproveite para planejar!</p>
        </div>
      )}
    </div>
  );
};
