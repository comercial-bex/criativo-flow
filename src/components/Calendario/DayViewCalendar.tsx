import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventoCard } from './EventoCard';

interface DayViewProps {
  currentDate: Date;
  eventos: any[];
  onEventClick: (evento: any) => void;
  onDragStart: (evento: any) => void;
  onDragEnd: () => void;
  onDrop: (date: Date, hour: number) => void;
}

const DayView = ({ currentDate, eventos, onEventClick, onDragStart, onDragEnd, onDrop }: DayViewProps) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return eventos.filter((evento) => {
      const eventDate = new Date(evento.data_inicio);
      const eventHour = eventDate.getHours();
      return (
        eventDate.getDate() === currentDate.getDate() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear() &&
        eventHour === hour
      );
    });
  };

  return (
    <div className="space-y-0">
      {hours.map((hour) => {
        const hourEvents = getEventsForHour(hour);
        return (
          <div
            key={hour}
            className="flex border-b last:border-b-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(currentDate, hour)}
          >
            <div className="w-14 flex-shrink-0 border-r p-2 text-xs text-muted-foreground sm:w-20 sm:p-3 sm:text-sm">
              {hour.toString().padStart(2, '0')}:00
            </div>
            <div className="min-h-16 flex-1 p-1 transition-colors hover:bg-accent/50 sm:min-h-20 sm:p-2">
              <div className="space-y-2">
                {hourEvents.map((evento) => (
                  <EventoCard
                    key={evento.id}
                    evento={evento}
                    variant="detailed"
                    onClick={() => onEventClick(evento)}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DayView;
