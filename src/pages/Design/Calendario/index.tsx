import { useState } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

// Hooks customizados
import { useCalendarData } from './hooks/useCalendarData';
import { useViewMode } from './hooks/useViewMode';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Componentes
import { CalendarHeader } from './components/CalendarHeader';
import { ViewModeTabs } from './components/ViewModeTabs';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { ListView } from './components/ListView';
import { DayView } from './components/DayView';
import { QuickViewModal } from './components/QuickViewModal';

// Types
import { TarefaCalendario, EventoCalendario } from './types';

export default function DesignCalendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [novoEventoOpen, setNovoEventoOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedTarefa, setSelectedTarefa] = useState<TarefaCalendario | null>(null);
  const [selectedEvento, setSelectedEvento] = useState<EventoCalendario | null>(null);
  const [filtroDesigner, setFiltroDesigner] = useState('all');

  const { toast } = useToast();
  const { tarefas, eventos, profiles, loading, refetch } = useCalendarData();
  const { viewMode, setViewMode } = useViewMode('month');

  const { startTutorial } = useTutorial('design-calendario');

  // Navegação
  const handlePrevious = () => {
    switch (viewMode) {
      case 'month':
      case 'list':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case 'day':
        setCurrentDate(prev => subDays(prev, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'month':
      case 'list':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Atalhos de teclado
  useKeyboardShortcuts({
    onViewModeChange: setViewMode,
    onNavigateNext: handleNext,
    onNavigatePrev: handlePrevious,
    onGoToToday: handleToday
  });

  // Handlers
  const handleTarefaClick = (tarefa: TarefaCalendario) => {
    setSelectedTarefa(tarefa);
    setSelectedEvento(null);
    setQuickViewOpen(true);
  };

  const handleEventoClick = (evento: EventoCalendario) => {
    setSelectedEvento(evento);
    setSelectedTarefa(null);
    setQuickViewOpen(true);
  };

  const handleQuickViewClose = () => {
    setQuickViewOpen(false);
    setTimeout(() => {
      setSelectedTarefa(null);
      setSelectedEvento(null);
    }, 200);
  };

  const createEvento = async (data: any) => {
    try {
      const { error } = await supabase
        .from('eventos_calendario')
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Evento criado",
        description: "O evento foi adicionado ao calendário"
      });

      setNovoEventoOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao criar evento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendário Design</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e eventos criativos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setNovoEventoOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Controles de visualização */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div data-tutorial="view-modes">
          <ViewModeTabs value={viewMode} onChange={setViewMode} />
        </div>
        <div data-tutorial="filters">
          <CalendarHeader
            currentDate={currentDate}
            viewMode={viewMode}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
            filtroDesigner={filtroDesigner}
            onFilterChange={setFiltroDesigner}
            profiles={profiles}
          />
        </div>
      </div>

      {/* Atalhos de teclado */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded flex flex-wrap gap-4 justify-center">
        <span><kbd className="px-1 py-0.5 bg-background border rounded">M</kbd> Mês</span>
        <span><kbd className="px-1 py-0.5 bg-background border rounded">W</kbd> Semana</span>
        <span><kbd className="px-1 py-0.5 bg-background border rounded">L</kbd> Lista</span>
        <span><kbd className="px-1 py-0.5 bg-background border rounded">D</kbd> Dia</span>
        <span><kbd className="px-1 py-0.5 bg-background border rounded">T</kbd> Hoje</span>
        <span><kbd className="px-1 py-0.5 bg-background border rounded">←/→</kbd> Navegar</span>
      </div>

      {/* Visualizações */}
      <div data-tutorial="calendar-grid">
        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            tarefas={tarefas}
            eventos={eventos}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onTarefaClick={handleTarefaClick}
            onEventoClick={handleEventoClick}
            filtroDesigner={filtroDesigner}
          />
        )}

        {viewMode === 'week' && (
          <WeekView
            currentDate={currentDate}
            tarefas={tarefas}
            eventos={eventos}
            onTarefaClick={handleTarefaClick}
            onEventoClick={handleEventoClick}
            filtroDesigner={filtroDesigner}
          />
        )}

        {viewMode === 'list' && (
          <ListView
            tarefas={tarefas}
            eventos={eventos}
            onTarefaClick={handleTarefaClick}
            onEventoClick={handleEventoClick}
            filtroDesigner={filtroDesigner}
          />
        )}

        {viewMode === 'day' && (
          <DayView
            currentDate={currentDate}
            tarefas={tarefas}
            eventos={eventos}
            onTarefaClick={handleTarefaClick}
            onEventoClick={handleEventoClick}
            filtroDesigner={filtroDesigner}
          />
        )}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        open={quickViewOpen}
        onOpenChange={handleQuickViewClose}
        tarefa={selectedTarefa}
        evento={selectedEvento}
        onStatusChange={refetch}
      />

      {/* Dialog Novo Evento (simplificado) */}
      <Dialog open={novoEventoOpen} onOpenChange={setNovoEventoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use o módulo GRS para criar eventos completos com todas as regras de negócio.
            </p>
            <Button onClick={() => setNovoEventoOpen(false)} variant="outline" className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
