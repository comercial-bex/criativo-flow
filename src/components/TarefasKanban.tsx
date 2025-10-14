import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Circle,
  MoreHorizontal,
  Calendar,
  User,
  Edit,
  Paperclip,
  Download,
  X
} from "lucide-react";
import { DndContext, DragEndEvent, closestCorners, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreateTaskModal } from "./CreateTaskModal";

interface TarefasKanbanProps {
  planejamento: {
    id: string;
  };
  clienteId: string;
  projetoId: string;
  filters?: {
    tipo?: string;
    prioridade?: string;
    responsavel_id?: string;
    search?: string;
  };
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade?: string;
  prazo_executor?: string;
  data_prazo?: string; // Mapped from prazo_executor for UI compatibility
  responsavel_id?: string;
  tipo?: string;
  tempo_estimado?: number;
  created_at?: string;
  anexos?: any;
  [key: string]: any;
}

interface Profile {
  id: string;
  nome: string;
  avatar_url?: string;
}

const colunas = [
  { 
    id: 'backlog', 
    titulo: 'Backlog', 
    cor: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
    icon: '📋',
    accentColor: 'border-gray-300 dark:border-gray-600'
  },
  { 
    id: 'to_do', 
    titulo: 'Para Fazer', 
    cor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
    icon: '📝',
    accentColor: 'border-blue-300 dark:border-blue-600'
  },
  { 
    id: 'em_andamento', 
    titulo: 'Em Andamento', 
    cor: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30',
    icon: '⚡',
    accentColor: 'border-yellow-300 dark:border-yellow-600'
  },
  { 
    id: 'em_revisao', 
    titulo: 'Em Revisão', 
    cor: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
    icon: '👀',
    accentColor: 'border-purple-300 dark:border-purple-600'
  },
  { 
    id: 'concluida', 
    titulo: 'Concluída', 
    cor: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
    icon: '✅',
    accentColor: 'border-green-300 dark:border-green-600'
  },
];

interface TarefaCardProps {
  tarefa: Tarefa;
  profiles: Profile[];
  onUpdateStatus: (tarefaId: string, novoStatus: string) => void;
  onEditTarefa: (tarefa: Tarefa) => void;
}

function TarefaCard({ tarefa, profiles, onUpdateStatus, onEditTarefa }: TarefaCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarefa.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const responsavel = profiles.find(p => p.id === tarefa.responsavel_id);

  const getPrioridadeConfig = (prioridade?: string) => {
    switch (prioridade) {
      case 'alta': 
        return { 
          color: 'bg-red-500', 
          badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
          icon: '🔴'
        };
      case 'media': 
        return { 
          color: 'bg-yellow-500', 
          badge: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300',
          icon: '🟡'
        };
      case 'baixa': 
        return { 
          color: 'bg-green-500', 
          badge: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300',
          icon: '🟢'
        };
      default: 
        return { 
          color: 'bg-gray-400', 
          badge: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
          icon: '⚪'
        };
    }
  };

  const getTipoConfig = (tipo?: string) => {
    switch (tipo) {
      case 'design': return { icon: '🎨', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300' };
      case 'conteudo': return { icon: '📝', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300' };
      case 'aprovacao': return { icon: '✅', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'publicacao': return { icon: '📢', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300' };
      case 'revisao': return { icon: '🔍', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300' };
      default: return { icon: '📋', color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300' };
    }
  };

  const isAtrasada = tarefa.data_prazo && new Date(tarefa.data_prazo) < new Date() && tarefa.status !== 'concluida';
  const prioridadeConfig = getPrioridadeConfig(tarefa.prioridade);
  const tipoConfig = getTipoConfig(tarefa.tipo);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 
        cursor-grab active:cursor-grabbing 
        hover:shadow-lg hover:scale-[1.02] hover:border-primary/30
        transition-all duration-200 ease-in-out
        group
        ${isDragging ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-primary/20' : ''}
        ${isAtrasada ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}
      `}
    >
      {/* Barra de prioridade */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${prioridadeConfig.color}`} />
      
      <div className="p-4 space-y-3">
        {/* Header com título e menu */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
            {tarefa.titulo}
          </h4>
          <div className="flex items-center gap-1">
            {isAtrasada && (
              <div className="p-1 bg-red-100 dark:bg-red-900 rounded-full">
                <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
              </div>
            )}
            <button 
              onClick={() => onEditTarefa(tarefa)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <Edit className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Descrição */}
        {tarefa.descricao && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {tarefa.descricao}
          </p>
        )}

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {tarefa.prioridade && (
            <Badge className={`text-xs px-2 py-0.5 font-medium border ${prioridadeConfig.badge}`}>
              {prioridadeConfig.icon} {tarefa.prioridade}
            </Badge>
          )}
          {tarefa.tipo && (
            <Badge className={`text-xs px-2 py-0.5 font-medium border ${tipoConfig.color}`}>
              {tipoConfig.icon} {tarefa.tipo}
            </Badge>
          )}
        </div>

        {/* Footer com data e responsável */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">
                {tarefa.data_prazo ? format(new Date(tarefa.data_prazo), 'dd/MM', { locale: ptBR }) : 'Sem prazo'}
              </span>
            </div>
          </div>
          
          {responsavel && (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-6 w-6 ring-2 ring-white dark:ring-gray-900 shadow-sm">
                <AvatarImage src={responsavel.avatar_url} />
                <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-primary/80 text-white">
                  {responsavel.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 max-w-[60px] truncate">
                {responsavel.nome.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Tempo estimado e anexos */}
        <div className="flex items-center gap-2">
          {tarefa.tempo_estimado && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md w-fit">
              <Clock className="h-3 w-3" />
              <span>{tarefa.tempo_estimado}h</span>
            </div>
          )}
          {tarefa.anexos && tarefa.anexos.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md w-fit">
              <Paperclip className="h-3 w-3" />
              <span>{tarefa.anexos.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TarefasKanban({ planejamento, clienteId, projetoId, filters }: TarefasKanbanProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [projetoId, filters]);

  const fetchData = async () => {
    try {
      // Buscar tarefas
      const { data: tarefasData, error: tarefasError } = await supabase
        .from('tarefa')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (tarefasError) throw tarefasError;
      
      // Mapear prazo_executor para data_prazo para compatibilidade com UI
      const tarefasProcessadas = (tarefasData || []).map(t => ({
        ...t,
        data_prazo: t.prazo_executor
      }));
      
      setTarefas(tarefasProcessadas);

      // Buscar profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const tarefaId = active.id as string;
    const novoStatus = over.id as string;

    // Verificar se é uma coluna válida
    const colunaValida = colunas.find(col => col.id === novoStatus);
    if (!colunaValida) return;

    await updateTarefaStatus(tarefaId, novoStatus);
  };

  const updateTarefaStatus = async (tarefaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('tarefa')
        .update({ status: novoStatus as any })
        .eq('id', tarefaId);

      if (error) throw error;

      setTarefas(prev => prev.map(tarefa => 
        tarefa.id === tarefaId ? { ...tarefa, status: novoStatus } : tarefa
      ));

      toast({
        title: "Sucesso",
        description: "Status da tarefa atualizado!",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleTaskCreate = async (taskData: any) => {
    try {
      // Mapear executor_area antes de inserir
      const mapearExecutorArea = (setor: string | null): string | null => {
        const mapeamento: Record<string, string> = {
          'audiovisual': 'Audiovisual',
          'design': 'Criativo',
          'grs': 'Criativo',
          'atendimento': 'Criativo'
        };
        return setor ? (mapeamento[setor] || null) : null;
      };

      const { data, error } = await supabase
        .from('tarefa')
        .insert({
          projeto_id: taskData.projeto_id,
          cliente_id: taskData.cliente_id,
          titulo: taskData.titulo,
          descricao: taskData.descricao,
          prioridade: taskData.prioridade,
          status: taskData.status || 'backlog',
          executor_id: taskData.executor_id,
          executor_area: mapearExecutorArea(taskData.executor_area),
          prazo_executor: taskData.prazo_executor || taskData.data_prazo,
          origem: taskData.origem || 'avulsa',
          tipo: taskData.tipo || null,
          setor_responsavel: taskData.setor_responsavel,
          responsavel_id: taskData.responsavel_id,
          kpis: taskData.kpis || {}
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      await fetchData();

      return data;
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  };

  const getTarefasPorStatus = (status: string) => {
    return tarefas.filter(tarefa => tarefa.status === status);
  };

  const updateTarefa = async (tarefaId: string, updates: any) => {
    try {
      // Mapear data_prazo para prazo_executor
      const mappedUpdates = { ...updates };
      if (updates.data_prazo) {
        mappedUpdates.prazo_executor = updates.data_prazo;
        delete mappedUpdates.data_prazo;
      }
      
      // Remover campos que não existem na tabela
      delete mappedUpdates.tempo_estimado;
      delete mappedUpdates.anexos;

      const { error } = await supabase
        .from('tarefa')
        .update(mappedUpdates)
        .eq('id', tarefaId);

      if (error) throw error;

      await fetchData();

      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa.",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (file: File, tarefaId: string) => {
    try {
      setUploadingFile(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${tarefaId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Buscar tarefa atual para pegar anexos existentes
      const tarefa = tarefas.find(t => t.id === tarefaId);
      const anexosAtuais = tarefa?.anexos || [];
      
      const novoAnexo = {
        name: file.name,
        path: fileName,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };

      const novosAnexos = [...anexosAtuais, novoAnexo];

      await updateTarefa(tarefaId, { anexos: novosAnexos });

      toast({
        title: "Sucesso",
        description: "Arquivo anexado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao anexar arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const removeAttachment = async (tarefaId: string, attachmentPath: string) => {
    try {
      // Remove do storage
      const { error: storageError } = await supabase.storage
        .from('task-attachments')
        .remove([attachmentPath]);

      if (storageError) throw storageError;

      // Remove da lista de anexos
      const tarefa = tarefas.find(t => t.id === tarefaId);
      const anexosAtualizados = (tarefa?.anexos || []).filter((anexo: any) => anexo.path !== attachmentPath);

      await updateTarefa(tarefaId, { anexos: anexosAtualizados });

      toast({
        title: "Sucesso",
        description: "Anexo removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover anexo.",
        variant: "destructive",
      });
    }
  };

  const downloadAttachment = async (attachmentPath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .download(attachmentPath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar anexo.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="h-96 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de nova tarefa */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tarefas do Projeto</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as tarefas com workflow de aprovação
          </p>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Modal de Criação Completo */}
      <CreateTaskModal 
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        projetoId={projetoId}
        clienteId={clienteId}
        defaultStatus="backlog"
        onTaskCreate={handleTaskCreate}
      />

      {/* Modal de Edição */}
      <Dialog open={!!editingTarefa} onOpenChange={() => setEditingTarefa(null)}>
        <DialogContent size="xl" height="xl" overflow="auto">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da tarefa
            </DialogDescription>
          </DialogHeader>
            {editingTarefa && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={editingTarefa.titulo}
                      onChange={(e) => setEditingTarefa({...editingTarefa, titulo: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select 
                      value={editingTarefa.tipo || 'conteudo'} 
                      onValueChange={(value) => setEditingTarefa({...editingTarefa, tipo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conteudo">📝 Criação de Conteúdo</SelectItem>
                        <SelectItem value="design">🎨 Design</SelectItem>
                        <SelectItem value="aprovacao">✅ Aprovação</SelectItem>
                        <SelectItem value="publicacao">📢 Publicação</SelectItem>
                        <SelectItem value="revisao">🔍 Revisão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={editingTarefa.descricao || ''}
                    onChange={(e) => setEditingTarefa({...editingTarefa, descricao: e.target.value})}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select 
                      value={editingTarefa.prioridade || 'media'} 
                      onValueChange={(value) => setEditingTarefa({...editingTarefa, prioridade: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">🟢 Baixa</SelectItem>
                        <SelectItem value="media">🟡 Média</SelectItem>
                        <SelectItem value="alta">🔴 Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Limite</Label>
                    <Input
                      type="date"
                      value={editingTarefa.data_prazo || ''}
                      onChange={(e) => setEditingTarefa({...editingTarefa, data_prazo: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tempo Estimado (h)</Label>
                    <Input
                      type="number"
                      value={editingTarefa.tempo_estimado || ''}
                      onChange={(e) => setEditingTarefa({...editingTarefa, tempo_estimado: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Select 
                    value={editingTarefa.responsavel_id || ''} 
                    onValueChange={(value) => setEditingTarefa({...editingTarefa, responsavel_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={profile.avatar_url} />
                              <AvatarFallback className="text-xs">{profile.nome.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {profile.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seção de Anexos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Anexos</Label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && editingTarefa) {
                            uploadFile(file, editingTarefa.id);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingFile}
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        {uploadingFile ? 'Enviando...' : 'Anexar Arquivo'}
                      </Button>
                    </div>
                  </div>

                  {editingTarefa.anexos && editingTarefa.anexos.length > 0 && (
                    <div className="space-y-2">
                      {editingTarefa.anexos.map((anexo: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{anexo.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(anexo.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadAttachment(anexo.path, anexo.name)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(editingTarefa.id, anexo.path)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingTarefa(null)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      updateTarefa(editingTarefa.id, {
                        titulo: editingTarefa.titulo,
                        descricao: editingTarefa.descricao,
                        tipo: editingTarefa.tipo,
                        prioridade: editingTarefa.prioridade,
                        prazo_executor: editingTarefa.data_prazo,
                        responsavel_id: editingTarefa.responsavel_id,
                        tempo_estimado: editingTarefa.tempo_estimado
                      });
                      setEditingTarefa(null);
                    }}
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      {/* Kanban Board */}
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-6">
          {colunas.map((coluna) => {
            const tarefasColuna = getTarefasPorStatus(coluna.id);
            const { setNodeRef, isOver } = useDroppable({ id: coluna.id });
            
            return (
              <div 
                key={coluna.id}
                className={`transition-all ${isOver ? 'scale-[1.02]' : ''}`}
              >
                <Card className={`${coluna.cor} border-2 ${coluna.accentColor} rounded-xl shadow-sm hover:shadow-md transition-all duration-200`}>
                  <CardHeader className="pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between text-gray-800 dark:text-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{coluna.icon}</span>
                        {coluna.titulo}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 font-bold px-2 py-1 shadow-sm"
                      >
                        {tarefasColuna.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent 
                    ref={setNodeRef}
                    className="space-y-3 min-h-[500px] p-4"
                  >
                    <SortableContext 
                      id={coluna.id}
                      items={tarefasColuna.map(t => t.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      {tarefasColuna.map((tarefa) => (
                        <TarefaCard
                          key={tarefa.id}
                          tarefa={tarefa}
                          profiles={profiles}
                          onUpdateStatus={updateTarefaStatus}
                          onEditTarefa={setEditingTarefa}
                        />
                      ))}
                    </SortableContext>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}