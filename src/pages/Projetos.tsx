import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FolderOpen, Calendar, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  cliente_id: string;
  data_inicio: string;
  data_fim: string;
  orcamento: number;
  status: string;
  created_at: string;
  clientes: {
    nome: string;
  };
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  projeto_id: string;
  tipo: string;
  prioridade: string;
  status: string;
  data_prazo: string;
  tempo_estimado: number;
  created_at: string;
}

const statusTarefas = [
  { value: 'backlog', label: 'Backlog', color: 'bg-gray-100 text-gray-800' },
  { value: 'brief_aprovado', label: 'Brief Aprovado', color: 'bg-blue-100 text-blue-800' },
  { value: 'em_criacao', label: 'Em Criação', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'revisao_interna', label: 'Revisão Interna', color: 'bg-orange-100 text-orange-800' },
  { value: 'enviado_cliente', label: 'Enviado ao Cliente', color: 'bg-purple-100 text-purple-800' },
  { value: 'ajustes', label: 'Ajustes', color: 'bg-red-100 text-red-800' },
  { value: 'aprovado', label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  { value: 'publicado', label: 'Publicado', color: 'bg-emerald-100 text-emerald-800' }
];

const Projetos = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjetos();
  }, []);

  useEffect(() => {
    if (projetoSelecionado) {
      fetchTarefas(projetoSelecionado);
    }
  }, [projetoSelecionado]);

  const fetchProjetos = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          clientes (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
      
      if (data && data.length > 0 && !projetoSelecionado) {
        setProjetoSelecionado(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: "Erro ao carregar projetos",
        description: "Não foi possível carregar a lista de projetos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTarefas = async (projetoId: string) => {
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTarefas(data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  const updateTarefaStatus = async (tarefaId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ status: newStatus })
        .eq('id', tarefaId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: "O status da tarefa foi atualizado com sucesso",
      });

      fetchTarefas(projetoSelecionado);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da tarefa",
        variant: "destructive",
      });
    }
  };

  const getStatusInfo = (status: string) => {
    return statusTarefas.find(s => s.value === status) || statusTarefas[0];
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedTarefas = statusTarefas.reduce((acc, status) => {
    acc[status.value] = tarefas.filter(tarefa => tarefa.status === status.value);
    return acc;
  }, {} as Record<string, Tarefa[]>);

  const projetoAtual = projetos.find(p => p.id === projetoSelecionado);

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Projetos</h1>
            <p className="text-muted-foreground">
              Acompanhe o progresso dos projetos e tarefas
            </p>
          </div>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Seletor de Projeto */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 max-w-md">
            <Select value={projetoSelecionado} onValueChange={setProjetoSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projetos.map((projeto) => (
                  <SelectItem key={projeto.id} value={projeto.id}>
                    {projeto.nome} - {projeto.clientes?.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {projetoAtual && (
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{projetoAtual.nome}</CardTitle>
                </div>
                <CardDescription>
                  Cliente: {projetoAtual.clientes?.nome}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {projetoAtual.data_inicio && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(projetoAtual.data_inicio).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {projetoAtual.orcamento && (
                    <div>
                      Orçamento: R$ {projetoAtual.orcamento.toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      {projetoSelecionado ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 overflow-x-auto">
          {statusTarefas.map((status) => (
            <div key={status.value} className="min-w-72">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{status.label}</h3>
                <Badge variant="secondary" className={status.color}>
                  {groupedTarefas[status.value]?.length || 0}
                </Badge>
              </div>
              
              <div className="space-y-3 min-h-96">
                {groupedTarefas[status.value]?.map((tarefa) => (
                  <Card key={tarefa.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm">{tarefa.titulo}</CardTitle>
                        <Badge className={getPrioridadeColor(tarefa.prioridade)}>
                          {tarefa.prioridade}
                        </Badge>
                      </div>
                      {tarefa.tipo && (
                        <CardDescription className="text-xs">
                          {tarefa.tipo}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-xs">
                        {tarefa.data_prazo && (
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(tarefa.data_prazo).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                        {tarefa.tempo_estimado && (
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {tarefa.tempo_estimado}h estimadas
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <Select
                          value={tarefa.status}
                          onValueChange={(value) => updateTarefaStatus(tarefa.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusTarefas.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          <div className="text-center">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione um projeto para ver as tarefas</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projetos;