import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UniversalKanbanBoard, moduleConfigurations } from "@/components/UniversalKanbanBoard";
import { TrelloStyleTaskModal } from "@/components/TrelloStyleTaskModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  BarChart3, 
  Search, 
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminTask {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: 'baixa' | 'media' | 'alta';
  data_prazo?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  setor_responsavel: string;
  horas_trabalhadas?: number;
  cliente_id?: string;
  cliente_nome?: string;
  projeto_id?: string;
  projeto_nome?: string;
  created_at?: string;
  updated_at?: string;
  anexos?: any[];
  comentarios?: any[];
  etiquetas?: string[];
  checklist?: any[];
  capa_anexo_id?: string | null;
}

interface AdminStats {
  total: number;
  emAndamento: number;
  atrasadas: number;
  concluidas: number;
  porSetor: { [key: string]: number };
}

export default function AdminTarefas() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSetor, setSelectedSetor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedResponsavel, setSelectedResponsavel] = useState('all');
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    emAndamento: 0,
    atrasadas: 0,
    concluidas: 0,
    porSetor: {}
  });
  const { toast } = useToast();

  // Buscar todas as tarefas (visão admin)
  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      
      // Buscar tarefas de todos os setores
      const { data: tarefasData, error: tarefasError } = await (supabase
        .from('tarefa')
        .select('*, capa_anexo_id')
        .order('created_at', { ascending: false }) as any);

      if (tarefasError) throw tarefasError;

      // Buscar dados dos responsáveis
      const responsavelIds = [...new Set(tarefasData?.map((t: any) => t.responsavel_id).filter(Boolean))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, nome')
        .in('id', responsavelIds as string[]);

      // Buscar dados dos projetos
      const projetoIds = [...new Set(tarefasData?.map((t: any) => t.projeto_id).filter(Boolean))];
      const { data: projetosData } = await supabase
        .from('projetos')
        .select('id, titulo, cliente_id')
        .in('id', projetoIds as string[]);

      // Buscar dados dos clientes
      const clienteIds = [...new Set(projetosData?.map((p: any) => p.cliente_id).filter(Boolean))];
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, nome')
        .in('id', clienteIds);

      // Combinar dados
      const tasksWithDetails = tarefasData?.map((task: any) => {
        const responsavel = profilesData?.find((p: any) => p.id === task.responsavel_id);
        const projeto = projetosData?.find((p: any) => p.id === task.projeto_id);
        const cliente = clientesData?.find((c: any) => c.id === projeto?.cliente_id);

        return {
          ...task,
          responsavel_nome: responsavel?.nome,
          projeto_nome: projeto?.titulo,
          cliente_nome: cliente?.nome,
          cliente_id: projeto?.cliente_id,
          prioridade: task.prioridade as 'baixa' | 'media' | 'alta',
          anexos: [],
          comentarios: [],
          etiquetas: [],
          checklist: []
        };
      }) || [];

      setTasks(tasksWithDetails);
      calculateStats(tasksWithDetails);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const calculateStats = (tasks: AdminTask[]) => {
    const agora = new Date();
    const statusEmAndamento = ['em_andamento', 'a_fazer', 'em_revisao', 'em_analise', 'em_criacao', 'briefing'];
    const statusConcluido = ['concluido', 'entregue', 'fechado', 'convertido'];
    
    const total = tasks.length;
    const emAndamento = tasks.filter(t => statusEmAndamento.includes(t.status)).length;
    const atrasadas = tasks.filter(t => 
      t.data_prazo && 
      new Date(t.data_prazo) < agora && 
      !statusConcluido.includes(t.status)
    ).length;
    const concluidas = tasks.filter(t => statusConcluido.includes(t.status)).length;
    
    const porSetor = tasks.reduce((acc, task) => {
      acc[task.setor_responsavel] = (acc[task.setor_responsavel] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    setStats({ total, emAndamento, atrasadas, concluidas, porSetor });
  };

  // Atualizar status da tarefa
  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tarefa')
        .update({ status: newStatus as any, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      toast({
        title: "Sucesso",
        description: "Status da tarefa atualizado"
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa",
        variant: "destructive"
      });
    }
  };

  // Abrir modal da tarefa
  const handleTaskClick = (task: AdminTask) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.responsavel_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSetor = selectedSetor === 'all' || task.setor_responsavel === selectedSetor;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesResponsavel = selectedResponsavel === 'all' || task.responsavel_id === selectedResponsavel;
    
    return matchesSearch && matchesSetor && matchesStatus && matchesResponsavel;
  });

  // Obter responsáveis únicos
  const responsaveis = [...new Set(tasks.map(t => t.responsavel_nome).filter(Boolean))];
  const setores = [...new Set(tasks.map(t => t.setor_responsavel))];

  useEffect(() => {
    fetchAllTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel de Tarefas - Admin</h1>
          <p className="text-muted-foreground">Visão completa de todas as tarefas do sistema</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Tarefas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{stats.emAndamento}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.atrasadas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-[400px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas, clientes, responsáveis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSetor} onValueChange={setSelectedSetor}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Setores</SelectItem>
                {setores.map(setor => (
                  <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedResponsavel} onValueChange={setSelectedResponsavel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {responsaveis.map(resp => (
                  <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="setor">Por Setor</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <UniversalKanbanBoard
            tasks={filteredTasks}
            moduleColumns={moduleConfigurations.geral.map(col => ({ ...col, tasks: [] }))}
            moduleType="geral"
            onTaskMove={handleTaskMove}
            onTaskCreate={() => {}}
            onTaskClick={handleTaskClick}
            showFilters={false}
            showSearch={false}
          />
        </TabsContent>

        <TabsContent value="setor">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(stats.porSetor).map(([setor, count]) => (
              <Card key={setor}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{setor}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredTasks
                      .filter(task => task.setor_responsavel === setor)
                      .slice(0, 3)
                      .map(task => (
                        <div 
                          key={task.id}
                          className="p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => handleTaskClick(task)}
                        >
                          <p className="text-sm font-medium truncate">{task.titulo}</p>
                          <p className="text-xs text-muted-foreground">{task.cliente_nome}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Setor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.porSetor).map(([setor, count]) => (
                    <div key={setor} className="flex items-center justify-between">
                      <span className="text-sm">{setor}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total de Tarefas</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-blue-50 rounded text-blue-700">
                      <p className="font-semibold">{stats.emAndamento}</p>
                      <p className="text-xs">Em Andamento</p>
                    </div>
                    <div className="p-2 bg-red-50 rounded text-red-700">
                      <p className="font-semibold">{stats.atrasadas}</p>
                      <p className="text-xs">Atrasadas</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-green-700">
                      <p className="font-semibold">{stats.concluidas}</p>
                      <p className="text-xs">Concluídas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal da tarefa */}
      {selectedTask && (
        <TrelloStyleTaskModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          task={selectedTask}
          onTaskUpdate={(taskId, updates) => {
            setTasks(prev => prev.map(t => 
              t.id === taskId ? { ...t, ...updates } : t
            ));
          }}
          moduleType="geral"
        />
      )}
    </div>
  );
}