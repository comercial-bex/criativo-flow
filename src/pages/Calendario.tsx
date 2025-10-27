import { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Plus, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCalendarioMultidisciplinar } from '@/hooks/useCalendarioMultidisciplinar';
import { ModalCriarEvento } from '@/components/Calendario/ModalCriarEvento';
import { CalendarioDashboard } from '@/components/Calendario/CalendarioDashboard';
import { AudiovisualScheduleModal } from '@/components/AudiovisualScheduleModal';
import { CalendarEventManager } from '@/components/Calendario/CalendarEventManager';
import { useUserRole } from '@/hooks/useUserRole';

export default function Calendario() {
  const { role } = useUserRole();
  const canEdit = ['admin', 'gestor', 'grs'].includes(role || '');
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [dataInicialModal, setDataInicialModal] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('calendario');
  const [modalCaptacaoAberto, setModalCaptacaoAberto] = useState(false);
  
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
  
  const { eventos, isLoading } = useCalendarioMultidisciplinar({
    responsavelId: filtroEspecialidade || undefined,
    dataInicio: startDate,
    dataFim: endDate
  });
  
  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setSelectedDate(new Date());
      return;
    }
    const days = 7;
    setSelectedDate(prev => addDays(prev, direction === 'next' ? days : -days));
  };
  
  const handleAbrirModal = (data?: Date) => {
    setDataInicialModal(data);
    setModalAberto(true);
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
              <div className="flex items-center gap-3 mb-4">
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
              </div>

              <CalendarEventManager
                events={eventos || []}
                currentDate={selectedDate}
                onNavigate={(direction) => navigateDate(direction)}
                onDateClick={(date) => canEdit && handleAbrirModal(date)}
                isLoading={isLoading}
              />

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
