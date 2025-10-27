import { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Plus, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCalendarioMultidisciplinar } from '@/hooks/useCalendarioMultidisciplinar';
import { EventoCard } from '@/components/Calendario/EventoCard';
import { ModalCriarEvento } from '@/components/Calendario/ModalCriarEvento';
import { CalendarioDashboard } from '@/components/Calendario/CalendarioDashboard';
import { AudiovisualScheduleModal } from '@/components/AudiovisualScheduleModal';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRole } from '@/hooks/useUserRole';

export default function Calendario() {
  const { role } = useUserRole();
  const canEdit = ['admin', 'gestor', 'grs'].includes(role || '');
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [dataInicialModal, setDataInicialModal] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('calendario');
  const [modalCaptacaoAberto, setModalCaptacaoAberto] = useState(false);
  
  const startDate = viewMode === 'week' 
    ? startOfWeek(selectedDate, { weekStartsOn: 1 })
    : viewMode === 'month'
    ? startOfMonth(selectedDate)
    : selectedDate;
    
  const endDate = viewMode === 'week'
    ? endOfWeek(selectedDate, { weekStartsOn: 1 })
    : viewMode === 'month'
    ? endOfMonth(selectedDate)
    : selectedDate;
  
  const { eventos, isLoading } = useCalendarioMultidisciplinar({
    responsavelId: filtroEspecialidade || undefined,
    dataInicio: startDate,
    dataFim: endDate
  });
  
  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    setSelectedDate(prev => addDays(prev, direction === 'next' ? days : -days));
  };
  
  const handleAbrirModal = (data?: Date) => {
    setDataInicialModal(data);
    setModalAberto(true);
  };
  
  const dias = eachDayOfInterval({ start: startDate, end: endDate });
  const horarios = Array.from({ length: 15 }, (_, i) => i + 6); // 06:00 - 21:00
  
  const getEventosHorario = (dia: Date, hora: number) => {
    if (!eventos) return [];
    return eventos.filter(e => {
      const inicio = new Date(e.data_inicio);
      return isSameDay(inicio, dia) && inicio.getHours() === hora;
    });
  };
  
  const isExpediente = (hora: number, dia: Date) => {
    const dow = dia.getDay();
    if (dow === 0) return false; // domingo
    if (dow === 6) return hora >= 9 && hora < 13; // sábado
    return (hora >= 9 && hora < 13) || (hora >= 14 && hora < 18); // seg-sex
  };
  
  const isJanelaFlex = (hora: number) => {
    return (hora >= 6 && hora < 9) || (hora >= 18 && hora < 21);
  };
  
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Calendário Multidisciplinar</h1>
        </div>
        
        {canEdit && (
          <div className="flex items-center gap-3">
            <Button 
              size="lg" 
              variant="default"
              onClick={() => handleAbrirModal()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setModalCaptacaoAberto(true)}
              className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950"
            >
              <Video className="mr-2 h-4 w-4" />
              Agendar Captação
            </Button>
          </div>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="calendario">📅 Calendário</TabsTrigger>
              <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {activeTab === 'calendario' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <CardTitle className="text-2xl">
                    {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                  </CardTitle>
                  
                  <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" onClick={() => setSelectedDate(new Date())}>
                    Hoje
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select value={filtroEspecialidade || 'todos'} onValueChange={(v) => setFiltroEspecialidade(v === 'todos' ? null : v)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as áreas</SelectItem>
                      <SelectItem value="criativo">Criativo</SelectItem>
                      <SelectItem value="audiovisual">Audiovisual</SelectItem>
                      <SelectItem value="grs">GRS</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                    <TabsList>
                      <TabsTrigger value="day">Dia</TabsTrigger>
                      <TabsTrigger value="week">Semana</TabsTrigger>
                      <TabsTrigger value="month">Mês</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-96 w-full" />
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-8 bg-muted">
                    <div className="col-span-1 p-2 border-b font-semibold">Hora</div>
                    {dias.slice(0, 7).map(dia => (
                      <div key={dia.toString()} className="p-2 border-b border-l text-center">
                        <div className="font-semibold">{format(dia, 'EEE', { locale: ptBR })}</div>
                        <div className="text-sm text-muted-foreground">{format(dia, 'd')}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="max-h-[600px] overflow-y-auto">
                    {horarios.map(hora => (
                      <div key={hora} className="grid grid-cols-8">
                        <div className="p-2 border-r border-b text-sm text-muted-foreground font-medium">
                          {hora.toString().padStart(2, '0')}:00
                        </div>
                        
                        {dias.slice(0, 7).map(dia => {
                          const eventosSlot = getEventosHorario(dia, hora);
                          const expediente = isExpediente(hora, dia);
                          const flex = isJanelaFlex(hora);
                          const dataHora = new Date(dia);
                          dataHora.setHours(hora, 0, 0, 0);
                          
                          return (
                            <div
                              key={`${dia}-${hora}`}
                              className={cn(
                                'relative border-r border-b min-h-[60px] p-1 cursor-pointer hover:bg-accent/50 transition-colors',
                                expediente && 'bg-background',
                                flex && 'bg-primary/5',
                                !expediente && !flex && 'bg-muted/30'
                              )}
                              onClick={() => handleAbrirModal(dataHora)}
                            >
                              {eventosSlot.map(evento => (
                                <EventoCard key={evento.id} evento={evento} compact />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Legenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-background border-2" />
                      <span>Expediente (bloqueável)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary/5 border-2" />
                      <span>Janela Flex (visível)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-muted/30 border-2" />
                      <span>Fora do expediente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-dashed" />
                      <span>Evento automático</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <CalendarioDashboard responsavelId={filtroEspecialidade || undefined} />
          )}
        </CardContent>
      </Card>
      
      <ModalCriarEvento
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        dataInicial={dataInicialModal}
      />
      
      <AudiovisualScheduleModal
        open={modalCaptacaoAberto}
        onOpenChange={setModalCaptacaoAberto}
        onScheduleCreated={() => {
          setModalCaptacaoAberto(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
