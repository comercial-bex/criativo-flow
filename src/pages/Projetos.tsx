import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

interface Cliente {
  id: string;
  nome: string;
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
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dialogProjetoOpen, setDialogProjetoOpen] = useState(false);
  const [dialogTarefaOpen, setDialogTarefaOpen] = useState(false);
  const [formDataProjeto, setFormDataProjeto] = useState({
    nome: '',
    descricao: '',
    cliente_id: '',
    data_inicio: '',
    data_fim: '',
    orcamento: ''
  });
  const [formDataTarefa, setFormDataTarefa] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    prioridade: 'media',
    data_prazo: '',
    tempo_estimado: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProjetos();
    fetchClientes();
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

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome', { ascending: true });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
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

  const handleSubmitProjeto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('projetos')
        .insert({
          ...formDataProjeto,
          orcamento: formDataProjeto.orcamento ? parseFloat(formDataProjeto.orcamento) : null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Projeto criado com sucesso!",
        description: "O novo projeto foi adicionado à lista",
      });

      setDialogProjetoOpen(false);
      setFormDataProjeto({
        nome: '',
        descricao: '',
        cliente_id: '',
        data_inicio: '',
        data_fim: '',
        orcamento: ''
      });
      await fetchProjetos();
      setProjetoSelecionado(data.id);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: "Erro ao criar projeto",
        description: "Não foi possível criar o projeto",
        variant: "destructive",
      });
    }
  };

  const handleSubmitTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projetoSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um projeto antes de criar uma tarefa",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('tarefas')
        .insert({
          titulo: formDataTarefa.titulo,
          descricao: formDataTarefa.descricao,
          projeto_id: projetoSelecionado,
          tipo: formDataTarefa.tipo,
          prioridade: formDataTarefa.prioridade as 'baixa' | 'media' | 'alta' | 'urgente',
          data_prazo: formDataTarefa.data_prazo || null,
          tempo_estimado: formDataTarefa.tempo_estimado ? parseInt(formDataTarefa.tempo_estimado) : null
        });

      if (error) throw error;

      toast({
        title: "Tarefa criada com sucesso!",
        description: "A nova tarefa foi adicionada ao projeto",
      });

      setDialogTarefaOpen(false);
      setFormDataTarefa({
        titulo: '',
        descricao: '',
        tipo: '',
        prioridade: 'media',
        data_prazo: '',
        tempo_estimado: ''
      });
      fetchTarefas(projetoSelecionado);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro ao criar tarefa",
        description: "Não foi possível criar a tarefa",
        variant: "destructive",
      });
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
          <div className="flex items-center space-x-2">
            <Dialog open={dialogProjetoOpen} onOpenChange={setDialogProjetoOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Adicione um novo projeto para gerenciar tarefas
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmitProjeto} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Projeto *</Label>
                    <Input
                      id="nome"
                      value={formDataProjeto.nome}
                      onChange={(e) => setFormDataProjeto({...formDataProjeto, nome: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cliente_id">Cliente</Label>
                    <Select
                      value={formDataProjeto.cliente_id}
                      onValueChange={(value) => setFormDataProjeto({...formDataProjeto, cliente_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formDataProjeto.descricao}
                      onChange={(e) => setFormDataProjeto({...formDataProjeto, descricao: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_inicio">Data Início</Label>
                      <Input
                        id="data_inicio"
                        type="date"
                        value={formDataProjeto.data_inicio}
                        onChange={(e) => setFormDataProjeto({...formDataProjeto, data_inicio: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="data_fim">Data Fim</Label>
                      <Input
                        id="data_fim"
                        type="date"
                        value={formDataProjeto.data_fim}
                        onChange={(e) => setFormDataProjeto({...formDataProjeto, data_fim: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orcamento">Orçamento (R$)</Label>
                    <Input
                      id="orcamento"
                      type="number"
                      step="0.01"
                      value={formDataProjeto.orcamento}
                      onChange={(e) => setFormDataProjeto({...formDataProjeto, orcamento: e.target.value})}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Criar Projeto
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogTarefaOpen} onOpenChange={setDialogTarefaOpen}>
              <DialogTrigger asChild>
                <Button disabled={!projetoSelecionado}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Nova Tarefa</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova tarefa ao projeto selecionado
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmitTarefa} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título da Tarefa *</Label>
                    <Input
                      id="titulo"
                      value={formDataTarefa.titulo}
                      onChange={(e) => setFormDataTarefa({...formDataTarefa, titulo: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={formDataTarefa.tipo}
                      onValueChange={(value) => setFormDataTarefa({...formDataTarefa, tipo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="copy">Copy</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                        <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                        <SelectItem value="planejamento">Planejamento</SelectItem>
                        <SelectItem value="revisao">Revisão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select
                      value={formDataTarefa.prioridade}
                      onValueChange={(value) => setFormDataTarefa({...formDataTarefa, prioridade: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao_tarefa">Descrição</Label>
                    <Textarea
                      id="descricao_tarefa"
                      value={formDataTarefa.descricao}
                      onChange={(e) => setFormDataTarefa({...formDataTarefa, descricao: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_prazo">Data Prazo</Label>
                      <Input
                        id="data_prazo"
                        type="date"
                        value={formDataTarefa.data_prazo}
                        onChange={(e) => setFormDataTarefa({...formDataTarefa, data_prazo: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tempo_estimado">Tempo (horas)</Label>
                      <Input
                        id="tempo_estimado"
                        type="number"
                        step="0.5"
                        value={formDataTarefa.tempo_estimado}
                        onChange={(e) => setFormDataTarefa({...formDataTarefa, tempo_estimado: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Criar Tarefa
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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