import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Video, Clock, MapPin, User, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AudiovisualScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId?: string;
  onScheduleCreated?: () => void;
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
      // Buscar filmmakers
      const { data: filmmakersData } = await supabase
        .from('profiles')
        .select('id, nome')
        .in('especialidade', ['filmmaker', 'audiovisual'])
        .eq('status', 'aprovado')
        .order('nome');

      setFilmmakers(filmmakersData || []);

      // Buscar clientes se não foi passado um específico
      if (!clienteId) {
        const { data: clientesData } = await supabase
          .from('clientes')
          .select('id, nome')
          .eq('status', 'ativo')
          .order('nome');

        setClientes(clientesData || []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const checkScheduleConflicts = async () => {
    if (!formData.data_captacao || !formData.especialista_id || !formData.horario_inicio) return;

    setCheckingConflicts(true);
    try {
      const targetDate = format(formData.data_captacao, 'yyyy-MM-dd');
      
      // Verificar conflitos na tabela de captações
      const { data: existingSchedules } = await supabase
        .from('captacoes_agenda')
        .select('*, clientes(nome)')
        .eq('especialista_id', formData.especialista_id)
        .gte('data_captacao', `${targetDate}T00:00:00`)
        .lte('data_captacao', `${targetDate}T23:59:59`);

      if (existingSchedules && existingSchedules.length > 0) {
        setConflicts(existingSchedules);
      } else {
        setConflicts([]);
      }
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
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
          .from('tarefas_projeto')
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

      // 4. Criar evento na agenda geral
      const dataFim = new Date(dataCaptacao);
      if (formData.horario_fim) {
        const [horaFim, minFim] = formData.horario_fim.split(':');
        dataFim.setHours(parseInt(horaFim), parseInt(minFim));
      } else {
        dataFim.setHours(dataCaptacao.getHours() + 2); // 2 horas por padrão
      }

      await supabase
        .from('eventos_agenda')
        .insert({
          titulo: `🎬 ${formData.titulo}`,
          descricao: formData.briefing,
          data_inicio: dataCaptacao.toISOString(),
          data_fim: dataFim.toISOString(),
          tipo: 'captacao',
          cor: '#f59e0b',
          cliente_id: formData.cliente_id,
          responsavel_id: formData.especialista_id
        });

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
        onScheduleCreated?.();
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-orange-500" />
            Agendar Captação Audiovisual
          </DialogTitle>
          <DialogDescription>
            Crie um agendamento que automaticamente gerará uma tarefa para o filmmaker
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Conflitos de agendamento */}
          {conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>⚠️ Conflito detectado!</strong> Já existe{conflicts.length > 1 ? 'm' : ''} {conflicts.length} agendamento{conflicts.length > 1 ? 's' : ''} para este especialista neste dia.
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