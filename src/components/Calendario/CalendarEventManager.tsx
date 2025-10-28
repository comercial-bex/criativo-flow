import React, { useState, useMemo, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, Filter, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3x3, Clock, List as ListIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { EventoCard } from './EventoCard';
import { EventDialog } from './EventDialog';
import { useEventMutations } from '@/hooks/useEventMutations';
import DayView from './DayViewCalendar';
import ListView from './ListViewCalendar';

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
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  isLoading?: boolean;
}

const tipoCategories: Record<string, string> = {
  criacao_avulso: 'Criação',
  criacao_lote: 'Criação Lote',
  edicao_curta: 'Edição',
  edicao_longa: 'Edição Longa',
  captacao_interna: 'Captação Interna',
  captacao_externa: 'Captação Externa',
  planejamento: 'Planejamento',
  reuniao: 'Reunião',
  pausa_automatica: 'Sistema',
  deslocamento: 'Deslocamento',
  preparacao: 'Preparação',
  backup: 'Backup',
  feriado: 'Feriado' // 🎉 Adicionar feriados
};

const tipoColors: Record<string, string> = {
  criacao_avulso: 'bg-blue-500',
  criacao_lote: 'bg-blue-600',
  edicao_curta: 'bg-purple-500',
  edicao_longa: 'bg-purple-600',
  captacao_interna: 'bg-orange-500',
  captacao_externa: 'bg-red-500',
  planejamento: 'bg-green-500',
  reuniao: 'bg-cyan-500',
  pausa_automatica: 'bg-gray-400',
  deslocamento: 'bg-yellow-500',
  preparacao: 'bg-amber-500',
  backup: 'bg-orange-600',
  feriado: 'bg-red-600' // 🎉 Cor vermelha para feriados
};

export const CalendarEventManager = ({ events, currentDate, onNavigate, onDateClick, isLoading }: CalendarEventManagerProps) => {
  const [view, setView] = useState<'week' | 'month' | 'day' | 'list'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [draggedEvent, setDraggedEvent] = useState<any | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { updateEvento } = useEventMutations();

  const availableTipos = useMemo(() => 
    Array.from(new Set(events.map(e => e.tipo))),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = !searchQuery || 
        event.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tipo?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTipo = selectedTipos.length === 0 || selectedTipos.includes(event.tipo);
      
      return matchesSearch && matchesTipo;
    });
  }, [events, searchQuery, selectedTipos]);

  const handleDragStart = useCallback((event: any) => {
    setDraggedEvent(event);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null);
  }, []);

  const handleDrop = useCallback((date: Date, hour?: number) => {
    if (!draggedEvent) return;

    const duration = new Date(draggedEvent.data_fim).getTime() - new Date(draggedEvent.data_inicio).getTime();
    const newStartTime = new Date(date);
    if (hour !== undefined) {
      newStartTime.setHours(hour, 0, 0, 0);
    }
    const newEndTime = new Date(newStartTime.getTime() + duration);

    updateEvento({
      id: draggedEvent.id,
      updates: {
        data_inicio: newStartTime.toISOString(),
        data_fim: newEndTime.toISOString(),
      }
    });

    setDraggedEvent(null);
  }, [draggedEvent, updateEvento]);

  const handleEventClick = useCallback((event: any) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  }, []);

  const clearFilters = () => {
    setSelectedTipos([]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedTipos.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h2 className="text-xl font-semibold sm:text-2xl">
            {view === 'month' &&
              format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            {view === 'week' &&
              `Semana de ${format(currentDate, "d 'de' MMMM", { locale: ptBR })}`}
            {view === 'day' &&
              format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            {view === 'list' && "Todos os Eventos"}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => onNavigate('prev')} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('today')}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={() => onNavigate('next')} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Mobile: Select dropdown */}
          <div className="sm:hidden">
            <Select value={view} onValueChange={(value: any) => setView(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Mês
                  </div>
                </SelectItem>
                <SelectItem value="week">
                  <div className="flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    Semana
                  </div>
                </SelectItem>
                <SelectItem value="day">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Dia
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center gap-2">
                    <ListIcon className="h-4 w-4" />
                    Lista
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Button group */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg border bg-background p-1">
            <Button
              variant={view === 'month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className="h-8"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="ml-1">Mês</span>
            </Button>
            <Button
              variant={view === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className="h-8"
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="ml-1">Semana</span>
            </Button>
            <Button
              variant={view === 'day' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className="h-8"
            >
              <Clock className="h-4 w-4" />
              <span className="ml-1">Dia</span>
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="h-8"
            >
              <ListIcon className="h-4 w-4" />
              <span className="ml-1">Lista</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
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

        <div className="hidden sm:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Tipos
                {selectedTipos.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {selectedTipos.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Filtrar por Tipo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableTipos.map((tipo) => (
                <DropdownMenuCheckboxItem
                  key={tipo}
                  checked={selectedTipos.includes(tipo)}
                  onCheckedChange={(checked) => {
                    setSelectedTipos((prev) =>
                      checked ? [...prev, tipo] : prev.filter((t) => t !== tipo),
                    )
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded", tipoColors[tipo] || 'bg-gray-500')} />
                    {tipoCategories[tipo]}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            {selectedTipos.map((tipo) => (
              <Badge key={tipo} variant="secondary" className="gap-1">
                {tipoCategories[tipo]}
                <button
                  onClick={() => setSelectedTipos((prev) => prev.filter((t) => t !== tipo))}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Calendar View - FASE 2 Gaming Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : view === 'week' ? (
            <WeekView 
              currentDate={currentDate}
              eventos={filteredEvents}
              onEventClick={handleEventClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          ) : view === 'month' ? (
            <MonthView 
              currentDate={currentDate}
              eventos={filteredEvents}
              onDateClick={onDateClick}
              onEventClick={handleEventClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          ) : view === 'day' ? (
            <DayView 
              currentDate={currentDate}
              eventos={filteredEvents}
              onEventClick={handleEventClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
          ) : (
            <ListView 
              eventos={filteredEvents}
              onEventClick={handleEventClick}
            />
          )}
        </CardContent>
      </Card>

      <EventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        evento={selectedEvent}
      />
    </div>
  );
};

const WeekView = ({ 
  currentDate, 
  eventos,
  onEventClick,
  onDragStart,
  onDragEnd,
  onDrop 
}: { 
  currentDate: Date; 
  eventos: any[];
  onEventClick: (evento: any) => void;
  onDragStart: (evento: any) => void;
  onDragEnd: () => void;
  onDrop: (date: Date, hour: number) => void;
}) => {
  const dias = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 })
  });

  const horarios = Array.from({ length: 15 }, (_, i) => {
    const hora = i + 6;
    return `${hora.toString().padStart(2, '0')}:00`;
  });

  const isExpediente = (hora: string) => {
    const h = parseInt(hora.split(':')[0]);
    return (h >= 9 && h < 13) || (h >= 14 && h < 18);
  };

  const isJanelaFlex = (hora: string) => {
    const h = parseInt(hora.split(':')[0]);
    return (h >= 6 && h < 9) || (h >= 18 && h < 21);
  };

  const getEventosHorario = (dia: Date, hora: string, eventos: any[]) => {
    const horaSplit = parseInt(hora.split(':')[0]);
    return eventos.filter(evento => {
      const dataEvento = new Date(evento.data_inicio);
      return isSameDay(dataEvento, dia) && dataEvento.getHours() === horaSplit;
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 border-b bg-muted/50">
          <div className="border-r p-2 text-sm font-semibold">Hora</div>
          {dias.map(dia => (
            <div key={dia.toISOString()} className="border-r p-2 text-center last:border-r-0">
              <div className="text-sm font-semibold">
                {format(dia, 'EEE', { locale: ptBR })}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(dia, 'd', { locale: ptBR })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8">
          {horarios.map(hora => (
            <React.Fragment key={`row-${hora}`}>
              <div key={`hora-${hora}`} className="border-r border-b p-2 text-sm font-medium bg-muted/30">
                {hora}
              </div>
              {dias.map(dia => (
                <div
                  key={`${dia.toISOString()}-${hora}`}
                  className={cn(
                    'min-h-16 border-b border-r p-1 transition-colors hover:bg-accent/50',
                    isExpediente(hora) ? 'bg-background' : isJanelaFlex(hora) ? 'bg-primary/5' : 'bg-muted/30'
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(dia, parseInt(hora.split(':')[0]))}
                >
                  {getEventosHorario(dia, hora, eventos).map(evento => (
                    <EventoCard 
                      key={evento.id} 
                      evento={evento} 
                      variant="compact"
                      onClick={() => onEventClick(evento)}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                    />
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const MonthView = ({ 
  currentDate, 
  eventos, 
  onDateClick,
  onEventClick,
  onDragStart,
  onDragEnd,
  onDrop 
}: { 
  currentDate: Date; 
  eventos: any[]; 
  onDateClick?: (date: Date) => void;
  onEventClick: (evento: any) => void;
  onDragStart: (evento: any) => void;
  onDragEnd: () => void;
  onDrop: (date: Date) => void;
}) => {
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, 41)
  });

  const getEventosDodia = (dia: Date, eventos: any[]) => {
    return eventos.filter(evento => 
      isSameDay(new Date(evento.data_inicio), dia)
    );
  };

  const getFeriadosDodia = (dia: Date, eventos: any[]) => {
    return eventos.filter(evento => 
      evento.tipo === 'feriado' && isSameDay(new Date(evento.data_inicio), dia)
    );
  };

  const getEventTypeDot = (tipo: string) => {
    return tipoColors[tipo] || 'bg-gray-500';
  };

  return (
    <div className="rounded-2xl border-2 border-border overflow-hidden">
      {/* Double border effect - FASE 2 */}
      <div className="rounded-xl border-2 border-border/50 m-1" 
           style={{ boxShadow: '0px 2px 1.5px 0px rgba(165, 174, 184, 0.32) inset' }}>
        
        {/* Header dos dias da semana */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map(dia => (
            <div key={dia} className="p-3 text-center">
              <span className="text-xs font-medium text-muted-foreground">{dia}</span>
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-2 p-3">
          {days.map((day, index) => {
            const dayEvents = getEventosDodia(day, eventos);
            const nonHolidayEvents = dayEvents.filter(e => e.tipo !== 'feriado');
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(day, new Date());
            const feriadosDia = getFeriadosDodia(day, eventos);

            return (
              <div
                key={index}
                onClick={() => onDateClick?.(day)}
                className={cn(
                  'group relative min-h-[100px] rounded-xl border-2 p-3 cursor-pointer transition-all duration-300',
                  'hover:scale-[1.02] hover:shadow-lg',
                  !isCurrentMonth && 'opacity-40 bg-muted/20',
                  isCurrentMonth && 'bg-background border-border',
                  isToday && 'bg-primary/5 border-primary ring-2 ring-primary/30',
                  feriadosDia.length > 0 && 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900'
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(day)}
              >
                {/* Gradient hover effect - FASE 2 */}
                <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                
                {/* Feriado badge no topo direito */}
                {feriadosDia.length > 0 && (
                  <div className="absolute -top-1 -right-1 z-10">
                    <Badge className="h-5 px-1.5 text-[9px] bg-red-500 text-white border-0">
                      🎉 {feriadosDia[0].titulo.slice(0, 8)}
                    </Badge>
                  </div>
                )}

                {/* Número do dia - FASE 1 */}
                <div className="flex items-center justify-center mb-3">
                  <span className={cn(
                    'text-2xl font-bold',
                    !isCurrentMonth && 'text-muted-foreground',
                    isToday && 'text-primary'
                  )}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Event indicators - FASE 4 mini-badges */}
                <div className="space-y-1">
                  {nonHolidayEvents.slice(0, 3).map((evento, idx) => (
                    <div
                      key={evento.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(evento);
                      }}
                      draggable
                      onDragStart={() => onDragStart(evento)}
                      onDragEnd={onDragEnd}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-medium text-white truncate cursor-pointer',
                        'hover:opacity-80 transition-opacity',
                        getEventTypeDot(evento.tipo)
                      )}
                      title={evento.titulo}
                    >
                      {evento.titulo.slice(0, 12)}
                      {evento.is_extra && ' ⚡'}
                      {evento.is_automatico && ' 🤖'}
                    </div>
                  ))}
                  
                  {/* +N badge - FASE 4 */}
                  {nonHolidayEvents.length > 3 && (
                    <div className="text-center">
                      <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                        +{nonHolidayEvents.length - 3}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Event type dots - FASE 1 */}
                {nonHolidayEvents.length > 0 && (
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {Array.from(new Set(nonHolidayEvents.map(e => e.tipo))).slice(0, 4).map((tipo, idx) => (
                      <div
                        key={idx}
                        className={cn('h-1.5 w-1.5 rounded-full', getEventTypeDot(tipo))}
                        title={tipoCategories[tipo]}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
