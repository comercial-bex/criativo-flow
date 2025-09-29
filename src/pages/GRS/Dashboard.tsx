import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Users, Clock, AlertCircle, TrendingUp, BarChart3, Plus, Send, Info, FileText, CheckCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GamificationWidget } from "@/components/GamificationWidget";
import { CalendarWidget } from "@/components/CalendarWidget";
import { InteractiveGuideButton } from "@/components/InteractiveGuideButton";
import { SimpleHelpModal } from "@/components/SimpleHelpModal";
import { TarefasPorSetor } from "@/components/TarefasPorSetor";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  status: string;
}

interface ClienteComProjetos extends Cliente {
  totalProjetos: number;
  projetosAtivos: number;
  projetosConcluidos: number;
  projetosPendentes: number;
  projetosPausados: number;
}

interface DashboardMetrics {
  clientesAtivos: number;
  totalProjetos: number;
  projetosAtivos: number;
  projetosConcluidos: number;
}

export default function GRSDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    clientesAtivos: 0,
    totalProjetos: 0,
    projetosAtivos: 0,
    projetosConcluidos: 0
  });
  const [clientesComProjetos, setClientesComProjetos] = useState<ClienteComProjetos[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state for new planning
  const [formData, setFormData] = useState({
    titulo: "",
    cliente_id: "",
    mes_referencia: "",
    descricao: ""
  });
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    fetchClientesEProjetos();
  }, []);

  const fetchClientesEProjetos = async () => {
    try {
      // Fetch clientes ativos
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome, email, status')
        .eq('status', 'ativo')
        .order('nome');

      if (clientesError) throw clientesError;

      // Fetch projetos
      const { data: projetos, error: projetosError } = await supabase
        .from('projetos')
        .select('id, cliente_id, status');

      if (projetosError) throw projetosError;

      // Fetch planejamentos
      const { data: planejamentos, error: planejamentosError } = await supabase
        .from('planejamentos')
        .select('id, cliente_id, status');

      if (planejamentosError) throw planejamentosError;

      // Calculate metrics per client
      const clientesComStats = clientes?.map(cliente => {
        const projetosCliente = projetos?.filter(p => p.cliente_id === cliente.id) || [];
        const planejamentosCliente = planejamentos?.filter(p => p.cliente_id === cliente.id) || [];
        
        const todosProjetos = [...projetosCliente, ...planejamentosCliente];
        
        return {
          ...cliente,
          totalProjetos: todosProjetos.length,
          projetosAtivos: todosProjetos.filter(p => 
            ['em_andamento', 'em_producao', 'iniciado'].includes(p.status)
          ).length,
          projetosConcluidos: todosProjetos.filter(p => 
            ['concluido', 'finalizado', 'entregue'].includes(p.status)
          ).length,
          projetosPendentes: todosProjetos.filter(p => 
            ['pendente', 'aguardando', 'em_aprovacao_final'].includes(p.status)
          ).length,
          projetosPausados: todosProjetos.filter(p => 
            ['pausado', 'suspenso'].includes(p.status)
          ).length,
        };
      }) || [];

      setClientesComProjetos(clientesComStats);

      // Calculate global metrics
      const totalClientesAtivos = clientesComStats.length;
      const totalProjetos = clientesComStats.reduce((acc, c) => acc + c.totalProjetos, 0);
      const totalAtivos = clientesComStats.reduce((acc, c) => acc + c.projetosAtivos, 0);
      const totalConcluidos = clientesComStats.reduce((acc, c) => acc + c.projetosConcluidos, 0);

      setMetrics({
        clientesAtivos: totalClientesAtivos,
        totalProjetos: totalProjetos,
        projetosAtivos: totalAtivos,
        projetosConcluidos: totalConcluidos
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, email, status')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const metricsData = [
    {
      title: "Clientes Ativos",
      value: metrics.clientesAtivos.toString(),
      icon: Users,
      change: "Clientes em operação",
      color: "text-blue-600"
    },
    {
      title: "Total Projetos",
      value: metrics.totalProjetos.toString(),
      icon: FileText,
      change: "Projetos + Planejamentos",
      color: "text-green-600"
    },
    {
      title: "Projetos Ativos",
      value: metrics.projetosAtivos.toString(),
      icon: Clock,
      change: "Em andamento",
      color: "text-orange-500"
    },
    {
      title: "Projetos Concluídos",
      value: metrics.projetosConcluidos.toString(),
      icon: CheckCircle,
      change: "Finalizados com sucesso",
      color: "text-emerald-600"
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ativo': return 'default';
      case 'inativo': return 'secondary';
      case 'suspenso': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'suspenso': return 'Suspenso';
      default: return status;
    }
  };

  const handleCreatePlanejamento = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('planejamentos')
        .insert({
          titulo: formData.titulo,
          cliente_id: formData.cliente_id,
          mes_referencia: formData.mes_referencia,
          descricao: formData.descricao,
          status: 'rascunho'
        });

      if (error) throw error;

      toast({
        title: "Planejamento criado com sucesso!",
        description: "O novo planejamento foi adicionado ao sistema",
      });

      setDialogOpen(false);
      setFormData({
        titulo: "",
        cliente_id: "",
        mes_referencia: "",
        descricao: ""
      });
      
      // Refresh data
      fetchClientesEProjetos();
    } catch (error) {
      console.error('Erro ao criar planejamento:', error);
      toast({
        title: "Erro ao criar planejamento",
        description: "Não foi possível criar o planejamento",
        variant: "destructive",
      });
    }
  };

  const handleVisualizarCliente = (clienteId: string) => {
    navigate(`/grs/cliente/${clienteId}/projetos`);
  };

  const helpContent = {
    title: "Como usar o Dashboard GRS",
    sections: [
      {
        title: "📊 Visão Geral Centrada no Cliente",
        content: "O Dashboard apresenta uma tabela completa com todos os clientes ativos e suas estatísticas de projetos. Esta visão centralizada permite gerenciar todos os trabalhos de forma eficiente."
      },
      {
        title: "🎯 Métricas Unificadas",
        content: "• Clientes Ativos: Total de clientes em operação\n• Total Projetos: Soma de projetos + planejamentos\n• Projetos Ativos: Trabalhos em andamento\n• Projetos Concluídos: Trabalhos finalizados"
      },
      {
        title: "👁️ Ações por Cliente",
        content: "Clique no ícone de visualizar para acessar todos os projetos e planejamentos do cliente em uma única tela unificada."
      }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Dashboard GRS
          </h1>
          <p className="text-muted-foreground">Gestão de Relacionamento com o Cliente - Visão geral completa</p>
        </div>
        <div className="flex items-center gap-2">
          <SimpleHelpModal content={helpContent}>
            <Button variant="outline" size="sm" data-intro="dashboard-help">
              <Info className="h-4 w-4 mr-2" />
              Como usar
            </Button>
          </SimpleHelpModal>
          <InteractiveGuideButton />
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Clientes e Projetos</TabsTrigger>
          <TabsTrigger value="tarefas">Minhas Tarefas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-intro="criar-planejamento">
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Planejamento</DialogTitle>
                <DialogDescription>
                  Crie um novo planejamento para o cliente selecionado
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePlanejamento} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título do Planejamento</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ex: Planejamento Janeiro 2024"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente</Label>
                    <Select 
                      value={formData.cliente_id} 
                      onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
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
                    <Label htmlFor="mes_referencia">Mês de Referência</Label>
                    <Input
                      id="mes_referencia"
                      type="date"
                      value={formData.mes_referencia}
                      onChange={(e) => setFormData({ ...formData, mes_referencia: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva os objetivos e escopo do planejamento..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Criar Planejamento
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela Clientes e Projetos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes e Projetos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : clientesComProjetos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente ativo encontrado</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Ativos</TableHead>
                    <TableHead className="text-center">Concluídos</TableHead>
                    <TableHead className="text-center">Pendentes</TableHead>
                    <TableHead className="text-center">Pausados</TableHead>
                    <TableHead className="text-center">Status Cliente</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesComProjetos.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {cliente.nome.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{cliente.nome}</p>
                            <p className="text-sm text-muted-foreground">{cliente.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{cliente.totalProjetos}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                          {cliente.projetosAtivos}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                          {cliente.projetosConcluidos}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                          {cliente.projetosPendentes}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                          {cliente.projetosPausados}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(cliente.status)}>
                          {getStatusText(cliente.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleVisualizarCliente(cliente.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="tarefas">
          <TarefasPorSetor />
        </TabsContent>
      </Tabs>
    </div>
  );
}