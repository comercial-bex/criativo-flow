import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BexBadge } from '@/components/ui/bex-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TaskActivities } from '@/components/TaskActivities';
import { TaskActionsSidebar } from '@/components/TaskActionsSidebar';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  User, 
  Clock,
  Tag,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Eye,
  Edit3,
  X,
  Archive,
  Copy,
  Share,
  MoreHorizontal,
  Download,
  Upload,
  Calendar as DateIcon,
  Bell,
  CreditCard,
  Palette,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onTaskUpdate: (taskId: string, updates: any) => void;
  profiles?: any[];
  moduleType?: string;
}

// Etiquetas predefinidas
const predefinedLabels = [
  { id: 'urgente', name: 'Urgente', color: 'bg-red-500' },
  { id: 'importante', name: 'Importante', color: 'bg-orange-500' },
  { id: 'design', name: 'Design', color: 'bg-purple-500' },
  { id: 'conteudo', name: 'Conteúdo', color: 'bg-blue-500' },
  { id: 'aprovacao', name: 'Aprovação', color: 'bg-green-500' },
  { id: 'revisao', name: 'Revisão', color: 'bg-yellow-500' },
  { id: 'cliente', name: 'Cliente', color: 'bg-pink-500' },
  { id: 'interno', name: 'Interno', color: 'bg-gray-500' },
];

export function TrelloStyleTaskModal({ 
  isOpen, 
  onClose, 
  task, 
  onTaskUpdate, 
  profiles = [],
  moduleType = 'geral' 
}: TaskModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task || {});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    onTaskUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj = {
      id: Date.now().toString(),
      text: newComment,
      author: 'Usuário Atual', // TODO: pegar do contexto
      created_at: new Date().toISOString()
    };

    const updatedComments = [...(editedTask.comentarios || []), newCommentObj];
    setEditedTask(prev => ({ ...prev, comentarios: updatedComments }));
    setNewComment('');
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const newItem = {
      id: Date.now().toString(),
      text: newChecklistItem,
      completed: false
    };

    const updatedChecklist = [...(editedTask.checklist || []), newItem];
    setEditedTask(prev => ({ ...prev, checklist: updatedChecklist }));
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = (editedTask.checklist || []).map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setEditedTask(prev => ({ ...prev, checklist: updatedChecklist }));
  };

  const addLabel = (labelId: string) => {
    const currentLabels = editedTask.etiquetas || [];
    if (!currentLabels.includes(labelId)) {
      setEditedTask(prev => ({ 
        ...prev, 
        etiquetas: [...currentLabels, labelId] 
      }));
    }
    setShowLabels(false);
  };

  const removeLabel = (labelId: string) => {
    const updatedLabels = (editedTask.etiquetas || []).filter(id => id !== labelId);
    setEditedTask(prev => ({ ...prev, etiquetas: updatedLabels }));
  };

  const getLabel = (labelId: string) => predefinedLabels.find(label => label.id === labelId);

  const checklistProgress = editedTask.checklist ? 
    (editedTask.checklist.filter(item => item.completed).length / editedTask.checklist.length) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Conteúdo principal */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Header com título e protocolo */}
            <div className="flex items-start gap-3 mb-6">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1 space-y-2">
                {/* Número de Protocolo */}
                {task.numero_protocolo && (
                  <BexBadge variant="bexGaming" className="font-mono text-xs">
                    📋 {task.numero_protocolo}
                  </BexBadge>
                )}
                
                {/* Título */}
                {isEditing ? (
                  <Input
                    value={editedTask.titulo || ''}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, titulo: e.target.value }))}
                    className="text-xl font-semibold border-none p-0 focus:ring-0"
                    placeholder="Título da tarefa"
                  />
                ) : (
                  <h2 className="bex-title-secondary">{task.titulo}</h2>
                )}
                <p className="bex-text-muted">
                  em lista <strong>{task.status?.replace('_', ' ').toUpperCase()}</strong>
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Etiquetas */}
            {editedTask.etiquetas && editedTask.etiquetas.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Etiquetas</p>
                <div className="flex gap-1 flex-wrap">
                  {editedTask.etiquetas.map((labelId: string) => {
                    const label = getLabel(labelId);
                    return label ? (
                      <Badge 
                        key={labelId}
                        className={`${label.color} text-white hover:opacity-80 cursor-pointer`}
                        onClick={() => removeLabel(labelId)}
                      >
                        {label.name} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Descrição */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="h-4 w-4" />
                <p className="font-medium">Descrição</p>
                {!isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedTask.descricao || ''}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Adicione uma descrição mais detalhada..."
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>Salvar</Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md min-h-[60px]">
                  {task.descricao || 'Adicione uma descrição mais detalhada...'}
                </p>
              )}
            </div>

            {/* Checklist */}
            {editedTask.checklist && editedTask.checklist.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare className="h-4 w-4" />
                  <p className="font-medium">Checklist</p>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(checklistProgress)}%
                  </span>
                </div>
                
                {/* Barra de progresso */}
                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>

                {/* Items do checklist */}
                <div className="space-y-2 mb-3">
                  {editedTask.checklist.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="rounded border-gray-300"
                      />
                      <span className={cn(
                        "text-sm flex-1",
                        item.completed && "line-through text-muted-foreground"
                      )}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Adicionar novo item */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar um item"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  />
                  <Button size="sm" onClick={handleAddChecklistItem}>
                    Adicionar
                  </Button>
                </div>
              </div>
            )}

            {/* Anexos */}
            {editedTask.anexos && editedTask.anexos.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="h-4 w-4" />
                  <p className="font-medium">Anexos</p>
                </div>
                <div className="space-y-2">
                  {editedTask.anexos.map((anexo: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm flex-1">{anexo.name}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sistema de Atividades e Comentários */}
            <div className="mb-6">
              <TaskActivities tarefaId={task.id} />
            </div>
          </div>

          {/* Sidebar de ações */}
          <div className="w-48 bg-muted/50 p-4 border-l">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Adicionar ao cartão</p>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setShowLabels(true)}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Etiquetas
                  </Button>
                  
                  <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <DateIcon className="h-4 w-4 mr-2" />
                        Datas
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editedTask.data_prazo ? new Date(editedTask.data_prazo) : undefined}
                        onSelect={(date) => {
                          setEditedTask(prev => ({ 
                            ...prev, 
                            data_prazo: date?.toISOString() 
                          }));
                          setShowDatePicker(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Checklist
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Anexo
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Sidebar de Ações Integrada */}
              <TaskActionsSidebar 
                tarefaId={task.id}
                onRefresh={() => onTaskUpdate(task.id, {})}
              />

              {/* Informações da tarefa */}
              <Separator />
              
              <div className="space-y-3 text-xs text-muted-foreground">
                {task.data_prazo && (
                  <div>
                    <p className="font-medium">Prazo:</p>
                    <p>{format(new Date(task.data_prazo), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                )}
                
                {task.responsavel_nome && (
                  <div>
                    <p className="font-medium">Responsável:</p>
                    <p>{task.responsavel_nome}</p>
                  </div>
                )}
                
                {task.cliente_nome && (
                  <div>
                    <p className="font-medium">Cliente:</p>
                    <p>{task.cliente_nome}</p>
                  </div>
                )}
                
                <div>
                  <p className="font-medium">Criado em:</p>
                  <p>{format(new Date(task.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de etiquetas */}
        {showLabels && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-80">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Etiquetas
                  <Button variant="ghost" size="sm" onClick={() => setShowLabels(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predefinedLabels.map(label => (
                    <Button
                      key={label.id}
                      variant="ghost"
                      className={`w-full justify-start ${label.color} text-white hover:opacity-80`}
                      onClick={() => addLabel(label.id)}
                    >
                      {label.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}