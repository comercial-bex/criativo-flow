import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Video, Clock, MapPin, User, AlertTriangle, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCalendarioMultidisciplinar } from '@/hooks/useCalendarioMultidisciplinar';

interface AudiovisualScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId?: string;
  onScheduleCreated?: (captureData?: any) => void; // FASE 3: Retorna dados da captação
}

export function AudiovisualScheduleModal({ 
  open, 
  onOpenChange,
  clienteId,
  onScheduleCreated 
}: AudiovisualScheduleModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [filmmakers, setFilmmakers] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [suggestedSlot, setSuggestedSlot] = useState<any>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    cliente_id: clienteId || '',
    data_captacao: undefined as Date | undefined,
    horario_inicio: '',
    horario_fim: '',
    local: '',
    especialista_id: '',
    equipamentos: [] as string[],
    briefing: '',
    observacoes: ''
  });
  
  // ✅ Hook SEMPRE chamado para evitar violação de regras do React
  const calendarioHook = useCalendarioMultidisciplinar({
    responsavelId: formData.especialista_id || '', // String vazia se não selecionado
    dataInicio: new Date(),
    dataFim: new Date()
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (formData.data_captacao && formData.especialista_id && formData.horario_inicio) {
      checkScheduleConflicts();
    }
  }, [formData.data_captacao, formData.especialista_id, formData.horario_inicio]);

  const fetchData = async () => {
    try {
      // ✅ FASE 2: Verificar sessão antes de fazer queries
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente",
          variant: "destructive"
        });
        onOpenChange(false);
        return;
      }

      // Buscar filmmakers com tratamento de erro
      const { data: filmmakersData, error: filmmakersError } = await supabase
        .from('pessoas')
        .select('id, nome')
        .eq('status', 'aprovado')
        .order('nome');

      if (filmmakersError) {
        console.error('Erro ao buscar filmmakers:', filmmakersError);
        throw filmmakersError;
      }

      setFilmmakers(filmmakersData || []);

      // Buscar clientes se não foi passado um específico
      if (!clienteId) {
        const { data: clientesData, error: clientesError } = await supabase
          .from('clientes')
          .select('id, nome')
          .eq('status', 'ativo')
          .order('nome');

        if (clientesError) {
          console.error('Erro ao buscar clientes:', clientesError);
          throw clientesError;
        }

        setClientes(clientesData || []);
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error?.message || "Tente novamente ou recarregue a página",
        variant: "destructive"
      });
    }
  };

  // FASE 2: Validação cruzada de conflitos
  const checkScheduleConflicts = async () => {
    if (!formData.data_captacao || !formData.especialista_id || !formData.horario_inicio) return;

    setCheckingConflicts(true);
    const allConflicts: any[] = [];
    
    try {
      // ✅ FASE 2: Verificar sessão antes de queries
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente",
          variant: "destructive"
        });
        setCheckingConflicts(false);
        return;
      }

      const targetDate = format(formData.data_captacao, 'yyyy-MM-dd');
      const horarioInicio = `${targetDate}T${formData.horario_inicio}:00`;
      const horarioFim = formData.horario_fim 
        ? `${targetDate}T${formData.horario_fim}:00`
        : new Date(new Date(horarioInicio).getTime() + 2 * 60 * 60 * 1000).toISOString();

      // Consultas paralelas para verificar todos os tipos de conflito
      const [captacoes, eventos, tarefas] = await Promise.all([
        // 1. Captações existentes
        supabase
          .from('captacoes_agenda')
          .select('id, titulo, data_captacao, local, clientes(nome)')
          .eq('especialista_id', formData.especialista_id)
          .gte('data_captacao', `${targetDate}T00:00:00`)
          .lte('data_captacao', `${targetDate}T23:59:59`)
          .neq('status', 'cancelado'),
        
        // 2. Eventos bloqueantes
        supabase
          .from('eventos_calendario')
          .select('id, titulo, tipo, data_inicio, data_fim, local, projetos(titulo)')
          .eq('responsavel_id', formData.especialista_id)
          .eq('is_bloqueante', true)
          .gte('data_inicio', `${targetDate}T00:00:00`)
          .lte('data_inicio', `${targetDate}T23:59:59`),
        
        // 3. Tarefas prioritárias
        (supabase
          .from('tarefa')
          .select('id, titulo, prazo_executor, prioridade, projetos(titulo)')
          .eq('responsavel_id', formData.especialista_id)
          .eq('prazo_executor', targetDate)
          .in('prioridade', ['alta', 'critica'] as any)
          .neq('status', 'concluido' as any) as any)
      ]);

      // Verificar erros e logar
      if (captacoes.error) {
        console.error('Erro ao buscar captações:', captacoes.error);
      }
      if (eventos.error) {
        console.error('Erro ao buscar eventos:', eventos.error);
      }
      if (tarefas.error) {
        console.error('Erro ao buscar tarefas:', tarefas.error);
      }

      // Consolidar conflitos com identificação de tipo
      if (captacoes.data) allConflicts.push(...captacoes.data.map(c => ({ ...c, tipo: 'captacao' })));
      if (eventos.data) allConflicts.push(...eventos.data.map(e => ({ ...e, tipo: 'evento' })));
      if (tarefas.data) allConflicts.push(...tarefas.data.map(t => ({ ...t, tipo: 'tarefa' })));

      setConflicts(allConflicts);
    } catch (error: any) {
      console.error('Erro ao verificar conflitos:', error);
      toast({
        title: "Erro ao verificar conflitos",
        description: error?.message || "Não foi possível verificar conflitos de agenda",
        variant: "destructive"
      });
    } finally {
      setCheckingConflicts(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      cliente_id: clienteId || '',
      data_captacao: undefined,
      horario_inicio: '',
      horario_fim: '',
      local: '',
      especialista_id: '',
      equipamentos: [],
      briefing: '',
      observacoes: ''
    });
    setConflicts([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // CRÍTICO: Previne reload

    if (!formData.titulo || !formData.data_captacao || !formData.especialista_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, data e filmmaker responsável.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se há conflitos antes de criar
    if (conflicts.length > 0) {
      toast({
        title: "⚠️ Conflito de agendamento",
        description: "Já existe um agendamento para este especialista neste horário.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const dataCaptacao = new Date(formData.data_captacao);
      const [horaInicio, minInicio] = formData.horario_inicio.split(':');
      dataCaptacao.setHours(parseInt(horaInicio), parseInt(minInicio));

      // 1. Criar agendamento na agenda
      const { data: agendamento, error: agendamentoError } = await supabase
        .from('captacoes_agenda')
        .insert({
          titulo: formData.titulo,
          cliente_id: formData.cliente_id,
          especialista_id: formData.especialista_id,
          data_captacao: dataCaptacao.toISOString(),
          local: formData.local,
          equipamentos: formData.equipamentos,
          observacoes: `${formData.briefing}\n\n${formData.observacoes}`,
          status: 'agendado'
        })
        .select()
        .single();

      if (agendamentoError) throw agendamentoError;

      // 2. Buscar ou criar projeto para este cliente
      let projetoId = null;
      const { data: projetos } = await supabase
        .from('projetos')
        .select('id')
        .eq('cliente_id', formData.cliente_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (projetos && projetos.length > 0) {
        projetoId = projetos[0].id;
      }

      // 3. Criar tarefa vinculada para o Filmmaker
      if (projetoId) {
        const { error: tarefaError } = await supabase
          .from('tarefa')
          .insert({
            projeto_id: projetoId,
            titulo: `Captação: ${formData.titulo}`,
            descricao: formData.briefing,
            setor_responsavel: 'audiovisual',
            responsavel_id: formData.especialista_id,
            status: 'agendado',
            prioridade: 'alta',
            data_prazo: format(formData.data_captacao, 'yyyy-MM-dd'),
            observacoes: JSON.stringify({
              agendamento_id: agendamento.id,
              local: formData.local,
              horario: formData.horario_inicio,
              equipamentos: formData.equipamentos
            })
          });

        if (tarefaError) throw tarefaError;
      }

      // 4. Criar evento na agenda geral (FASE 4 - COMPLETO)
      const dataFim = new Date(dataCaptacao);
      if (formData.horario_fim) {
        const [horaFim, minFim] = formData.horario_fim.split(':');
        dataFim.setHours(parseInt(horaFim), parseInt(minFim));
      } else {
        dataFim.setHours(dataCaptacao.getHours() + 2); // 2 horas por padrão
      }

      // Buscar profile_id do especialista (CORRIGIDO)
      const { data: especialista } = await supabase
        .from('pessoas')
        .select('profile_id')
        .eq('id', formData.especialista_id)
        .single();

      if (!especialista?.profile_id) {
        console.error('⚠️ Especialista sem profile_id:', formData.especialista_id);
      }

      // Buscar user_id atual para created_by
      const { data: { user } } = await supabase.auth.getUser();

      const { error: eventoError } = await supabase
        .from('eventos_calendario')
        .insert({
          // Campos obrigatórios
          titulo: `📹 ${formData.titulo}`,
          tipo: 'captacao_externa' as const,
          responsavel_id: especialista?.profile_id || formData.especialista_id, // ✅ USA profile_id
          data_inicio: dataCaptacao.toISOString(),
          data_fim: dataFim.toISOString(),
          
          // Campos recomendados
          projeto_id: projetoId,
          cliente_id: formData.cliente_id,
          local: formData.local || null,
          equipamentos_ids: formData.equipamentos.length > 0 ? formData.equipamentos : null,
          descricao: formData.briefing || null,
          observacoes: JSON.stringify({
            agendamento_id: agendamento.id,
            tipo_captacao: 'externa',
            criado_automaticamente: true
          }),
          
          // Segurança e controle
          is_bloqueante: true, // ✅ CRÍTICO: Previne conflitos
          is_extra: false,
          status: 'agendado',
          created_by: user?.id || null
        });

      if (eventoError) {
        console.error('❌ Erro ao criar evento no calendário:', eventoError);
        toast({
          title: "⚠️ Aviso",
          description: "Agendamento criado, mas evento não foi adicionado ao calendário",
          variant: "destructive"
        });
      } else {
        console.log('✅ Evento criado no calendário com sucesso');
      }

      // 5. Criar notificação para o Filmmaker
      await supabase
        .from('notificacoes')
        .insert({
          user_id: formData.especialista_id,
          titulo: '📹 Nova Captação Agendada',
          mensagem: `Você foi atribuído à captação "${formData.titulo}" em ${format(formData.data_captacao, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
          tipo: 'info',
          data_evento: dataCaptacao.toISOString()
        });

      // Fechar modal antes do toast
      onOpenChange(false);

      toast({
        title: "✅ Agendamento criado com sucesso!",
        description: `Captação agendada e tarefa criada automaticamente para o filmmaker.`,
      });

      // Limpar após fechar
      setTimeout(() => {
        resetForm();
        // FASE 3: Retornar dados da captação criada
        onScheduleCreated?.({
          id: agendamento.id,
          titulo: formData.titulo,
          cliente_id: formData.cliente_id,
          especialista_id: formData.especialista_id,
          projeto_id: projetoId,
          briefing: formData.briefing,
          data_captacao: formData.data_captacao
        });
      }, 300);

    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "❌ Erro ao criar agendamento",
        description: error?.message || "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" height="xl" overflow="auto">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming flex items-center gap-2">
            <Video className="h-5 w-5" />
            Agendar Captação Audiovisual
          </DialogTitle>
          <DialogDescription>
            Crie um agendamento que automaticamente gerará uma tarefa para o filmmaker
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* FASE 2: Conflitos de agendamento aprimorados */}
          {conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <strong>⚠️ Conflito detectado!</strong> {conflicts.length} conflito{conflicts.length > 1 ? 's' : ''} encontrado{conflicts.length > 1 ? 's' : ''}:
                <div className="space-y-1 mt-2">
                  {conflicts.map((conflict: any, idx: number) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      {conflict.tipo === 'captacao' && '📹'}
                      {conflict.tipo === 'evento' && '📅'}
                      {conflict.tipo === 'tarefa' && '✅'}
                      <span>{conflict.titulo}</span>
                      {conflict.data_captacao && (
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(conflict.data_captacao), 'HH:mm')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* PRIORIDADE 1: Sugestão inteligente de horário */}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-3"
                  onClick={async () => {
                    if (!formData.data_captacao || !formData.especialista_id) return;
                    
                    try {
                      if (!calendarioHook?.sugerirSlot) {
                        toast({
                          title: "Erro",
                          description: "Selecione um filmmaker primeiro",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      const targetDate = format(formData.data_captacao, 'yyyy-MM-dd');
                      const sugestao = await calendarioHook.sugerirSlot({
                        responsavelId: formData.especialista_id,
                        duracaoMinutos: 120,
                        dataPreferida: targetDate,
                        tipoEvento: 'captacao_externa'
                      });
                      
                      // FASE 3: Type guard simplificado com verificação de tipo
                      if (
                        sugestao && 
                        typeof sugestao === 'object' && 
                        !Array.isArray(sugestao) &&
                        'data_inicio' in sugestao && 
                        'data_fim' in sugestao
                      ) {
                        const dataInicioStr = String((sugestao as any).data_inicio);
                        const dataFimStr = String((sugestao as any).data_fim);
                        
                        const novaData = new Date(dataInicioStr);
                        const novaDataFim = new Date(dataFimStr);
                        
                        if (!isNaN(novaData.getTime()) && !isNaN(novaDataFim.getTime())) {
                          setSuggestedSlot({
                            data: novaData,
                            horario_inicio: format(novaData, 'HH:mm'),
                            horario_fim: format(novaDataFim, 'HH:mm')
                          });
                          
                          toast({
                            title: "💡 Horário sugerido",
                            description: `${format(novaData, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
                          });
                        } else {
                          throw new Error('Datas inválidas retornadas');
                        }
                      } else {
                        toast({
                          title: "❌ Sem horários disponíveis",
                          description: "Tente outro dia ou especialista",
                          variant: "destructive"
                        });
                      }
                    } catch (error) {
                      console.error('❌ Erro ao sugerir horário:', error);
                      toast({
                        title: "Erro ao sugerir horário",
                        description: error instanceof Error ? error.message : "Tente outro dia ou horário",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Sugerir horário alternativo
                </Button>
                
                {suggestedSlot && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <p className="font-medium text-green-800">Horário sugerido:</p>
                    <p className="text-green-700">
                      {format(suggestedSlot.data, "dd/MM/yyyy", { locale: ptBR })} das {suggestedSlot.horario_inicio} às {suggestedSlot.horario_fim}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          data_captacao: suggestedSlot.data,
                          horario_inicio: suggestedSlot.horario_inicio,
                          horario_fim: suggestedSlot.horario_fim
                        });
                        setConflicts([]);
                        setSuggestedSlot(null);
                        toast({
                          title: "✅ Horário aplicado",
                          description: "Sugestão aplicada ao formulário"
                        });
                      }}
                    >
                      Aplicar sugestão
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="titulo">Título da Captação *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Captação institucional - Cliente X"
                required
              />
            </div>

            {!clienteId && (
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Select 
                  value={formData.cliente_id} 
                  onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="filmmaker">Filmmaker *</Label>
              <Select 
                value={formData.especialista_id} 
                onValueChange={(value) => setFormData({ ...formData, especialista_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar filmmaker" />
                </SelectTrigger>
                <SelectContent>
                  {filmmakers.map(filmmaker => (
                    <SelectItem key={filmmaker.id} value={filmmaker.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {filmmaker.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {checkingConflicts && (
                <p className="text-xs text-muted-foreground mt-1">Verificando disponibilidade...</p>
              )}
            </div>

            <div>
              <Label>Data da Captação *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_captacao && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_captacao ? format(formData.data_captacao, "PPP", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_captacao}
                    onSelect={(date) => setFormData({ ...formData, data_captacao: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="horario_inicio">Horário Início *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="horario_inicio"
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="horario_fim">Horário Fim (opcional)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="horario_fim"
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="local">Local da Captação</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                  placeholder="Ex: Sede da empresa - Rua X, 123"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="briefing">Briefing Resumido *</Label>
              <Textarea
                id="briefing"
                value={formData.briefing}
                onChange={(e) => setFormData({ ...formData, briefing: e.target.value })}
                placeholder="Descreva o que precisa ser capturado, estilo desejado, etc."
                rows={3}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações extras, contatos no local, etc."
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={loading || conflicts.length > 0}
              className="flex-1"
            >
              {loading ? "Criando..." : "✅ Confirmar Agendamento"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>

          {formData.data_captacao && formData.especialista_id && (
            <div className="text-xs text-muted-foreground border-t pt-4">
              <strong>Automação:</strong> Ao confirmar, o sistema irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Criar agendamento na agenda do filmmaker</li>
                <li>Gerar tarefa vinculada automaticamente</li>
                <li>Adicionar evento no calendário geral</li>
                <li>Enviar notificação para o especialista</li>
              </ul>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}