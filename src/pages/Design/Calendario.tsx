import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Palette
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TarefaCalendario {
  id: string;
  titulo: string;
  descricao?: string;
  data_prazo: string;
  responsavel_id?: string;
  prioridade?: string;
  status: string;
  tempo_estimado?: number;
}

interface Profile {
  id: string;
  nome: string;
  avatar_url?: string;
}

interface EventoCalendario {
  id: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  tipo: string;
  responsavel_id?: string;
}

export default function DesignCalendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tarefas, setTarefas] = useState<TarefaCalendario[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [filtroDesigner, setFiltroDesigner] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreatingEvento, setIsCreatingEvento] = useState(false);
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    responsavel_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);

      // Buscar tarefas de design com deadline no mês
      const { data: tarefasData, error: tarefasError } = await supabase
        .from('tarefas')
        .select('*')
        .eq('tipo', 'design')
        .gte('data_prazo', format(startDate, 'yyyy-MM-dd'))
        .lte('data_prazo', format(endDate, 'yyyy-MM-dd'))
        .not('data_prazo', 'is', null);

      if (tarefasError) throw tarefasError;
      setTarefas(tarefasData || []);

      // Buscar eventos do calendário
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos_agenda')
        .select('*')
        .gte('data_inicio', format(startDate, 'yyyy-MM-dd'))
        .lte('data_inicio', format(endDate, 'yyyy-MM-dd'));

      if (eventosError) throw eventosError;
      setEventos(eventosData || []);

      // Buscar designers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('especialidade', 'design');

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

    } catch (error) {
      console.error('Erro ao buscar dados do calendário:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do calendário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async () => {
    if (!novoEvento.titulo.trim() || !novoEvento.data_inicio) {
      toast({
        title: "Erro",
        description: "Título e data são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingEvento(true);

      const { data, error } = await supabase
        .from('eventos_agenda')
        .insert({
          titulo: novoEvento.titulo,
          descricao: novoEvento.descricao || null,
          data_inicio: novoEvento.data_inicio,
          data_fim: novoEvento.data_fim || novoEvento.data_inicio,
          tipo: 'design',
          responsavel_id: novoEvento.responsavel_id || null
        })
        .select()
        .single();

      if (error) throw error;

      setEventos(prev => [...prev, data]);
      setNovoEvento({
        titulo: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        responsavel_id: ''
      });

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar evento.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingEvento(false);
    }
  };

  const getTarefasDoMes = () => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    const dias = eachDayOfInterval({ start: startDate, end: endDate });

    return dias.map(dia => {
      const tarefasDoDia = tarefas.filter(tarefa => 
        isSameDay(new Date(tarefa.data_prazo), dia) &&
        (filtroDesigner === '' || tarefa.responsavel_id === filtroDesigner)
      );
      
      const eventosDoDia = eventos.filter(evento => 
        isSameDay(new Date(evento.data_inicio), dia) &&
        (filtroDesigner === '' || evento.responsavel_id === filtroDesigner)
      );

      return {
        data: dia,
        tarefas: tarefasDoDia,
        eventos: eventosDoDia
      };
    });
  };

  const getTarefasSelecionadas = () => {
    if (!selectedDate) return [];
    
    return tarefas.filter(tarefa => 
      isSameDay(new Date(tarefa.data_prazo), selectedDate) &&
      (filtroDesigner === '' || tarefa.responsavel_id === filtroDesigner)
    );
  };

  const getEventosSelecionados = () => {
    if (!selectedDate) return [];
    
    return eventos.filter(evento => 
      isSameDay(new Date(evento.data_inicio), selectedDate) &&
      (filtroDesigner === '' || evento.responsavel_id === filtroDesigner)
    );
  };

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500 border-red-600';
      case 'media': return 'bg-yellow-500 border-yellow-600';
      case 'baixa': return 'bg-green-500 border-green-600';
      default: return 'bg-gray-400 border-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'briefing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'em_criacao': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'revisao_interna': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'aprovacao_cliente': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'entregue': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Calendário Design
          </h1>
          <p className="text-muted-foreground">Agenda de produção criativa</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Evento de Design</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={novoEvento.titulo}
                  onChange={(e) => setNovoEvento(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Reunião de briefing - Cliente X"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novoEvento.descricao}
                  onChange={(e) => setNovoEvento(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Detalhes do evento..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data Início</Label>
                  <Input
                    id="data_inicio"
                    type="datetime-local"
                    value={novoEvento.data_inicio}
                    onChange={(e) => setNovoEvento(prev => ({ ...prev, data_inicio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data Fim</Label>
                  <Input
                    id="data_fim"
                    type="datetime-local"
                    value={novoEvento.data_fim}
                    onChange={(e) => setNovoEvento(prev => ({ ...prev, data_fim: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="responsavel">Designer Responsável</Label>
                <Select
                  value={novoEvento.responsavel_id}
                  onValueChange={(value) => setNovoEvento(prev => ({ ...prev, responsavel_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar designer" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createEvento} disabled={isCreatingEvento} className="w-full">
                {isCreatingEvento ? "Criando..." : "Criar Evento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={filtroDesigner} onValueChange={setFiltroDesigner}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por designer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os designers</SelectItem>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentDate(new Date())}
        >
          Hoje
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                  <div key={dia} className="text-center font-medium text-muted-foreground py-2">
                    {dia}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {getTarefasDoMes().map(({ data, tarefas: tarefasDoDia, eventos: eventosDoDia }) => {
                  const isSelected = selectedDate && isSameDay(data, selectedDate);
                  const isToday = isSameDay(data, new Date());
                  const hasItems = tarefasDoDia.length > 0 || eventosDoDia.length > 0;
                  
                  return (
                    <div
                      key={data.toISOString()}
                      className={`
                        min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all
                        ${isSelected ? 'bg-primary/10 border-primary' : 'bg-background border-border hover:bg-muted/50'}
                        ${isToday ? 'ring-2 ring-primary/30' : ''}
                        ${hasItems ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' : ''}
                      `}
                      onClick={() => setSelectedDate(data)}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary font-bold' : ''}`}>
                        {format(data, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {tarefasDoDia.slice(0, 2).map((tarefa) => (
                          <div
                            key={tarefa.id}
                            className={`text-xs p-1 rounded truncate ${getPrioridadeColor(tarefa.prioridade)} text-white`}
                          >
                            {tarefa.titulo}
                          </div>
                        ))}
                        
                        {eventosDoDia.slice(0, 1).map((evento) => (
                          <div
                            key={evento.id}
                            className="text-xs p-1 rounded truncate bg-purple-100 text-purple-700 border border-purple-200"
                          >
                            📅 {evento.titulo}
                          </div>
                        ))}
                        
                        {(tarefasDoDia.length + eventosDoDia.length) > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{(tarefasDoDia.length + eventosDoDia.length) - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Day Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione um dia'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Tarefas do dia */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Tarefas ({getTarefasSelecionadas().length})
                  </h4>
                  <div className="space-y-2">
                    {getTarefasSelecionadas().map((tarefa) => {
                      const responsavel = profiles.find(p => p.id === tarefa.responsavel_id);
                      const isAtrasada = new Date(tarefa.data_prazo) < new Date() && tarefa.status !== 'entregue';
                      
                      return (
                        <div key={tarefa.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-sm">{tarefa.titulo}</h5>
                            {isAtrasada && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-xs ${getStatusColor(tarefa.status)}`}>
                              {tarefa.status}
                            </Badge>
                            <Badge className={`text-xs ${getPrioridadeColor(tarefa.prioridade)} text-white`}>
                              {tarefa.prioridade}
                            </Badge>
                          </div>
                          {responsavel && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={responsavel.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {responsavel.nome.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {responsavel.nome}
                              </span>
                            </div>
                          )}
                          {tarefa.tempo_estimado && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {tarefa.tempo_estimado}h
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {getTarefasSelecionadas().length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma tarefa neste dia
                      </p>
                    )}
                  </div>
                </div>

                {/* Eventos do dia */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Eventos ({getEventosSelecionados().length})
                  </h4>
                  <div className="space-y-2">
                    {getEventosSelecionados().map((evento) => {
                      const responsavel = profiles.find(p => p.id === evento.responsavel_id);
                      
                      return (
                        <div key={evento.id} className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h5 className="font-medium text-sm text-purple-900 dark:text-purple-100">
                            {evento.titulo}
                          </h5>
                          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                            {format(new Date(evento.data_inicio), 'HH:mm')} - {format(new Date(evento.data_fim), 'HH:mm')}
                          </p>
                          {responsavel && (
                            <div className="flex items-center gap-2 mt-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={responsavel.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {responsavel.nome.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-purple-700 dark:text-purple-300">
                                {responsavel.nome}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {getEventosSelecionados().length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum evento neste dia
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}