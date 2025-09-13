import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Circle,
  MoreHorizontal,
  Calendar,
  User
} from "lucide-react";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TarefasKanbanProps {
  planejamento: {
    id: string;
  };
  clienteId: string;
  projetoId: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade?: string;
  data_prazo?: string;
  responsavel_id?: string;
  tipo?: string;
  tempo_estimado?: number;
  created_at?: string;
}

interface Profile {
  id: string;
  nome: string;
  avatar_url?: string;
}

const colunas = [
  { id: 'backlog', titulo: 'Backlog', cor: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'to_do', titulo: 'Para Fazer', cor: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'em_andamento', titulo: 'Em Andamento', cor: 'bg-yellow-100 dark:bg-yellow-900' },
  { id: 'em_revisao', titulo: 'Em Revisão', cor: 'bg-purple-100 dark:bg-purple-900' },
  { id: 'concluida', titulo: 'Concluída', cor: 'bg-green-100 dark:bg-green-900' },
];

interface TarefaCardProps {
  tarefa: Tarefa;
  profiles: Profile[];
  onUpdateStatus: (tarefaId: string, novoStatus: string) => void;
}

function TarefaCard({ tarefa, profiles, onUpdateStatus }: TarefaCardProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  const responsavel = profiles.find(p => p.id === tarefa.responsavel_id);

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const isAtrasada = tarefa.data_prazo && new Date(tarefa.data_prazo) < new Date() && tarefa.status !== 'concluida';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm line-clamp-2">{tarefa.titulo}</h4>
          {isAtrasada && (
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          )}
        </div>

        {tarefa.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2">{tarefa.descricao}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tarefa.prioridade && (
              <Badge className={`text-xs px-2 py-1 ${getPrioridadeColor(tarefa.prioridade)}`}>
                {tarefa.prioridade}
              </Badge>
            )}
            {tarefa.tipo && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                {tarefa.tipo}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {tarefa.data_prazo ? format(new Date(tarefa.data_prazo), 'dd/MM', { locale: ptBR }) : 'Sem prazo'}
          </div>
          {responsavel && (
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src={responsavel.avatar_url} />
                <AvatarFallback className="text-xs">{responsavel.nome.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TarefasKanban({ planejamento, clienteId, projetoId }: TarefasKanbanProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media',
    data_prazo: '',
    responsavel_id: '',
    tipo: 'conteudo',
    tempo_estimado: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [projetoId]);

  const fetchData = async () => {
    try {
      // Buscar tarefas
      const { data: tarefasData, error: tarefasError } = await supabase
        .from('tarefas')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (tarefasError) throw tarefasError;
      setTarefas(tarefasData || []);

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
        .from('tarefas')
        .update({ status: novoStatus })
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

  const createTarefa = async () => {
    if (!novaTarefa.titulo.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      const { data, error } = await supabase
        .from('tarefas')
        .insert({
          projeto_id: projetoId,
          titulo: novaTarefa.titulo,
          descricao: novaTarefa.descricao || null,
          prioridade: novaTarefa.prioridade as 'alta' | 'media' | 'baixa',
          data_prazo: novaTarefa.data_prazo || null,
          responsavel_id: novaTarefa.responsavel_id || null,
          tipo: novaTarefa.tipo,
          tempo_estimado: novaTarefa.tempo_estimado ? parseInt(novaTarefa.tempo_estimado) : null,
          status: 'backlog'
        })
        .select()
        .single();

      if (error) throw error;

      setTarefas(prev => [data, ...prev]);
      setNovaTarefa({
        titulo: '',
        descricao: '',
        prioridade: 'media',
        data_prazo: '',
        responsavel_id: '',
        tipo: 'conteudo',
        tempo_estimado: ''
      });

      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getTarefasPorStatus = (status: string) => {
    return tarefas.filter(tarefa => tarefa.status === status);
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
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={novaTarefa.titulo}
                    onChange={(e) => setNovaTarefa({...novaTarefa, titulo: e.target.value})}
                    placeholder="Digite o título da tarefa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select 
                    value={novaTarefa.tipo} 
                    onValueChange={(value) => setNovaTarefa({...novaTarefa, tipo: value})}
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
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={novaTarefa.descricao}
                  onChange={(e) => setNovaTarefa({...novaTarefa, descricao: e.target.value})}
                  placeholder="Descreva os detalhes da tarefa"
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select 
                    value={novaTarefa.prioridade} 
                    onValueChange={(value) => setNovaTarefa({...novaTarefa, prioridade: value})}
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
                  <label className="text-sm font-medium">Data Limite</label>
                  <Input
                    type="date"
                    value={novaTarefa.data_prazo}
                    onChange={(e) => setNovaTarefa({...novaTarefa, data_prazo: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tempo Estimado (h)</label>
                  <Input
                    type="number"
                    value={novaTarefa.tempo_estimado}
                    onChange={(e) => setNovaTarefa({...novaTarefa, tempo_estimado: e.target.value})}
                    placeholder="Ex: 4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Responsável</label>
                <Select 
                  value={novaTarefa.responsavel_id} 
                  onValueChange={(value) => setNovaTarefa({...novaTarefa, responsavel_id: value})}
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNovaTarefa({
                  titulo: '',
                  descricao: '',
                  prioridade: 'media',
                  data_prazo: '',
                  responsavel_id: '',
                  tipo: 'conteudo',
                  tempo_estimado: ''
                })}>
                  Cancelar
                </Button>
                <Button onClick={createTarefa} disabled={isCreating}>
                  {isCreating ? 'Criando...' : 'Criar Tarefa'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-6">
          {colunas.map((coluna) => {
            const tarefasColuna = getTarefasPorStatus(coluna.id);
            
            return (
              <SortableContext 
                key={coluna.id} 
                items={tarefasColuna.map(t => t.id)} 
                strategy={verticalListSortingStrategy}
              >
                <Card className={`${coluna.cor} border-2 border-dashed`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      {coluna.titulo}
                      <Badge variant="secondary" className="ml-2">
                        {tarefasColuna.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-[400px]">
                    {tarefasColuna.map((tarefa) => (
                      <TarefaCard
                        key={tarefa.id}
                        tarefa={tarefa}
                        profiles={profiles}
                        onUpdateStatus={updateTarefaStatus}
                      />
                    ))}
                  </CardContent>
                </Card>
              </SortableContext>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}