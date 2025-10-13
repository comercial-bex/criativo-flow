import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, BexDialogContent, BexDialogHeader, BexDialogTitle } from '@/components/ui/bex-dialog';
import { BexCard, BexCardContent, BexCardHeader, BexCardTitle } from '@/components/ui/bex-card';
import { BexBadge } from '@/components/ui/bex-badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  executor_area?: string;
  setor_responsavel?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  horas_trabalhadas?: number;
  observacoes?: string;
  checklist?: ChecklistItem[];
  checklist_progress?: number;
  tipo?: TipoTarefa;
  cliente_id?: string;
  capa_anexo_id?: string | null;
  numero_protocolo?: string | null;
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
  const { updateCoverAnexo } = useTaskCover(task?.id || '', task?.capa_anexo_id);

  useEffect(() => {
    if (task) {
      setChecklistItems(task.checklist || []);
      setEditData({
        horas_trabalhadas: task.horas_trabalhadas || 0,
        observacoes_trabalho: ''
      });
      
      // Carregar briefing da tabela briefings
      const loadBriefing = async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('briefings')
          .select('*')
          .eq('tarefa_id', task.id)
          .maybeSingle();
        
        if (data) {
          setBriefingEditData({
            objetivo_postagem: data.objetivo_postagem || '',
            publico_alvo: data.publico_alvo || '',
            formato_postagem: data.formato_postagem || '',
            call_to_action: data.call_to_action || '',
            hashtags: data.hashtags || '',
            descricao: data.descricao || '',
            observacoes: data.observacoes || '',
            contexto_estrategico: data.contexto_estrategico || '',
            data_fim: data.data_entrega || '',
            ambiente: data.ambiente || '',
            locucao: data.locucao || '',
          });
        }
      };
      
      loadBriefing();
    }
  }, [task]);

  if (!task) return null;

  // Parse briefing data from observacoes if it exists
  let briefingData = null;
  try {
    if (task.observacoes) {
      briefingData = JSON.parse(task.observacoes);
    }
  } catch (e) {
    // If parsing fails, treat as regular observacoes
    briefingData = null;
  }

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
  const toggleChecklistItem = (itemId: string) => {
    const updated = checklistItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updated);
    
    const newCompletedCount = updated.filter(item => item.completed).length;
    const newProgress = updated.length > 0 ? (newCompletedCount / updated.length) * 100 : 0;
    
    onTaskUpdate(task.id, {
      checklist: updated,
      checklist_progress: newProgress
    });
  };

  const addChecklistItem = () => {
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
    
    onTaskUpdate(task.id, {
      checklist: updated,
      checklist_progress: newProgress
    });
  };

  const removeChecklistItem = (itemId: string) => {
    const updated = checklistItems.filter(item => item.id !== itemId);
    setChecklistItems(updated);

    const newProgress = updated.length > 0 ? (updated.filter(i => i.completed).length / updated.length) * 100 : 0;
    
    onTaskUpdate(task.id, {
      checklist: updated,
      checklist_progress: newProgress
    });
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
        const { supabase } = await import('@/integrations/supabase/client');
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
      const { supabase } = await import('@/integrations/supabase/client');
      
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

  const priorityVariant = {
    'critica': 'destructive' as const,
    'alta': 'destructive' as const,
    'media': 'secondary' as const,
    'baixa': 'outline' as const
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BexDialogContent variant="gaming" className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <BexDialogHeader>
          <div className="space-y-3">
            {task.numero_protocolo && (
              <BexBadge variant="bexGaming" className="font-mono text-xs">
                📋 {task.numero_protocolo}
              </BexBadge>
            )}
            
            <BexDialogTitle gaming className="text-2xl pr-8">
              {task.titulo}
            </BexDialogTitle>
            
            <div className="flex flex-wrap items-center gap-3">
              <BexBadge variant="bexGlow">{task.status}</BexBadge>
              <BexBadge variant={priorityVariant[task.prioridade] || 'outline'}>
                {task.prioridade.charAt(0).toUpperCase() + task.prioridade.slice(1)}
              </BexBadge>
              
              {task.data_prazo && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(task.data_prazo), "PPP", { locale: ptBR })}
                </div>
              )}
            </div>
          </div>
        </BexDialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="info" className="data-[state=active]:bg-bex/20 data-[state=active]:text-bex">
              <FileText className="h-4 w-4 mr-2" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="briefing" className="data-[state=active]:bg-bex/20 data-[state=active]:text-bex">
              <Target className="h-4 w-4 mr-2" />
              Briefing
            </TabsTrigger>
            <TabsTrigger value="checklist" className="data-[state=active]:bg-bex/20 data-[state=active]:text-bex">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Checklist
                {totalCount > 0 && (
                  <BexBadge variant="bexGlow" className="ml-2">
                    {Math.round(progressPercentage)}%
                  </BexBadge>
                )}
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-bex/20 data-[state=active]:text-bex">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="anexos" className="data-[state=active]:bg-bex/20 data-[state=active]:text-bex">
              <Paperclip className="h-4 w-4 mr-2" />
              Anexos
            </TabsTrigger>
            <TabsTrigger value="atividades" className="data-[state=active]:bg-bex/20 data-[state=active]:text-bex">
              <Activity className="h-4 w-4 mr-2" />
              Atividades
            </TabsTrigger>
          </TabsList>

          {/* Informações Básicas */}
          <TabsContent value="info" className="mt-4 space-y-4">
            <BexCard variant="glow">
              <BexCardHeader>
                <BexCardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-bex" />
                  Informações Básicas
                </BexCardTitle>
              </BexCardHeader>
              <BexCardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {task.responsavel_nome && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-bex" />
                      <span className="font-medium">Responsável:</span>
                      <span className="text-muted-foreground">{task.responsavel_nome}</span>
                    </div>
                  )}
                  
                  {task.data_prazo && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-bex" />
                      <span className="font-medium">Prazo:</span>
                      <span className="text-muted-foreground">
                        {format(new Date(task.data_prazo), "PPP", { locale: ptBR })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-bex" />
                    <span className="font-medium">Horas:</span>
                    <span className="text-muted-foreground">{task.horas_trabalhadas || 0}h</span>
                  </div>

                  {task.executor_area && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-bex" />
                      <span className="font-medium">Área:</span>
                      <span className="text-muted-foreground">{task.executor_area}</span>
                    </div>
                  )}
                </div>

                {task.descricao && (
                  <>
                    <Separator className="bg-bex/20" />
                    <div>
                      <h4 className="font-medium mb-2 text-bex">Descrição</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{task.descricao}</p>
                    </div>
                  </>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                  Criado em {task.created_at ? format(new Date(task.created_at), "PPP 'às' HH:mm", { locale: ptBR }) : 'N/A'}
                </div>
              </BexCardContent>
            </BexCard>
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
                ) : briefingData ? (
                  <div className="space-y-4">
                    {briefingData.objetivo_postagem && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2 text-bex">
                          <Target className="h-4 w-4" />
                          Objetivo
                        </h4>
                        <p className="text-sm text-muted-foreground">{briefingData.objetivo_postagem}</p>
                      </div>
                    )}

                    {briefingData.publico_alvo && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2 text-bex">
                          <Users className="h-4 w-4" />
                          Público-Alvo
                        </h4>
                        <p className="text-sm text-muted-foreground">{briefingData.publico_alvo}</p>
                      </div>
                    )}

                    {briefingData.formato_postagem && (
                      <div>
                        <h4 className="font-medium mb-2 text-bex">Formato</h4>
                        <BexBadge variant="bexOutline">{briefingData.formato_postagem}</BexBadge>
                      </div>
                    )}

                    {briefingData.contexto_estrategico && (
                      <div>
                        <h4 className="font-medium mb-2 text-bex">Contexto Estratégico</h4>
                        <p className="text-sm text-muted-foreground">{briefingData.contexto_estrategico}</p>
                      </div>
                    )}

                    {briefingData.call_to_action && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2 text-bex">
                          <Zap className="h-4 w-4" />
                          Call to Action
                        </h4>
                        <p className="text-sm text-muted-foreground">{briefingData.call_to_action}</p>
                      </div>
                    )}

                    {briefingData.hashtags && briefingData.hashtags.length > 0 && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2 text-bex">
                          <Tag className="h-4 w-4" />
                          Hashtags
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {briefingData.hashtags.map((tag: string, index: number) => (
                            <BexBadge key={index} variant="secondary">
                              #{tag}
                            </BexBadge>
                          ))}
                        </div>
                      </div>
                    )}

                    {briefingData.observacoes && (
                      <div>
                        <h4 className="font-medium mb-2 text-bex">Observações do Briefing</h4>
                        <p className="text-sm text-muted-foreground">{briefingData.observacoes}</p>
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

          {/* Progresso do Trabalho */}
          <TabsContent value="progress" className="mt-4">
            <BexCard variant="glass">
              <BexCardHeader>
                <BexCardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-bex" />
                  Progresso do Trabalho
                </BexCardTitle>
              </BexCardHeader>
              <BexCardContent className="space-y-4">
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
                    
                    {briefingData?.observacoes_trabalho ? (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2 text-sm text-bex">Última atualização:</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{briefingData.observacoes_trabalho}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Nenhuma atualização de progresso registrada.</p>
                      </div>
                    )}
                  </div>
                )}
              </BexCardContent>
            </BexCard>
          </TabsContent>

          {/* Anexos */}
          <TabsContent value="anexos" className="mt-4">
            <BexCard variant="glass">
              <BexCardHeader>
                <BexCardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-bex" />
                  Anexos da Tarefa
                </BexCardTitle>
              </BexCardHeader>
              <BexCardContent>
                <AnexosGallery 
                  tarefaId={task.id} 
                  canEdit={true}
                  capaAtualId={task.capa_anexo_id}
                  onSetCapa={updateCoverAnexo}
                />
              </BexCardContent>
            </BexCard>
          </TabsContent>

          {/* Atividades */}
          <TabsContent value="atividades" className="mt-4">
            <BexCard variant="glass">
              <BexCardHeader>
                <BexCardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-bex" />
                  Timeline de Atividades
                </BexCardTitle>
              </BexCardHeader>
              <BexCardContent>
                <TaskActivities tarefaId={task.id} />
              </BexCardContent>
            </BexCard>
          </TabsContent>
        </Tabs>

        {/* Sidebar de Ações */}
        <Separator className="my-6" />
        
        <BexCard variant="glass">
          <BexCardHeader>
            <BexCardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-bex" />
              Ações da Tarefa
            </BexCardTitle>
          </BexCardHeader>
          <BexCardContent>
            <TaskActionsSidebar 
              tarefaId={task.id}
              onRefresh={() => {
                if (onTaskUpdate && task) {
                  onTaskUpdate(task.id, {});
                }
              }}
            />
          </BexCardContent>
        </BexCard>

        {/* Footer com Risk Level */}
        <div className="flex items-center justify-between pt-4 mt-6 border-t border-bex/20">
          <div className="flex items-center gap-2">
            <AlertCircle className={cn("h-5 w-5", riskLevel.color)} />
            <span className="text-sm text-muted-foreground">
              Nível de Risco: <span className={cn("font-semibold", riskLevel.color)}>
                {riskLevel.label}
              </span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {totalCount > 0 && (
              <CircleProgress
                value={completedCount}
                maxValue={totalCount}
                size={48}
                strokeWidth={4}
                getColor={(percentage) => {
                  if (percentage < 0.5) return "stroke-red-500";
                  if (percentage < 0.8) return "stroke-amber-500";
                  return "stroke-bex";
                }}
              />
            )}
          </div>
        </div>
      </BexDialogContent>
    </Dialog>
  );
}

