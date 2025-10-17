import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, BexDialogContent, BexDialogHeader, BexDialogTitle } from '@/components/ui/bex-dialog';
import { BexCard, BexCardContent, BexCardHeader, BexCardTitle } from '@/components/ui/bex-card';
import { BexBadge } from '@/components/ui/bex-badge';
import { Button } from '@/components/ui/button';

import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SmartStatusBadge } from '@/components/SmartStatusBadge';
import { CircleProgress } from '@/components/ui/circle-progress';
import { AnexosGallery } from '@/components/AnexosGallery';
import { BriefingEditForm } from '@/components/BriefingEditForm';
import { useTaskCover } from '@/hooks/useTaskCover';
import { TaskActivities } from '@/components/TaskActivities';
import { TaskActionsSidebar } from '@/components/TaskActionsSidebar';
import { TaskParticipants } from '@/components/TaskParticipants';
import { TaskTimer } from '@/components/TaskTimer';
import { TaskQuickTimeDialog } from '@/components/TaskQuickTimeDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import {
  Calendar, 
  Clock, 
  User, 
  Target, 
  Users, 
  FileText, 
  Zap,
  Tag,
  MessageSquare,
  Save,
  Edit,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  TrendingUp,
  Paperclip,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskWithDeadline } from '@/utils/statusUtils';
import { useToast } from '@/hooks/use-toast';
import { ChecklistItem } from '@/types/tarefa';
import type { TipoTarefa } from '@/types/tarefa';
import { cn } from '@/lib/utils';

interface KanbanTask extends TaskWithDeadline {
  descricao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  executor_id?: string;
  executor_area?: string;
  setor_responsavel?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  horas_trabalhadas?: number;
  observacoes?: string;
  checklist?: ChecklistItem[];
  checklist_progress?: number;
  tipo?: TipoTarefa;
  cliente_id?: string;
  projeto_id?: string;
  capa_anexo_id?: string | null;
  numero_protocolo?: string | null;
  labels?: Array<{color: string; text: string}>;
  kpis?: {
    briefing?: {
      id_cartao?: string;
      publico_alvo?: string;
      objetivo_postagem?: string;
      call_to_action?: string;
      formato_postagem?: string;
      contexto_estrategico?: string;
      hashtags?: string[];
      observacoes_gerais?: string;
      roteiro_audiovisual?: string;
    };
    metadados?: any;
    referencias?: any;
  };
}

interface TaskDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: KanbanTask | null;
  onTaskUpdate: (taskId: string, updates: Partial<KanbanTask>) => void;
}

export function TaskDetailsModal({ open, onOpenChange, task, onTaskUpdate }: TaskDetailsModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBriefing, setIsEditingBriefing] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [editData, setEditData] = useState({
    horas_trabalhadas: 0,
    observacoes_trabalho: ''
  });
  const [briefingEditData, setBriefingEditData] = useState<any>({});
  const [quickTimeDialogOpen, setQuickTimeDialogOpen] = useState(false);
  const [labelsDialogOpen, setLabelsDialogOpen] = useState(false);
  const [taskLabels, setTaskLabels] = useState<Array<{color: string; text: string}>>([]);
  const { updateCoverAnexo } = useTaskCover(task?.id || '', task?.capa_anexo_id);

  const LABEL_COLORS = [
    { name: 'Verde', value: 'bg-green-500', textClass: 'text-white' },
    { name: 'Azul', value: 'bg-blue-500', textClass: 'text-white' },
    { name: 'Amarelo', value: 'bg-yellow-500', textClass: 'text-white' },
    { name: 'Vermelho', value: 'bg-red-500', textClass: 'text-white' },
    { name: 'Roxo', value: 'bg-purple-500', textClass: 'text-white' },
    { name: 'Rosa', value: 'bg-pink-500', textClass: 'text-white' },
  ];

  useEffect(() => {
    if (task) {
      setChecklistItems(task.checklist || []);
      setTaskLabels(task.labels || []);
      setEditData({
        horas_trabalhadas: task.horas_trabalhadas || 0,
        observacoes_trabalho: ''
      });
      
      // Carregar briefing (prioridade: tabela briefings > kpis.briefing)
      const loadBriefing = async () => {
        try {
          // Tentar buscar da tabela briefings primeiro
          const { data: briefingTable } = await supabase
            .from('briefings')
            .select('*')
            .eq('tarefa_id', task.id)
            .maybeSingle();
          
          // Se encontrou na tabela, usar esses dados
          if (briefingTable) {
            console.log('[TaskDetailsModal] 📋 Briefing carregado da tabela "briefings"', briefingTable);
            setBriefingEditData({
              objetivo_postagem: briefingTable.objetivo_postagem || '',
              publico_alvo: briefingTable.publico_alvo || '',
              formato_postagem: briefingTable.formato_postagem || '',
              call_to_action: briefingTable.call_to_action || '',
              hashtags: briefingTable.hashtags || '',
              descricao: briefingTable.descricao || '',
              observacoes: briefingTable.observacoes || '',
              contexto_estrategico: briefingTable.contexto_estrategico || '',
              data_fim: briefingTable.data_entrega || '',
              ambiente: briefingTable.ambiente || '',
              locucao: briefingTable.locucao || '',
            });
            return;
          }
          
          // Se não encontrou na tabela, buscar em kpis.briefing
          if (task.kpis?.briefing) {
            console.log('[TaskDetailsModal] 📋 Briefing carregado de "kpis.briefing"', task.kpis.briefing);
            const kpisBriefing = task.kpis.briefing;
            setBriefingEditData({
              objetivo_postagem: kpisBriefing.objetivo_postagem || '',
              publico_alvo: kpisBriefing.publico_alvo || '',
              formato_postagem: kpisBriefing.formato_postagem || '',
              call_to_action: kpisBriefing.call_to_action || '',
              hashtags: Array.isArray(kpisBriefing.hashtags) ? kpisBriefing.hashtags.join(', ') : '',
              descricao: '',
              observacoes: kpisBriefing.observacoes_gerais || '',
              contexto_estrategico: kpisBriefing.contexto_estrategico || '',
              data_fim: '',
              ambiente: '',
              locucao: kpisBriefing.roteiro_audiovisual || '',
            });
            return;
          }
          
          console.log('[TaskDetailsModal] ⚠️ Nenhum briefing encontrado');
        } catch (error) {
          console.error('[TaskDetailsModal] ❌ Erro ao carregar briefing:', error);
        }
      };
      
      loadBriefing();
    }
  }, [task]);

  const handleToggleLabel = async (color: string, name: string) => {
    if (!task) return;
    const exists = taskLabels.find(l => l.color === color);
    let newLabels;
    
    if (exists) {
      newLabels = taskLabels.filter(l => l.color !== color);
    } else {
      newLabels = [...taskLabels, { color, text: name }];
    }
    
    setTaskLabels(newLabels);
    await onTaskUpdate(task.id, { labels: newLabels });
    toast({
      title: exists ? 'Etiqueta removida' : 'Etiqueta adicionada',
      variant: 'default'
    });
  };

  if (!task) return null;

  // Briefing data is now loaded in briefingEditData from useEffect

  // Calculate checklist progress
  const totalCount = checklistItems.length;
  const completedCount = checklistItems.filter(item => item.completed).length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Calculate risk level based on deadline and progress
  const getRiskLevel = () => {
    if (!task.data_prazo) {
      return { label: 'Sem Prazo', color: 'text-gray-500' };
    }

    const now = new Date();
    const deadline = new Date(task.data_prazo);
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { label: 'Vencida', color: 'text-red-500' };
    }

    if (daysRemaining <= 1 && progressPercentage < 80) {
      return { label: 'Crítico', color: 'text-red-500' };
    }

    if (daysRemaining <= 2 && progressPercentage < 50) {
      return { label: 'Alto', color: 'text-orange-500' };
    }

    if (daysRemaining <= 3 || progressPercentage < 30) {
      return { label: 'Médio', color: 'text-yellow-500' };
    }

    return { label: 'Baixo', color: 'text-green-500' };
  };

  const riskLevel = getRiskLevel();

  // Checklist handlers
  const toggleChecklistItem = async (itemId: string) => {
    const updated = checklistItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updated);
    
    const newCompletedCount = updated.filter(item => item.completed).length;
    const newProgress = updated.length > 0 ? (newCompletedCount / updated.length) * 100 : 0;
    
    try {
      await supabase
        .from('tarefa')
        .update({
          checklist: updated as any,
          checklist_progress: newProgress
        })
        .eq('id', task.id);
    } catch (error) {
      console.error('Erro ao atualizar checklist:', error);
    }
  };

  const addChecklistItem = async () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      completed: false
    };

    const updated = [...checklistItems, newItem];
    setChecklistItems(updated);
    setNewItemText("");

    const newProgress = updated.length > 0 ? (updated.filter(i => i.completed).length / updated.length) * 100 : 0;
    
    try {
      await supabase
        .from('tarefa')
        .update({
          checklist: updated as any,
          checklist_progress: newProgress
        })
        .eq('id', task.id);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const removeChecklistItem = async (itemId: string) => {
    const updated = checklistItems.filter(item => item.id !== itemId);
    setChecklistItems(updated);

    const newProgress = updated.length > 0 ? (updated.filter(i => i.completed).length / updated.length) * 100 : 0;
    
    try {
      await supabase
        .from('tarefa')
        .update({
          checklist: updated as any,
          checklist_progress: newProgress
        })
        .eq('id', task.id);
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const handleSaveWork = async () => {
    if (!task) return;
    
    try {
      // Atualizar horas trabalhadas na tarefa
      await onTaskUpdate(task.id, {
        horas_trabalhadas: editData.horas_trabalhadas,
      });

      // Se houver observações de trabalho, adicionar ao briefing
      if (editData.observacoes_trabalho) {
        const timestamp = new Date().toLocaleString('pt-BR');
        const novaObservacao = `[${timestamp}] ${editData.observacoes_trabalho}`;
        
        
        const { data: briefingAtual } = await supabase
          .from('briefings')
          .select('observacoes')
          .eq('tarefa_id', task.id)
          .maybeSingle();

        const observacoesAtualizadas = briefingAtual?.observacoes 
          ? `${briefingAtual.observacoes}\n\n${novaObservacao}`
          : novaObservacao;

        await supabase
          .from('briefings')
          .upsert({
            tarefa_id: task.id,
            cliente_id: task.cliente_id,
            titulo: task.titulo,
            observacoes: observacoesAtualizadas,
          }, {
            onConflict: 'tarefa_id'
          });
      }
      
      setIsEditing(false);
      setEditData(prev => ({ ...prev, observacoes_trabalho: '' }));
      toast({ title: "Progresso salvo com sucesso!" });
    } catch (error) {
      console.error('Error saving work progress:', error);
      toast({ title: "Erro ao salvar progresso", variant: "destructive" });
    }
  };

  const handleSaveBriefing = async () => {
    if (!task) return;
    
    try {
      
      // Salvar briefing na tabela briefings
      const { error } = await supabase
        .from('briefings')
        .upsert({
          tarefa_id: task.id,
          cliente_id: task.cliente_id,
          titulo: task.titulo,
          objetivo_postagem: briefingEditData.objetivo_postagem || null,
          publico_alvo: briefingEditData.publico_alvo || null,
          formato_postagem: briefingEditData.formato_postagem || null,
          call_to_action: briefingEditData.call_to_action || null,
          hashtags: briefingEditData.hashtags || null,
          descricao: briefingEditData.descricao || null,
          observacoes: briefingEditData.observacoes || null,
          contexto_estrategico: briefingEditData.contexto_estrategico || null,
          data_entrega: briefingEditData.data_fim || null,
          ambiente: briefingEditData.ambiente || null,
          locucao: briefingEditData.locucao || null,
        }, {
          onConflict: 'tarefa_id'
        });

      if (error) throw error;
      
      setIsEditingBriefing(false);
      toast({ title: "Briefing salvo com sucesso!" });
    } catch (error) {
      console.error('Error saving briefing:', error);
      toast({ title: "Erro ao salvar briefing", variant: "destructive" });
    }
  };

  const handleBriefingFieldChange = (field: string, value: any) => {
    setBriefingEditData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuickTimeSave = async (hours: number, observation: string) => {
    if (!task) return;

    const currentHours = task.horas_trabalhadas || 0;
    await handleSaveWork();
    
    setEditData({
      horas_trabalhadas: currentHours + hours,
      observacoes_trabalho: observation
    });

    // Trigger save
    await onTaskUpdate(task.id, {
      horas_trabalhadas: currentHours + hours,
    });

    if (observation) {
      const timestamp = new Date().toLocaleString('pt-BR');
      const novaObservacao = `[${timestamp}] ${observation}`;
      
      
      const { data: briefingAtual } = await supabase
        .from('briefings')
        .select('observacoes')
        .eq('tarefa_id', task.id)
        .maybeSingle();

      const observacoesAtualizadas = briefingAtual?.observacoes 
        ? `${briefingAtual.observacoes}\n\n${novaObservacao}`
        : novaObservacao;

      await supabase
        .from('briefings')
        .upsert({
          tarefa_id: task.id,
          cliente_id: task.cliente_id,
          titulo: task.titulo,
          observacoes: observacoesAtualizadas,
        }, {
          onConflict: 'tarefa_id'
        });
    }

    toast({ title: `✅ ${hours}h registradas com sucesso!` });
  };

  const handleTimerSave = async (hours: number) => {
    if (!task) return;

    const currentHours = task.horas_trabalhadas || 0;
    const newTotal = currentHours + hours;

    await onTaskUpdate(task.id, {
      horas_trabalhadas: newTotal,
    });

    toast({ 
      title: `⏱️ Cronômetro salvo!`, 
      description: `${hours.toFixed(2)}h adicionadas. Total: ${newTotal.toFixed(2)}h` 
    });
  };

  // Removed handleSaveDate - prazo field exists in header


  const priorityVariant = {
    'critica': 'destructive' as const,
    'alta': 'destructive' as const,
    'media': 'secondary' as const,
    'baixa': 'outline' as const
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BexDialogContent variant="gaming" size="2xl" height="xl" padding="none" overflow="hidden" aria-describedby="task-details-description">
        {/* Hidden description for accessibility */}
        <p id="task-details-description" className="sr-only">
          Visualize e edite os detalhes completos da tarefa, incluindo briefing, checklist, anexos e atividades.
        </p>
        
        {/* Header */}
        <BexDialogHeader className="modal-header-gaming">
          <div className="space-y-3">
            {task.numero_protocolo && (
              <BexBadge variant="bexGaming" className="font-mono text-xs">
                📋 {task.numero_protocolo}
              </BexBadge>
            )}
            
            <BexDialogTitle className="modal-title-gaming">
              {task.titulo}
            </BexDialogTitle>
            
            <div className="modal-badge-row">
              <BexBadge variant="bexGlow" className="text-xs">{task.status}</BexBadge>
              <BexBadge variant={priorityVariant[task.prioridade] || 'outline'} className="text-xs">
                {task.prioridade.charAt(0).toUpperCase() + task.prioridade.slice(1)}
              </BexBadge>
              
              {task.data_prazo && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.data_prazo), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              )}
            </div>

            {/* Labels */}
            {taskLabels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {taskLabels.map((label, idx) => (
                  <BexBadge 
                    key={idx}
                    className={cn(label.color, "text-white")}
                  >
                    {label.text}
                  </BexBadge>
                ))}
              </div>
            )}

            {/* Participantes da Tarefa */}
            <TaskParticipants
              tarefaId={task.id}
              responsavelId={task.responsavel_id}
              executorId={task.executor_id}
              clienteId={task.cliente_id}
              projetoId={task.projeto_id}
            />
          </div>
        </BexDialogHeader>

        {/* Layout 2 colunas: Conteúdo + Sidebar */}
        <div className="modal-body-2col h-[calc(90vh-180px)]">
          {/* Coluna Principal - Scroll Vertical */}
          <div className="modal-body-2col-main modal-scroll-area">
            <div className="space-y-6 p-6">
              
              {/* CARTÃO 1: Informações da Tarefa */}
              <BexCard variant="gaming" withGlow={true}>
                <BexCardHeader>
                  <BexCardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-bex" />
                    Informações da Tarefa
                  </BexCardTitle>
                </BexCardHeader>
                <BexCardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                {task.responsavel_nome && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <User className="h-4 w-4 text-bex shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase text-muted-foreground font-medium">Responsável</p>
                      <p className="text-xs font-medium truncate">{task.responsavel_nome}</p>
                    </div>
                  </div>
                )}
                
                {task.data_prazo && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Calendar className="h-4 w-4 text-bex shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase text-muted-foreground font-medium">Prazo</p>
                      <p className="text-xs font-medium">
                        {format(new Date(task.data_prazo), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <Clock className="h-4 w-4 text-bex shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase text-muted-foreground font-medium">Horas</p>
                    <p className="text-xs font-medium">{task.horas_trabalhadas || 0}h</p>
                  </div>
                </div>

                {task.executor_area && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <Tag className="h-4 w-4 text-bex shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase text-muted-foreground font-medium">Área</p>
                      <p className="text-xs font-medium truncate">{task.executor_area}</p>
                    </div>
                  </div>
                )}
              </div>

              {task.descricao && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <h4 className="text-xs font-semibold mb-2 text-bex uppercase">Descrição</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{task.descricao}</p>
                </div>
              )}

              <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                Criado em {task.created_at ? format(new Date(task.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'N/A'}
              </div>
            </div>

            <Separator className="bg-border/30" />

            {/* SEÇÃO 2: Progresso do Trabalho */}
            <div className="space-y-2">
              <h3 className="modal-section-header">
                <TrendingUp className="h-4 w-4" />
                Progresso do Trabalho
              </h3>

              {/* Botão Registrar Tempo Rápido */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setQuickTimeDialogOpen(true)}
                className="w-full border-bex/30 hover:bg-bex/10 hover:border-bex text-bex"
              >
                <Clock className="h-4 w-4 mr-2" />
                ⏱️ Registrar Tempo Rápido
              </Button>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="horas_trabalhadas">Horas Trabalhadas</Label>
                    <Input
                      id="horas_trabalhadas"
                      type="number"
                      value={editData.horas_trabalhadas}
                      onChange={(e) => setEditData({ ...editData, horas_trabalhadas: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="observacoes_trabalho">Observações do Trabalho</Label>
                    <Textarea
                      id="observacoes_trabalho"
                      value={editData.observacoes_trabalho}
                      onChange={(e) => setEditData({ ...editData, observacoes_trabalho: e.target.value })}
                      placeholder="Atualizações sobre o progresso, dificuldades encontradas, próximos passos..."
                      rows={5}
                    />
                  </div>

                  <Button onClick={handleSaveWork} className="w-full bg-bex hover:bg-bex/80">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Progresso
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-bex/5 rounded-lg">
                    <Clock className="h-5 w-5 text-bex" />
                    <span className="text-sm text-muted-foreground">
                      Horas trabalhadas: <span className="font-semibold text-foreground">{task.horas_trabalhadas || 0}h</span>
                    </span>
                  </div>
                  
                        {briefingEditData?.observacoes ? (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <h4 className="font-medium mb-2 text-sm text-bex">Última atualização:</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{briefingEditData.observacoes}</p>
                          </div>
                        ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Nenhuma atualização de progresso registrada.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator className="bg-border/30" />

            {/* SEÇÃO 3: Atividades Recentes */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-bex flex items-center gap-2 pb-2 border-b border-border/30">
                <Activity className="h-4 w-4" />
                Atividades Recentes
              </h3>
              <TaskActivities tarefaId={task.id} />
            </div>
          </TabsContent>

          {/* Briefing */}
          <TabsContent value="briefing" className="mt-4">
            <BexCard variant="glass">
              <BexCardHeader>
                <div className="flex items-center justify-between">
                  <BexCardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-bex" />
                    Briefing da Tarefa
                  </BexCardTitle>
                  <div className="flex gap-2">
                    {isEditingBriefing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingBriefing(false)}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      variant={isEditingBriefing ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isEditingBriefing) {
                          handleSaveBriefing();
                        } else {
                          setIsEditingBriefing(true);
                        }
                      }}
                      className={isEditingBriefing ? "bg-bex hover:bg-bex/80" : ""}
                    >
                      {isEditingBriefing ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </BexCardHeader>
              <BexCardContent>
                {isEditingBriefing ? (
                  <BriefingEditForm
                    tipoTarefa={task.tipo || 'outro'}
                    briefingData={briefingEditData}
                    onChange={handleBriefingFieldChange}
                  />
                ) : (briefingEditData.objetivo_postagem || briefingEditData.publico_alvo || briefingEditData.contexto_estrategico) ? (
                  <div className="space-y-4">
                    {briefingEditData.objetivo_postagem && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2 text-bex">
                          <Target className="h-4 w-4" />
                          Objetivo
                        </h4>
                        <p className="text-sm text-muted-foreground">{briefingEditData.objetivo_postagem}</p>
                      </div>
                    )}

                    {briefingEditData.publico_alvo && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2 text-bex">
                          <Users className="h-4 w-4" />
                          Público-Alvo
                        </h4>
                        <p className="text-sm text-muted-foreground">{briefingEditData.publico_alvo}</p>
                      </div>
                    )}

                    {briefingEditData.formato_postagem && (
                      <div>
                        <h4 className="font-medium mb-2 text-bex">Formato</h4>
                        <BexBadge variant="bexOutline">{briefingEditData.formato_postagem}</BexBadge>
                      </div>
                    )}

                    {briefingEditData.contexto_estrategico && (
                      <div>
                        <h4 className="font-medium mb-2 text-bex">Contexto Estratégico</h4>
                        <p className="text-sm text-muted-foreground">{briefingEditData.contexto_estrategico}</p>
                      </div>
                    )}

                    {briefingEditData.call_to_action && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2 text-bex">
                          <Zap className="h-4 w-4" />
                          Call to Action
                        </h4>
                        <p className="text-sm text-muted-foreground">{briefingEditData.call_to_action}</p>
                      </div>
                    )}

                    {briefingEditData.hashtags && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2 text-bex">
                          <Tag className="h-4 w-4" />
                          Hashtags
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {briefingEditData.hashtags.split(',').map((tag: string, index: number) => (
                            <BexBadge key={index} variant="secondary">
                              #{tag.trim()}
                            </BexBadge>
                          ))}
                        </div>
                      </div>
                    )}

                    {briefingEditData.observacoes && (
                      <div>
                        <h4 className="font-medium mb-2 text-bex">Observações do Briefing</h4>
                        <p className="text-sm text-muted-foreground">{briefingEditData.observacoes}</p>
                      </div>
                    )}
                    
                    {briefingEditData.locucao && (
                      <div>
                        <h4 className="font-medium mb-2 text-bex">Roteiro / Locução</h4>
                        <p className="text-sm text-muted-foreground">{briefingEditData.locucao}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Nenhum briefing disponível para esta tarefa.</p>
                    <p className="text-xs mt-1">Clique em "Editar" para adicionar informações.</p>
                  </div>
                )}
              </BexCardContent>
            </BexCard>
          </TabsContent>

          {/* Checklist */}
          <TabsContent value="checklist" className="mt-4">
            <BexCard variant="glow">
              <BexCardHeader>
                <div className="flex items-center justify-between">
                  <BexCardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-bex" />
                    Checklist de Etapas
                  </BexCardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingChecklist(!isEditingChecklist)}
                  >
                    {isEditingChecklist ? 'Concluir' : 'Gerenciar'}
                  </Button>
                </div>
              </BexCardHeader>
              <BexCardContent className="space-y-4">
                {/* Progress Bar */}
                {totalCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Progresso Geral</span>
                      <span className="font-semibold text-bex">
                        {completedCount}/{totalCount}
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-bex to-emerald-500 rounded-full"
                      />
                    </div>
                    <div className="text-xs text-right text-muted-foreground">
                      {Math.round(progressPercentage)}% Completo
                    </div>
                  </div>
                )}

                <Separator className="bg-bex/20" />

                {/* Add Item Input */}
                {isEditingChecklist && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="Nova etapa do checklist..."
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addChecklistItem()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={addChecklistItem} disabled={!newItemText.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {/* Checklist Items */}
                {totalCount > 0 ? (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {checklistItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-3 group p-2 rounded-lg hover:bg-bex/5 transition-colors"
                        >
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => toggleChecklistItem(item.id)}
                            className="data-[state=checked]:bg-bex data-[state=checked]:border-bex"
                          />
                          <span
                            className={cn(
                              "text-sm flex-1 transition-all",
                              item.completed && "line-through text-muted-foreground opacity-60"
                            )}
                          >
                            {item.text}
                          </span>
                          {item.completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            >
                              <CheckCircle2 className="h-4 w-4 text-bex" />
                            </motion.div>
                          )}
                          {isEditingChecklist && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChecklistItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhuma etapa no checklist ainda.</p>
                    <p className="text-xs mt-1">Clique em "Gerenciar" para adicionar itens.</p>
                  </div>
                )}
              </BexCardContent>
            </BexCard>
          </TabsContent>


          {/* Anexos */}
          <TabsContent value="anexos" className="mt-3">
            <AnexosGallery 
              tarefaId={task.id} 
              canEdit={true}
              capaAtualId={task.capa_anexo_id}
              onSetCapa={updateCoverAnexo}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar de Ações - Estilo Trello */}
      <div className="modal-body-2col-sidebar modal-scroll-area">
        <div className="space-y-4">
          {/* Ações */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Ações
            </h3>
            <TaskActionsSidebar 
              tarefaId={task.id}
              onRefresh={() => {
                if (onTaskUpdate && task) {
                  onTaskUpdate(task.id, {});
                }
              }}
              onOpenLabelsDialog={() => setLabelsDialogOpen(true)}
            />
          </div>

          <Separator className="bg-border/30" />

          {/* Indicador de Risco */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
              Status da Tarefa
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                <AlertCircle className={cn("h-4 w-4", riskLevel.color)} />
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Risco</p>
                  <p className={cn("text-xs font-semibold", riskLevel.color)}>
                    {riskLevel.label}
                  </p>
                </div>
              </div>

              {totalCount > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Progresso</p>
                    <p className="text-xs font-semibold">{completedCount}/{totalCount} itens</p>
                  </div>
                  <CircleProgress
                    value={completedCount}
                    maxValue={totalCount}
                    size={40}
                    strokeWidth={3}
                    getColor={(percentage) => {
                      if (percentage >= 80) return 'hsl(var(--bex))';
                      if (percentage >= 50) return 'hsl(142, 76%, 36%)';
                      if (percentage >= 25) return 'hsl(48, 96%, 53%)';
                      return 'hsl(0, 84%, 60%)';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Cronômetro de Trabalho */}
          <div>
            <TaskTimer 
              taskId={task.id} 
              onSaveTime={handleTimerSave}
            />
          </div>
        </div>
      </div>
    </div>

        {/* Dialog de Registro Rápido de Tempo */}
        <TaskQuickTimeDialog
          open={quickTimeDialogOpen}
          onOpenChange={setQuickTimeDialogOpen}
          onSave={handleQuickTimeSave}
        />

        {/* Dialog de Etiquetas */}
        <Dialog open={labelsDialogOpen} onOpenChange={setLabelsDialogOpen}>
          <BexDialogContent variant="gaming" size="sm" height="auto">
            <BexDialogHeader className="modal-header-gaming">
              <BexDialogTitle className="modal-title-gaming">
                🏷️ Gerenciar Etiquetas
              </BexDialogTitle>
            </BexDialogHeader>
            <div className="modal-body-gaming space-y-3">
              {LABEL_COLORS.map((label) => {
                const isSelected = taskLabels.some(l => l.color === label.value);
                return (
                  <button
                    key={label.value}
                    onClick={() => handleToggleLabel(label.value, label.name)}
                    className={cn(
                      "w-full p-3 rounded-lg border-2 transition-all text-left hover:scale-[1.02]",
                      isSelected 
                        ? "border-bex bg-bex/10" 
                        : "border-border hover:border-bex/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-6 h-6 rounded", label.value)} />
                      <span className="font-medium">{label.name}</span>
                      {isSelected && <CheckCircle2 className="h-5 w-5 ml-auto text-bex" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </BexDialogContent>
        </Dialog>
      </BexDialogContent>
    </Dialog>
  );
}

