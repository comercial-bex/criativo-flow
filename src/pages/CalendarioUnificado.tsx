import { useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Plus, AlertTriangle, Filter, Users, Grid3x3, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCalendarioUnificado } from '@/hooks/useCalendarioUnificado';
import { useConflictDetection } from '@/hooks/useConflictDetection';
import { usePessoasAtivas } from '@/hooks/usePessoasAtivas';
import { CalendarEventManager } from '@/components/Calendario/CalendarEventManager';
import { ModalCriarEvento } from '@/components/Calendario/ModalCriarEvento';
import { AudiovisualScheduleModal } from '@/components/AudiovisualScheduleModal';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarioUnificado() {
  const { role } = useUserRole();
  const canEdit = ['admin', 'gestor', 'grs'].includes(role || '');
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroOrigem, setFiltroOrigem] = useState<string>('todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalCaptacaoAberto, setModalCaptacaoAberto] = useState(false);
  const [dataInicialModal, setDataInicialModal] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('calendario');
  
  // Buscar pessoas ativas para o filtro de responsáveis
  const { data: pessoasAtivas = [], isLoading: loadingPessoas } = usePessoasAtivas();
  
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
  
  const { eventos, isLoading } = useCalendarioUnificado({
    responsavelId: filtroResponsavel !== 'todos' ? filtroResponsavel : undefined,
    tipo: filtroTipo,
    origem: filtroOrigem,
    dataInicio: startDate,
    dataFim: endDate
  });

  const { conflitos, hasConflitos, conflitosAlta, conflitosMedia } = useConflictDetection(eventos);

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

  // Estatísticas
  const stats = {
    total: eventos.length,
    captacoes: eventos.filter(e => e.tipo === 'captacao_externa' || e.tipo === 'captacao_interna').length,
    criacao: eventos.filter(e => e.tipo?.includes('criacao')).length,
    edicao: eventos.filter(e => e.tipo?.includes('edicao')).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Calendário Unificado</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os eventos em um só lugar
            </p>
          </div>
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

      {/* Alertas de Conflitos */}
      {hasConflitos && (
        <Alert variant={conflitosAlta.length > 0 ? "destructive" : "default"} className="border-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">
            {conflitosAlta.length > 0 ? '⚠️ Conflitos Críticos Detectados!' : '⚠️ Atenção: Sobrecarga'}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-1">
            {conflitosAlta.length > 0 && (
              <p className="font-medium">
                {conflitosAlta.length} conflito(s) de horário - eventos se sobrepõem
              </p>
            )}
            {conflitosMedia.length > 0 && (
              <p>
                {conflitosMedia.length} dia(s) com sobrecarga (&gt;3 eventos)
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {conflitos.slice(0, 3).map((conflito, idx) => (
                <Badge key={idx} variant={conflito.severidade === 'alta' ? 'destructive' : 'secondary'}>
                  {conflito.responsavel}: {conflito.mensagem}
                </Badge>
              ))}
              {conflitos.length > 3 && (
                <Badge variant="outline">+{conflitos.length - 3} mais</Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Grid3x3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Eventos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Captações</p>
                <p className="text-2xl font-bold">{stats.captacoes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criação</p>
                <p className="text-2xl font-bold">{stats.criacao}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Filter className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Edição</p>
                <p className="text-2xl font-bold">{stats.edicao}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="captacao_interna">Captação Interna</SelectItem>
                <SelectItem value="captacao_externa">Captação Externa</SelectItem>
                <SelectItem value="criacao_avulso">Criação Avulso</SelectItem>
                <SelectItem value="criacao_lote">Criação Lote</SelectItem>
                <SelectItem value="edicao_curta">Edição Curta</SelectItem>
                <SelectItem value="edicao_longa">Edição Longa</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
                <SelectItem value="planejamento">Planejamento</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
              <SelectTrigger>
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as áreas</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="audiovisual">Audiovisual</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="grs">GRS</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel} disabled={loadingPessoas}>
              <SelectTrigger>
                <SelectValue placeholder={loadingPessoas ? "Carregando..." : "Responsável"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {pessoasAtivas.map((pessoa) => (
                  <SelectItem key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendário Principal */}
      <Card>
        <CardContent className="p-6">
          <CalendarEventManager
            events={eventos}
            currentDate={selectedDate}
            onNavigate={navigateDate}
            onDateClick={(date) => canEdit && handleAbrirModal(date)}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded" />
              <span>Captação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span>Criação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded" />
              <span>Edição</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Planejamento</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de Criação */}
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
