import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Edit,
  Calendar,
  Filter,
  Search,
  Palette
} from "lucide-react";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  anexos?: any;
  projeto_id?: string;
}

interface Profile {
  id: string;
  nome: string;
  avatar_url?: string;
  especialidade?: string;
}

// Colunas específicas para design
const colunasDesign = [
  { 
    id: 'briefing', 
    titulo: 'Briefing', 
    cor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
    icon: '📋',
    accentColor: 'border-blue-300 dark:border-blue-600'
  },
  { 
    id: 'em_criacao', 
    titulo: 'Em Criação', 
    cor: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
    icon: '🎨',
    accentColor: 'border-purple-300 dark:border-purple-600'
  },
  { 
    id: 'revisao_interna', 
    titulo: 'Revisão Interna', 
    cor: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30',
    icon: '👀',
    accentColor: 'border-yellow-300 dark:border-yellow-600'
  },
  { 
    id: 'aprovacao_cliente', 
    titulo: 'Aprovação Cliente', 
    cor: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30',
    icon: '✅',
    accentColor: 'border-orange-300 dark:border-orange-600'
  },
  { 
    id: 'entregue', 
    titulo: 'Entregue', 
    cor: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
    icon: '🚀',
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

  const isAtrasada = tarefa.data_prazo && new Date(tarefa.data_prazo) < new Date() && tarefa.status !== 'entregue';
  const prioridadeConfig = getPrioridadeConfig(tarefa.prioridade);

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
          <Badge className="text-xs px-2 py-0.5 font-medium border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300">
            🎨 Design
          </Badge>
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

        {/* Tempo estimado */}
        {tarefa.tempo_estimado && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md w-fit">
            <Clock className="h-3 w-3" />
            <span>{tarefa.tempo_estimado}h</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DesignKanban() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media',
    data_prazo: '',
    responsavel_id: '',
    tipo: 'design',
    tempo_estimado: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar tarefas de design
      const { data: tarefasData, error: tarefasError } = await supabase
        .from('tarefas')
        .select('*')
        .eq('tipo', 'design')
        .order('created_at', { ascending: false });

      if (tarefasError) throw tarefasError;
      
      // Mapear status antigos para novos
      const tarefasMapeadas = tarefasData?.map(tarefa => ({
        ...tarefa,
        status: mapearStatusParaDesign(tarefa.status)
      })) || [];
      
      setTarefas(tarefasMapeadas);

      // Buscar designers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('especialidade', 'design');

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas de design.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const mapearStatusParaDesign = (status: string) => {
    const mapeamento: { [key: string]: string } = {
      'backlog': 'briefing',
      'to_do': 'briefing',
      'em_andamento': 'em_criacao',
      'em_revisao': 'revisao_interna',
      'concluida': 'entregue'
    };
    return mapeamento[status] || status;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const tarefaId = active.id as string;
    const novoStatus = over.id as string;

    // Verificar se é uma coluna válida
    const colunaValida = colunasDesign.find(col => col.id === novoStatus);
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
          titulo: novaTarefa.titulo,
          descricao: novaTarefa.descricao || null,
          prioridade: novaTarefa.prioridade as 'alta' | 'media' | 'baixa',
          data_prazo: novaTarefa.data_prazo || null,
          responsavel_id: novaTarefa.responsavel_id || null,
          tipo: 'design',
          tempo_estimado: novaTarefa.tempo_estimado ? parseInt(novaTarefa.tempo_estimado) : null,
          status: 'briefing'
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
        tipo: 'design',
        tempo_estimado: ''
      });

      toast({
        title: "Sucesso",
        description: "Tarefa de design criada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa de design.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getTarefasPorStatus = (status: string) => {
    let tarefasFiltradas = tarefas.filter(tarefa => tarefa.status === status);

    if (searchTerm) {
      tarefasFiltradas = tarefasFiltradas.filter(tarefa =>
        tarefa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tarefa.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtroResponsavel) {
      tarefasFiltradas = tarefasFiltradas.filter(tarefa => tarefa.responsavel_id === filtroResponsavel);
    }

    return tarefasFiltradas;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-muted rounded"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-24 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
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
            <Palette className="h-8 w-8 text-primary" />
            Kanban Design
          </h1>
          <p className="text-muted-foreground">Gestão visual da produção criativa</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa de Design</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={novaTarefa.titulo}
                  onChange={(e) => setNovaTarefa(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Post Instagram - Cliente X"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novaTarefa.descricao}
                  onChange={(e) => setNovaTarefa(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Detalhes do briefing..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select
                    value={novaTarefa.prioridade}
                    onValueChange={(value) => setNovaTarefa(prev => ({ ...prev, prioridade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tempo">Tempo Estimado (h)</Label>
                  <Input
                    id="tempo"
                    type="number"
                    value={novaTarefa.tempo_estimado}
                    onChange={(e) => setNovaTarefa(prev => ({ ...prev, tempo_estimado: e.target.value }))}
                    placeholder="2.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavel">Designer Responsável</Label>
                  <Select
                    value={novaTarefa.responsavel_id}
                    onValueChange={(value) => setNovaTarefa(prev => ({ ...prev, responsavel_id: value }))}
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
                <div>
                  <Label htmlFor="prazo">Deadline</Label>
                  <Input
                    id="prazo"
                    type="date"
                    value={novaTarefa.data_prazo}
                    onChange={(e) => setNovaTarefa(prev => ({ ...prev, data_prazo: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={createTarefa} disabled={isCreating} className="w-full">
                {isCreating ? "Criando..." : "Criar Tarefa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
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
        {(searchTerm || filtroResponsavel) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFiltroResponsavel('');
            }}
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
          {colunasDesign.map((coluna) => {
            const tarefasColuna = getTarefasPorStatus(coluna.id);
            
            return (
              <div key={coluna.id} className={`rounded-xl p-4 ${coluna.cor} border-2 ${coluna.accentColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{coluna.icon}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {coluna.titulo}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="bg-white/70 dark:bg-gray-800/70">
                    {tarefasColuna.length}
                  </Badge>
                </div>
                
                <SortableContext items={tarefasColuna.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3 min-h-[400px]">
                    {tarefasColuna.map((tarefa) => (
                      <TarefaCard
                        key={tarefa.id}
                        tarefa={tarefa}
                        profiles={profiles}
                        onUpdateStatus={updateTarefaStatus}
                        onEditTarefa={setEditingTarefa}
                      />
                    ))}
                    {tarefasColuna.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-2 opacity-50">{coluna.icon}</div>
                        <p className="text-sm">Nenhuma tarefa</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}