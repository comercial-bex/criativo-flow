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
  Edit3,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskWithDeadline } from '@/utils/statusUtils';
import { useToast } from '@/hooks/use-toast';
import { ChecklistItem } from '@/types/tarefa';
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
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [editData, setEditData] = useState({
    horas_trabalhadas: 0,
    observacoes_trabalho: ''
  });

  useEffect(() => {
    if (task) {
      setChecklistItems(task.checklist || []);
      setEditData({
        horas_trabalhadas: task.horas_trabalhadas || 0,
        observacoes_trabalho: ''
      });
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
  }

  // Checklist calculations
  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Risk level calculation
  const calculateRiskLevel = (): { level: "low" | "medium" | "high"; color: string; label: string } => {
    const now = new Date();
    const prazo = task.data_prazo ? new Date(task.data_prazo) : null;
    const progress = progressPercentage;
    
    if (!prazo) return { level: "medium", color: "text-amber-500", label: "Médio" };
    
    const daysRemaining = Math.ceil((prazo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Alto risco: <3 dias OU (<7 dias E <50% progresso)
    if (daysRemaining < 3 || (daysRemaining < 7 && progress < 50)) {
      return { level: "high", color: "text-red-500", label: "Alto" };
    }
    
    // Médio risco: <7 dias OU (<14 dias E <70% progresso)
    if (daysRemaining < 7 || (daysRemaining < 14 && progress < 70)) {
      return { level: "medium", color: "text-amber-500", label: "Médio" };
    }
    
    return { level: "low", color: "text-bex", label: "Baixo" };
  };

  const riskLevel = calculateRiskLevel();

  const getPriorityVariant = (prioridade: string): "destructive" | "secondary" | "outline" => {
    switch (prioridade) {
      case 'alta': return 'destructive';
      case 'media': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityText = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return '🔴 Alta';
      case 'media': return '🟡 Média';
      default: return '🟢 Baixa';
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    const updatedItems = checklistItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updatedItems);
    
    const newCompletedCount = updatedItems.filter(i => i.completed).length;
    const newProgress = totalCount > 0 ? Math.round((newCompletedCount / totalCount) * 100) : 0;
    
    onTaskUpdate(task.id, {
      checklist: updatedItems,
      checklist_progress: newProgress
    });

    toast({
      title: "Checklist atualizado!",
      description: `${newProgress}% completo`,
    });
  };

  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      completed: false,
      ordem: checklistItems.length
    };
    
    const updatedItems = [...checklistItems, newItem];
    setChecklistItems(updatedItems);
    onTaskUpdate(task.id, { checklist: updatedItems });
    setNewItemText("");
    
    toast({
      title: "Item adicionado!",
      description: "Novo item no checklist",
    });
  };

  const removeChecklistItem = (itemId: string) => {
    const updatedItems = checklistItems.filter(item => item.id !== itemId);
    setChecklistItems(updatedItems);
    
    const newCompletedCount = updatedItems.filter(i => i.completed).length;
    const newProgress = updatedItems.length > 0 ? Math.round((newCompletedCount / updatedItems.length) * 100) : 0;
    
    onTaskUpdate(task.id, { 
      checklist: updatedItems,
      checklist_progress: newProgress
    });
  };

  const handleSaveWork = () => {
    const updates = {
      horas_trabalhadas: editData.horas_trabalhadas,
      observacoes: briefingData 
        ? JSON.stringify({
            ...briefingData,
            observacoes_trabalho: editData.observacoes_trabalho
          })
        : editData.observacoes_trabalho
    };

    onTaskUpdate(task.id, updates);
    
    toast({
      title: "Trabalho atualizado!",
      description: "As informações de progresso foram salvas.",
    });
    
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BexDialogContent variant="gaming" className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <BexDialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <BexDialogTitle gaming className="text-2xl">{task.titulo}</BexDialogTitle>
              <div className="flex items-center flex-wrap gap-2">
                <SmartStatusBadge task={task} />
                <BexBadge variant={getPriorityVariant(task.prioridade)}>
                  {getPriorityText(task.prioridade)}
                </BexBadge>
                {task.setor_responsavel && (
                  <BexBadge variant="bexOutline">{task.setor_responsavel}</BexBadge>
                )}
                {totalCount > 0 && (
                  <BexBadge variant="bexGlow">
                    {completedCount}/{totalCount} ✓
                  </BexBadge>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="shrink-0"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>
        </BexDialogHeader>

        <Tabs defaultValue="info" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/20">
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
            {briefingData ? (
              <BexCard variant="glass">
                <BexCardHeader>
                  <BexCardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-bex" />
                    Briefing da Tarefa
                  </BexCardTitle>
                </BexCardHeader>
                <BexCardContent className="space-y-4">
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
                </BexCardContent>
              </BexCard>
            ) : (
              <BexCard variant="glass">
                <BexCardContent className="py-12 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum briefing disponível para esta tarefa.</p>
                </BexCardContent>
              </BexCard>
            )}
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
        </Tabs>

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
