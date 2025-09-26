import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Eye, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  tipo: string;
  cor: string;
  cliente_id?: string;
  projeto_id?: string;
  responsavel_id?: string;
}

const eventTypeLabels = {
  evento: 'Evento',
  captacao: 'Captação',
  deadline: 'Deadline',
  reuniao: 'Reunião'
};

const eventTypeColors = {
  evento: 'bg-blue-100 text-blue-800',
  captacao: 'bg-yellow-100 text-yellow-800',
  deadline: 'bg-red-100 text-red-800',
  reuniao: 'bg-green-100 text-green-800'
};

export function CalendarModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('eventos_agenda')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      const dayEvents = events.filter(event => 
        isSameDay(new Date(event.data_inicio), selectedDate)
      );
      setSelectedDayEvents(dayEvents);
    }
  }, [selectedDate, events]);

  const hasEventsOnDate = (date: Date) => {
    return events.some(event => isSameDay(new Date(event.data_inicio), date));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Calendário Geral da Agência">
          <CalendarIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Calendário Geral da Agência</DialogTitle>
          <DialogDescription>
            Visualize todos os eventos, captações, deadlines e reuniões da agência
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasEvents: (date) => hasEventsOnDate(date)
              }}
              modifiersClassNames={{
                hasEvents: "bg-primary/20 text-primary font-bold"
              }}
            />
            
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-primary/20 rounded"></div>
                <span>Dias com eventos</span>
              </div>
            </div>
          </div>
          
          {/* Events for selected date */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
              </h3>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </div>
            
            <ScrollArea className="h-80">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : selectedDayEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => (
                    <Card key={event.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{event.titulo}</CardTitle>
                          <Badge 
                            variant="secondary"
                            className={eventTypeColors[event.tipo as keyof typeof eventTypeColors]}
                          >
                            {eventTypeLabels[event.tipo as keyof typeof eventTypeLabels]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {event.descricao && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.descricao}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.data_inicio), "HH:mm")} - {format(new Date(event.data_fim), "HH:mm")}
                        </div>
                        <div className="flex space-x-1 mt-2">
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-destructive">
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum evento nesta data</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}