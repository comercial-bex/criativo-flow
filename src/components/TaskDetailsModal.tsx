import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SmartStatusBadge } from '@/components/SmartStatusBadge';
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
  Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskWithDeadline } from '@/utils/statusUtils';
import { useToast } from '@/hooks/use-toast';

interface KanbanTask extends TaskWithDeadline {
  descricao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  executor_area?: string;
  setor_responsavel?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  horas_trabalhadas?: number;
  observacoes?: string;
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
  const [editData, setEditData] = useState({
    horas_trabalhadas: 0,
    observacoes_trabalho: ''
  });

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

  const getPriorityColor = (prioridade: string) => {
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl">{task.titulo}</DialogTitle>
              <div className="flex items-center gap-2">
                <SmartStatusBadge task={task} />
                <Badge variant={getPriorityColor(task.prioridade)}>
                  {getPriorityText(task.prioridade)}
                </Badge>
                <Badge variant="outline">{task.setor_responsavel}</Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {task.responsavel_nome && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Responsável:</span>
                    <span>{task.responsavel_nome}</span>
                  </div>
                )}
                
                {task.data_prazo && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Prazo:</span>
                    <span>{format(new Date(task.data_prazo), "PPP", { locale: ptBR })}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Horas:</span>
                  <span>{task.horas_trabalhadas || 0}h</span>
                </div>
              </div>

              {task.descricao && (
                <div>
                  <h4 className="font-medium mb-2">Descrição</h4>
                  <p className="text-sm text-muted-foreground">{task.descricao}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Briefing Information */}
          {briefingData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Briefing da Tarefa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {briefingData.objetivo_postagem && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      Objetivo
                    </h4>
                    <p className="text-sm text-muted-foreground">{briefingData.objetivo_postagem}</p>
                  </div>
                )}

                {briefingData.publico_alvo && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      Público-Alvo
                    </h4>
                    <p className="text-sm text-muted-foreground">{briefingData.publico_alvo}</p>
                  </div>
                )}

                {briefingData.formato_postagem && (
                  <div>
                    <h4 className="font-medium mb-2">Formato</h4>
                    <Badge variant="outline">{briefingData.formato_postagem}</Badge>
                  </div>
                )}

                {briefingData.contexto_estrategico && (
                  <div>
                    <h4 className="font-medium mb-2">Contexto Estratégico</h4>
                    <p className="text-sm text-muted-foreground">{briefingData.contexto_estrategico}</p>
                  </div>
                )}

                {briefingData.call_to_action && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4" />
                      Call to Action
                    </h4>
                    <p className="text-sm text-muted-foreground">{briefingData.call_to_action}</p>
                  </div>
                )}

                {briefingData.hashtags && briefingData.hashtags.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4" />
                      Hashtags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {briefingData.hashtags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {briefingData.observacoes && (
                  <div>
                    <h4 className="font-medium mb-2">Observações do Briefing</h4>
                    <p className="text-sm text-muted-foreground">{briefingData.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Work Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Progresso do Trabalho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleSaveWork} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Progresso
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Horas trabalhadas: <span className="font-medium">{task.horas_trabalhadas || 0}h</span>
                  </p>
                  
                  {briefingData?.observacoes_trabalho && (
                    <div>
                      <h4 className="font-medium mb-1">Última atualização:</h4>
                      <p className="text-sm text-muted-foreground">{briefingData.observacoes_trabalho}</p>
                    </div>
                  )}
                  
                  {!briefingData?.observacoes_trabalho && (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhuma atualização de progresso registrada.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}