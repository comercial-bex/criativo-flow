import { format, isToday, isPast, isFuture, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventoCard } from './EventoCard';
import { cn } from '@/lib/utils';

interface ListViewProps {
  eventos: any[];
  onEventClick: (evento: any) => void;
}

const ListView = ({ eventos, onEventClick }: ListViewProps) => {
  const sortedEvents = [...eventos].sort((a, b) => 
    new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
  );

  // Group events by date
  const groupedEvents = sortedEvents.reduce((acc, evento) => {
    const dateKey = format(new Date(evento.data_inicio), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(evento);
    return acc;
  }, {} as Record<string, any[]>);

  const getDateStatus = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'today';
    if (isPast(startOfDay(date))) return 'past';
    if (isFuture(date)) return 'future';
    return 'future';
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Nenhum evento encontrado</p>
          <p className="text-sm mt-2">Tente ajustar os filtros ou adicione novos eventos</p>
        </div>
      ) : (
        Object.entries(groupedEvents).map(([dateStr, eventos]) => {
          const date = new Date(dateStr);
          const status = getDateStatus(dateStr);
          
          return (
            <div key={dateStr} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className={cn(
                  "text-lg font-semibold",
                  status === 'today' && "text-primary",
                  status === 'past' && "text-muted-foreground"
                )}>
                  {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
                {status === 'today' && (
                  <Badge variant="default">Hoje</Badge>
                )}
                {status === 'past' && (
                  <Badge variant="outline">Passado</Badge>
                )}
              </div>
              
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {(eventos as any[]).map((evento) => (
                  <Card
                    key={evento.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
                    onClick={() => onEventClick(evento)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold">{evento.titulo}</h4>
                        <Badge variant="outline" className="text-xs">
                          {evento.tipo?.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {format(new Date(evento.data_inicio), 'HH:mm')} - {format(new Date(evento.data_fim), 'HH:mm')}
                        </span>
                      </div>
                      
                      {evento.local && (
                        <div className="text-sm text-muted-foreground">
                          📍 {evento.local}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {evento.is_automatico && (
                          <Badge variant="outline" className="text-xs">Auto</Badge>
                        )}
                        {evento.is_extra && (
                          <Badge variant="outline" className="text-xs">Extra</Badge>
                        )}
                        {evento.modo_criativo && (
                          <Badge variant="secondary" className="text-xs">
                            {evento.modo_criativo === 'lote' ? `📦 ${evento.quantidade_pecas || 12} peças` : '📄 Avulso'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ListView;
