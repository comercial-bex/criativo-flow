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
import { Calendar, Users, Clock, AlertCircle, TrendingUp, BarChart3, Plus, Send, Info, FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GamificationWidget } from "@/components/GamificationWidget";
import { ClientSelector } from "@/components/ClientSelector";
import { SocialDashboardWidget } from "@/components/SocialDashboardWidget";
import { CalendarWidget } from "@/components/CalendarWidget";
import { InteractiveGuideButton } from "@/components/InteractiveGuideButton";
import { SimpleHelpModal } from "@/components/SimpleHelpModal";
import { ProjetoManager } from "@/components/ProjetoManager";
import { TarefasPorSetor } from "@/components/TarefasPorSetor";

interface Cliente {
  id: string;
  nome: string;
  status: string;
}

interface Planejamento {
  id: string;
  titulo: string;
  status: string;
  mes_referencia: string;
  clientes: Cliente;
}

interface DashboardStats {
  total: number;
  em_aprovacao: number;
  reprovados: number;
  prazos_semana: number;
}

export default function GRSDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    em_aprovacao: 0,
    reprovados: 0,
    prazos_semana: 0
  });
  const [clientesAtivos, setClientesAtivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Form state for new planning
  const [formData, setFormData] = useState({
    titulo: "",
    cliente_id: "",
    mes_referencia: "",
    descricao: ""
  });
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchClientes();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch planejamentos with client data
      const { data: planejamentos, error } = await supabase
        .from('planejamentos')
        .select(`
          id,
          titulo,
          status,
          mes_referencia,
          clientes (
            id,
            nome,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats
      const totalPlanejamentos = planejamentos?.length || 0;
      const emAprovacao = planejamentos?.filter(p => p.status === 'em_aprovacao_final' || p.status === 'em_revisao').length || 0;
      const reprovados = planejamentos?.filter(p => p.status === 'reprovado').length || 0;
      
      // Get current week's deadlines (mock for now)
      const prazosEstaSemana = Math.floor(totalPlanejamentos * 0.3);

      setStats({
        total: totalPlanejamentos,
        em_aprovacao: emAprovacao,
        reprovados: reprovados,
        prazos_semana: prazosEstaSemana
      });

      // Group by clients and get latest planning for each
      const clientesMap = new Map();
      planejamentos?.forEach(plan => {
        if (plan.clientes && plan.clientes.status === 'ativo') {
          const clienteId = plan.clientes.id;
          if (!clientesMap.has(clienteId) || 
              new Date(plan.mes_referencia) > new Date(clientesMap.get(clienteId).mes_referencia)) {
            clientesMap.set(clienteId, {
              id: clienteId,
              nome: plan.clientes.nome,
              planejamentoId: plan.id,
              status: plan.status,
              proximoMarco: getProximoMarco(plan.status)
            });
          }
        }
      });

      setClientesAtivos(Array.from(clientesMap.values()).slice(0, 6));
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
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
        .select('id, nome, status')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const getProximoMarco = (status: string) => {
    switch (status) {
      case 'rascunho': return 'Finalizar planejamento';
      case 'em_producao': return 'Aguardando aprovação';
      case 'em_aprovacao_final': return 'Aprovação do cliente';
      case 'reprovado': return 'Corrigir e reenviar';
      case 'finalizado': return 'Executar plano';
      default: return 'Verificar status';
    }
  };

  const summaryData = [
    {
      title: "Planejamentos do Mês",
      value: stats.total.toString(),
      icon: Calendar,
      change: "+2 desde ontem",
      color: "text-blue-600"
    },
    {
      title: "Em Aprovação do Cliente",
      value: stats.em_aprovacao.toString(),
      icon: Clock,
      change: "Aguardando feedback",
      color: "text-orange-500"
    },
    {
      title: "Reprovados com Pendência",
      value: stats.reprovados.toString(),
      icon: AlertCircle,
      change: "Requer atenção",
      color: "text-red-500"
    },
    {
      title: "Prazos Esta Semana",
      value: stats.prazos_semana.toString(),
      icon: TrendingUp,
      change: "6 entregas importantes",
      color: "text-green-600"
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'finalizado': return 'default';
      case 'em_aprovacao_final': 
      case 'em_revisao': return 'secondary';
      case 'reprovado': return 'destructive';
      case 'em_producao': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'finalizado': return 'Finalizado';
      case 'em_aprovacao_final': return 'Em Aprovação';
      case 'em_revisao': return 'Em Revisão';
      case 'reprovado': return 'Reprovado';
      case 'em_producao': return 'Em Produção';
      case 'rascunho': return 'Rascunho';
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
      fetchDashboardData();
    } catch (error) {
      console.error('Erro ao criar planejamento:', error);
      toast({
        title: "Erro ao criar planejamento",
        description: "Não foi possível criar o planejamento",
        variant: "destructive",
      });
    }
  };

  const handleEntrarNoPlan = (cliente: any) => {
    if (cliente.planejamentoId) {
      navigate(`/grs/planejamento/${cliente.planejamentoId}`);
    } else {
      navigate(`/grs/planejamentos`);
    }
  };

  const helpContent = {
    title: "Como usar o Dashboard GRS",
    sections: [
      {
        title: "📊 Visão Geral",
        content: "O Dashboard mostra um resumo de todos os planejamentos e atividades GRS. Use este espaço para ter uma visão rápida do progresso dos seus clientes."
      },
      {
        title: "🎯 Ações Rápidas",
        content: "• Criar Planejamento: Inicie um novo projeto para um cliente\n• Ver Todos: Acesse a lista completa de planejamentos\n• Meus Clientes: Acompanhe o status de cada cliente"
      },
      {
        title: "📈 Métricas",
        content: "• Planejamentos do Mês: Total de projetos ativos\n• Em Aprovação: Aguardando retorno do cliente\n• Reprovados: Precisam de revisão\n• Prazos: Entregas importantes da semana"
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

      {/* Client Selector */}
      <ClientSelector 
        onClientSelect={setSelectedClientId}
        selectedClientId={selectedClientId}
      />

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas por Setor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-intro="criar-planejamento">
                <Plus className="h-4 w-4 mr-2" />
                Criar Planejamento
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
          <Button variant="outline" onClick={() => navigate('/grs/planejamentos')} data-intro="ver-planejamentos">
            <FileText className="h-4 w-4 mr-2" />
            Ver Todos os Planejamentos
          </Button>
          <Button variant="outline" onClick={() => navigate('/grs/aprovacoes')} data-intro="aprovacoes-rapidas">
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovações Pendentes
          </Button>
          </div>
        </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <SocialDashboardWidget />
        <CalendarWidget />
        {summaryData.map((item, index) => (
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

      {/* Gamification Widget */}
      <GamificationWidget setor="grs" />

      {/* Meus Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Meus Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : clientesAtivos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum cliente ativo encontrado</p>
              </div>
            ) : (
              clientesAtivos.map((cliente) => (
                <div key={cliente.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>{cliente.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{cliente.nome}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Próximo: {cliente.proximoMarco}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusVariant(cliente.status)}>
                      {getStatusText(cliente.status)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => handleEntrarNoPlan(cliente)} variant="outline">
                        Planejamento
                      </Button>
                      <Button size="sm" onClick={() => navigate(`/grs/cliente/${cliente.id}/projetos`)}>
                        Projetos
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="projetos">
          <ProjetoManager />
        </TabsContent>
        
        <TabsContent value="tarefas">
          <TarefasPorSetor />
        </TabsContent>
      </Tabs>
    </div>
  );
}