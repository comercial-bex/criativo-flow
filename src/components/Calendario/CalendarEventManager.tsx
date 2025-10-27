import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, Grid3x3, List, Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventoCard } from "./EventoCard";

interface CalendarEvent {
  id: string;
  titulo: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  responsavel?: any;
  projeto?: any;
  is_automatico?: boolean;
  is_extra?: boolean;
  modo_criativo?: string;
  quantidade_pecas?: number;
}

interface CalendarEventManagerProps {
  events: CalendarEvent[];
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  isLoading?: boolean;
}

const tipoCategories: Record<string, string> = {
  criacao_avulso: 'Criação',
  criacao_lote: 'Criação',
  edicao_curta: 'Edição',
  edicao_longa: 'Edição',
  captacao_interna: 'Captação',
  captacao_externa: 'Captação',
  planejamento: 'Planejamento',
  reuniao: 'Reunião',
  pausa_automatica: 'Sistema',
  deslocamento: 'Logística',
  preparacao: 'Preparação',
  backup: 'Backup'
};

const tipoColors: Record<string, { bg: string; border: string }> = {
  criacao_avulso: { bg: 'bg-blue-500/90', border: 'border-blue-500' },
  criacao_lote: { bg: 'bg-blue-600/90', border: 'border-blue-600' },
  edicao_curta: { bg: 'bg-purple-500/90', border: 'border-purple-500' },
  edicao_longa: { bg: 'bg-purple-600/90', border: 'border-purple-600' },
  captacao_interna: { bg: 'bg-orange-500/90', border: 'border-orange-500' },
  captacao_externa: { bg: 'bg-red-500/90', border: 'border-red-500' },
  planejamento: { bg: 'bg-green-500/90', border: 'border-green-500' },
  reuniao: { bg: 'bg-cyan-500/90', border: 'border-cyan-500' },
  pausa_automatica: { bg: 'bg-muted/90', border: 'border-muted' },
  deslocamento: { bg: 'bg-yellow-500/90', border: 'border-yellow-500' },
  preparacao: { bg: 'bg-amber-500/90', border: 'border-amber-500' },
  backup: { bg: 'bg-orange-600/90', border: 'border-orange-600' }
};

export function CalendarEventManager({
  events,
  currentDate,
  onNavigate,
  onEventClick,
  onDateClick,
  isLoading
}: CalendarEventManagerProps) {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);

  const availableTipos = useMemo(() => 
    Array.from(new Set(events.map(e => e.tipo))),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.titulo.toLowerCase().includes(query) ||
          event.responsavel?.nome?.toLowerCase().includes(query) ||
          event.projeto?.titulo?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (selectedTipos.length > 0 && !selectedTipos.includes(event.tipo)) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, selectedTipos]);

  const hasActiveFilters = selectedTipos.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => onNavigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-2xl font-semibold min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          
          <Button variant="outline" size="icon" onClick={() => onNavigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" onClick={() => onNavigate('prev')}>
            Hoje
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
            <Button
              variant={view === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className="h-8"
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Semana</span>
            </Button>
            <Button
              variant={view === 'month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className="h-8"
            >
              <Calendar className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Mês</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            onClick={() => setSelectedTipos([])}
          >
            <Filter className="h-4 w-4" />
            Tipos
            {selectedTipos.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {selectedTipos.length}
              </Badge>
            )}
          </Button>

          {availableTipos.map((tipo) => {
            const isSelected = selectedTipos.includes(tipo);
            return (
              <Badge
                key={tipo}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => {
                  setSelectedTipos(prev =>
                    isSelected ? prev.filter(t => t !== tipo) : [...prev, tipo]
                  );
                }}
              >
                {tipoCategories[tipo] || tipo}
              </Badge>
            );
          })}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTipos([])}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {view === 'week' ? (
        <WeekView
          currentDate={currentDate}
          events={filteredEvents}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
          isLoading={isLoading}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          events={filteredEvents}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

function WeekView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  isLoading
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  isLoading?: boolean;
}) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6h - 21h

  const getEventsForDayAndHour = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.data_inicio);
      return isSameDay(eventDate, date) && eventDate.getHours() === hour;
    });
  };

  const isExpediente = (hora: number, dia: Date) => {
    const dow = dia.getDay();
    if (dow === 0) return false;
    if (dow === 6) return hora >= 9 && hora < 13;
    return (hora >= 9 && hora < 13) || (hora >= 14 && hora < 18);
  };

  const isJanelaFlex = (hora: number) => {
    return (hora >= 6 && hora < 9) || (hora >= 18 && hora < 21);
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 border-b bg-muted/50">
            <div className="border-r p-3 text-sm font-semibold">Hora</div>
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border-r p-3 text-center last:border-r-0",
                    isToday && "bg-primary/10"
                  )}
                >
                  <div className="text-sm font-semibold">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={cn(
                    "text-xs text-muted-foreground",
                    isToday && "text-primary font-semibold"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="border-r p-2 text-sm text-muted-foreground font-medium bg-muted/30">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDayAndHour(day, hour);
                  const expediente = isExpediente(hour, day);
                  const flex = isJanelaFlex(hour);
                  const dataHora = new Date(day);
                  dataHora.setHours(hour, 0, 0, 0);

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={cn(
                        "min-h-[60px] border-r p-1 transition-all cursor-pointer hover:bg-accent/50 last:border-r-0",
                        expediente && "bg-background",
                        flex && "bg-primary/5",
                        !expediente && !flex && "bg-muted/30"
                      )}
                      onClick={() => onDateClick?.(dataHora)}
                    >
                      <div className="space-y-1">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick?.(event);
                            }}
                          >
                            <EventoCard evento={event} compact />
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
      </div>
    </Card>
  );
}

function MonthView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  isLoading
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  isLoading?: boolean;
}) {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    return day;
  });

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.data_inicio);
      return isSameDay(eventDate, date);
    });
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
          <div key={day} className="border-r p-3 text-center text-sm font-semibold last:border-r-0">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={cn(
                "min-h-24 border-b border-r p-2 transition-all cursor-pointer hover:bg-accent/30 last:border-r-0",
                !isCurrentMonth && "bg-muted/30 opacity-50",
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div
                className={cn(
                  "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
                  isToday && "bg-primary text-primary-foreground"
                )}
              >
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <EventoCard evento={event} compact />
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
