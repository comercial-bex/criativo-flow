import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Video, CheckSquare, Calendar as CalendarIcon, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AgendaEvent {
  id: string;
  titulo: string;
  data: Date;
  tipo: 'captacao' | 'tarefa' | 'evento';
  status?: string;
  cor: string;
}

export function AgendaUnificada() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [rescheduleEvent, setRescheduleEvent] = useState<any>(null); // FASE 5

  const fetchEvents = async () => {
    try {
      const [captacoesRes, tarefasRes, eventosRes] = await Promise.all([
        supabase.from('captacoes_agenda').select('id, titulo, data_captacao, status'),
        supabase.from('tarefas_projeto').select('id, titulo, data_prazo, status'),
        supabase.from('eventos_calendario').select('id, titulo, data_inicio, cor, status, tipo')
      ]);

      const allEvents: AgendaEvent[] = [];

      // Captações Audiovisual (vermelho)
      if (captacoesRes.data) {
        captacoesRes.data.forEach((c) => {
          allEvents.push({
            id: c.id,
            titulo: c.titulo,
            data: new Date(c.data_captacao),
            tipo: 'captacao',
            status: c.status,
            cor: '#ef4444'
          });
        });
      }

      // Tarefas com Prazo (azul)
      if (tarefasRes.data) {
        tarefasRes.data.forEach((t) => {
          if (t.data_prazo) {
            allEvents.push({
              id: t.id,
              titulo: t.titulo,
              data: new Date(t.data_prazo),
              tipo: 'tarefa',
              status: t.status,
              cor: '#3b82f6'
            });
          }
        });
      }

      // Eventos do Calendário Unificado (cores variadas)
      if (eventosRes.data) {
        eventosRes.data.forEach((e) => {
          allEvents.push({
            id: e.id,
            titulo: e.titulo,
            data: new Date(e.data_inicio),
            tipo: 'evento',
            status: e.status,
            cor: e.cor || '#22c55e'
          });
        });
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      toast({
        title: "Erro ao carregar agenda",
        description: "Não foi possível carregar os eventos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const selectedDateEvents = events.filter((event) =>
    isSameDay(event.data, selectedDate)
  );

  // FASE 4: Detectar conflitos/sobrecarga
  const getConflictingEvents = (date: Date) => {
    const dayEvents = events.filter(e => isSameDay(e.data, date));
    
    // Agrupar por responsável (simplificado - todos os eventos do dia)
    const conflicts = dayEvents.length >= 3 ? [{
      count: dayEvents.length,
      events: dayEvents
    }] : [];

    return conflicts;
  };

  const selectedDateConflicts = getConflictingEvents(selectedDate);

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case 'captacao':
        return <Video className="h-4 w-4" />;
      case 'tarefa':
        return <CheckSquare className="h-4 w-4" />;
      case 'evento':
        return <CalendarIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getEventTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'captacao':
        return 'Captação';
      case 'tarefa':
        return 'Tarefa';
      case 'evento':
        return 'Evento';
      default:
        return tipo;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📅 Agenda Unificada</h1>
          <p className="text-muted-foreground">
            Visualize todas as captações, tarefas e eventos em um só lugar
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Video className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Captações</p>
                <p className="text-2xl font-bold">
                  {events.filter((e) => e.tipo === 'captacao').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarefas</p>
                <p className="text-2xl font-bold">
                  {events.filter((e) => e.tipo === 'tarefa').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CalendarIcon className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eventos</p>
                <p className="text-2xl font-bold">
                  {events.filter((e) => e.tipo === 'evento').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border"
              modifiers={{
                conflict: (date) => getConflictingEvents(date).length > 0
              }}
              modifiersStyles={{
                conflict: { 
                  backgroundColor: 'hsl(var(--warning) / 0.2)', 
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Eventos em {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* FASE 4: Alerta de sobrecarga */}
            {selectedDateConflicts.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>⚠️ Sobrecarga detectada!</AlertTitle>
                <AlertDescription>
                  {selectedDateConflicts[0].count} eventos agendados neste dia. 
                  Considere redistribuir para evitar sobrecarga.
                </AlertDescription>
              </Alert>
            )}

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento nesta data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="p-2 rounded"
                          style={{ backgroundColor: `${event.cor}20` }}
                        >
                          {getEventIcon(event.tipo)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{event.titulo}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                selectedDateConflicts.some(c => 
                                  c.events.some(e => e.id === event.id)
                                ) && "border-red-500 bg-red-50 text-red-700"
                              )}
                            >
                              {getEventTypeLabel(event.tipo)}
                            </Badge>
                            {event.status && (
                              <Badge variant="secondary" className="text-xs">
                                {event.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* FASE 5: Botão reagendar */}
                        {event.tipo === 'captacao' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRescheduleEvent(event)}
                          >
                            🔄 Reagendar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FASE 5: Modal de Reagendamento */}
      <Dialog open={!!rescheduleEvent} onOpenChange={() => setRescheduleEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Reagendar Evento
            </DialogTitle>
            <DialogDescription>
              Altere a data de: <strong>{rescheduleEvent?.titulo}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Nova Data</Label>
              <Calendar
                mode="single"
                selected={rescheduleEvent?.data}
                onSelect={(date) => {
                  if (date) {
                    setRescheduleEvent({ ...rescheduleEvent, data: date });
                  }
                }}
                locale={ptBR}
                className="rounded-md border"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={async () => {
                  if (!rescheduleEvent) return;
                  
                  try {
                    // Atualizar no banco
                    if (rescheduleEvent.tipo === 'captacao') {
                      const { error } = await supabase
                        .from('captacoes_agenda')
                        .update({ 
                          data_captacao: rescheduleEvent.data.toISOString() 
                        })
                        .eq('id', rescheduleEvent.id);
                      
                      if (error) throw error;
                    }
                    
                    toast({
                      title: "✅ Evento reagendado!",
                      description: `Nova data: ${format(rescheduleEvent.data, "dd/MM/yyyy", { locale: ptBR })}`
                    });
                    
                    setRescheduleEvent(null);
                    fetchEvents();
                  } catch (error) {
                    console.error('Erro ao reagendar:', error);
                    toast({
                      title: "Erro ao reagendar",
                      description: "Não foi possível reagendar o evento",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Confirmar
              </Button>
              <Button variant="outline" onClick={() => setRescheduleEvent(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
