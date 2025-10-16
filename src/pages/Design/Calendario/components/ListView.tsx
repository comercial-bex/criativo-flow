import { format, isBefore, isToday, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TarefaCalendario, EventoCalendario } from '../types';
import { TarefaCard } from './TarefaCard';
import { EventoCard } from '@/components/Calendario/EventoCard';
import { sortTarefasByUrgency, getTarefaData } from '../utils/taskHelpers';

interface ListViewProps {
  tarefas: TarefaCalendario[];
  eventos: EventoCalendario[];
  onTarefaClick: (tarefa: TarefaCalendario) => void;
  onEventoClick: (evento: EventoCalendario) => void;
  filtroDesigner: string;
}

export const ListView = ({
  tarefas,
  eventos,
  onTarefaClick,
  onEventoClick,
  filtroDesigner
}: ListViewProps) => {
  const filteredTarefas = tarefas.filter(t => 
    filtroDesigner === 'all' || t.executor_id === filtroDesigner
  );

  const filteredEventos = eventos.filter(e => 
    filtroDesigner === 'all' || e.responsavel_id === filtroDesigner
  );

  // Agrupar por categoria
  const atrasadas = filteredTarefas.filter(t => {
    const data = getTarefaData(t);
    return data && isBefore(new Date(data), startOfDay(new Date())) && 
      t.status?.toLowerCase() !== 'concluída' && t.status?.toLowerCase() !== 'concluida';
  });

  const hoje = filteredTarefas.filter(t => {
    const data = getTarefaData(t);
    return data && isToday(new Date(data));
  });

  const eventosHoje = filteredEventos.filter(e => isToday(new Date(e.data_inicio)));

  const proximas = filteredTarefas.filter(t => {
    const data = getTarefaData(t);
    if (!data) return false;
    const dataObj = new Date(data);
    return !isBefore(dataObj, startOfDay(new Date())) && !isToday(dataObj);
  });

  const semData = filteredTarefas.filter(t => !getTarefaData(t));

  const renderSection = (title: string, items: TarefaCalendario[], color: string, emoji: string) => {
    if (items.length === 0) return null;

    const sorted = sortTarefasByUrgency(items);

    return (
      <div className="space-y-2">
        <div className={`flex items-center gap-2 text-sm font-semibold ${color} p-2 rounded`}>
          <span>{emoji}</span>
          <span>{title}</span>
          <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {items.length}
          </span>
        </div>
        <div className="space-y-2 pl-4">
          {sorted.map(tarefa => {
            const data = getTarefaData(tarefa);
            return (
              <div key={tarefa.id} className="border-l-4 border-border pl-3">
                <div className="text-xs text-muted-foreground mb-1">
                  {data && format(new Date(data), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>
                <div onClick={() => onTarefaClick(tarefa)}>
                  <TarefaCard tarefa={tarefa} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventosSection = () => {
    if (eventosHoje.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 p-2 rounded">
          <span>📅</span>
          <span>Eventos Hoje</span>
          <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {eventosHoje.length}
          </span>
        </div>
        <div className="space-y-2 pl-4">
          {eventosHoje.map(evento => (
            <div key={evento.id} className="border-l-4 border-purple-300 pl-3">
              <div className="text-xs text-muted-foreground mb-1">
                {format(new Date(evento.data_inicio), "HH:mm")} - {format(new Date(evento.data_fim), "HH:mm")}
              </div>
              <div onClick={() => onEventoClick(evento)}>
                <EventoCard evento={evento} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {renderSection('ATRASADAS', atrasadas, 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300', '🔴')}
      {renderEventosSection()}
      {renderSection('HOJE', hoje, 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300', '🟡')}
      {renderSection('PRÓXIMAS', proximas, 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300', '🟢')}
      {renderSection('SEM PRAZO', semData, 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', '⚪')}

      {filteredTarefas.length === 0 && filteredEventos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Nenhuma tarefa ou evento encontrado</p>
          <p className="text-sm">Tente ajustar os filtros</p>
        </div>
      )}
    </div>
  );
};
