import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BexCard, BexCardContent, BexCardHeader, BexCardTitle } from "@/components/ui/bex-card";
import { Button } from "@/components/ui/button";
import { BexBadge } from "@/components/ui/bex-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Users, Clock, AlertCircle, TrendingUp, BarChart3, Plus, Send, Info, FileText, CheckCircle, Eye, Bell, MessageSquare, Zap, Megaphone, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GamificationWidget } from "@/components/GamificationWidget";
import { CalendarWidget } from "@/components/CalendarWidget";
import { SimpleHelpModal } from "@/components/SimpleHelpModal";
import { TarefasPorSetor } from "@/components/TarefasPorSetor";
import { CriarProjetoAvulsoModal } from "@/components/CriarProjetoAvulsoModal";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

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
  aprovacoesPendentes: number;
  mensagensNaoLidas: number;
}

interface DashboardMetrics {
  clientesAtivos: number;
  totalProjetos: number;
  projetosAtivos: number;
  projetosConcluidos: number;
}

type FiltroStatus = 'todos' | 'ativos' | 'concluidos';

export default function GRSDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTutorial, hasSeenTutorial } = useTutorial('grs-dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    clientesAtivos: 0,
    totalProjetos: 0,
    projetosAtivos: 0,
    projetosConcluidos: 0
  });
  const [clientesComProjetos, setClientesComProjetos] = useState<ClienteComProjetos[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoModal, setTipoModal] = useState<'avulso' | 'campanha' | 'plano_editorial'>('avulso');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');

  useEffect(() => {
    fetchClientesEProjetos();
  }, []);

  const fetchClientesEProjetos = async () => {
    try {
      // 🔍 FASE 1: Buscar usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('🔍 Buscando dados para GRS:', user.id);

      // 🎯 FASE 1: Filtrar clientes por GRS responsável
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome, email, status')
        .eq('status', 'ativo')
        .eq('responsavel_id', user.id)  // ✅ Filtrar por GRS responsável
        .order('nome');

      if (clientesError) throw clientesError;
      console.log('📊 Clientes vinculados ao GRS:', clientes?.length || 0);

      // 🎯 FASE 2: Buscar projetos onde GRS está vinculado
      // 1️⃣ Buscar projetos onde GRS é responsável direto
      const { data: projetosResponsavel, error: projetosError1 } = await supabase
        .from('projetos')
        .select('id, cliente_id, status, responsavel_grs_id')
        .eq('responsavel_grs_id', user.id);

      if (projetosError1) {
        console.error('❌ Erro ao buscar projetos como responsável:', projetosError1);
        throw projetosError1;
      }

      console.log('📊 Projetos como responsável:', projetosResponsavel?.length || 0);

      // 2️⃣ Buscar projetos onde GRS está como especialista
      const { data: especialistaLinks, error: projetosError2 } = await supabase
        .from('projeto_especialistas')
        .select('projeto_id')
        .eq('especialista_id', user.id)
        .eq('especialidade', 'grs');

      if (projetosError2) {
        console.error('❌ Erro ao buscar projetos como especialista:', projetosError2);
        throw projetosError2;
      }

      console.log('📊 Links como especialista:', especialistaLinks?.length || 0);

      // 3️⃣ Se houver projetos como especialista, buscar seus dados completos
      let projetosEspecialista: any[] = [];
      if (especialistaLinks && especialistaLinks.length > 0) {
        const projetoIds = especialistaLinks.map(link => link.projeto_id);
        
        const { data, error: projetosError3 } = await supabase
          .from('projetos')
          .select('id, cliente_id, status, responsavel_grs_id')
          .in('id', projetoIds);
          
        if (projetosError3) {
          console.error('❌ Erro ao buscar dados dos projetos especialistas:', projetosError3);
          throw projetosError3;
        }
        
        projetosEspecialista = data || [];
        console.log('📊 Projetos como especialista:', projetosEspecialista.length);
      }

      // 4️⃣ Unir e remover duplicatas
      const projetosMap = new Map();

      // Adicionar projetos como responsável
      (projetosResponsavel || []).forEach(projeto => {
        projetosMap.set(projeto.id, projeto);
      });

      // Adicionar projetos como especialista (não sobrescreve duplicatas)
      projetosEspecialista.forEach(projeto => {
        if (!projetosMap.has(projeto.id)) {
          projetosMap.set(projeto.id, projeto);
        }
      });

      // Converter Map para array
      const projetos = Array.from(projetosMap.values());

      console.log('📁 Total de projetos vinculados ao GRS:', projetos.length);

      // ✅ Validar estrutura dos dados
      const projetosInvalidos = projetos.filter(p => !p.id || !p.cliente_id);
      if (projetosInvalidos.length > 0) {
        console.warn('⚠️ Projetos com dados incompletos:', projetosInvalidos);
      }

      // 🎯 FASE 3: Filtrar planejamentos vinculados
      const { data: planejamentos, error: planejamentosError } = await supabase
        .from('planejamentos')
        .select('id, cliente_id, status')
        .eq('responsavel_grs_id', user.id);  // ✅ Filtrar por GRS responsável

      if (planejamentosError) throw planejamentosError;
      console.log('📅 Planejamentos vinculados ao GRS:', planejamentos?.length || 0);

      // Simulação de dados de aprovações e mensagens para demonstração
      // Em produção, buscar das tabelas reais

      // Calculate metrics per client
      const clientesComStats = clientes?.map(cliente => {
        const projetosCliente = projetos?.filter(p => p.cliente_id === cliente.id) || [];
        const planejamentosCliente = planejamentos?.filter(p => p.cliente_id === cliente.id) || [];
        
        const todosProjetos = [...projetosCliente, ...planejamentosCliente];
        
        // Contar aprovações pendentes para este cliente (simulação por agora)
        const aprovacoesPendentes = Math.floor(Math.random() * 2); // 0-1 aprovações pendentes
        
        // Contar mensagens não lidas para usuários deste cliente (simulação)
        const mensagensNaoLidas = Math.floor(Math.random() * 3); // 0-2 mensagens
        
        return {
          ...cliente,
          totalProjetos: todosProjetos.length,
          projetosAtivos: todosProjetos.filter(p => 
            ['em_andamento', 'em_producao', 'iniciado', 'ativo'].includes(p.status)
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
          aprovacoesPendentes,
          mensagensNaoLidas,
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

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
      console.error('❌ Detalhes completos:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      
      toast({
        title: "❌ Erro ao carregar dashboard",
        description: error?.message || "Não foi possível carregar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const metricsData = [
    {
      title: "Clientes Ativos",
      value: metrics.clientesAtivos.toString(),
      icon: Users,
      change: "Clientes em operação",
      color: "text-bex"
    },
    {
      title: "Total Projetos",
      value: metrics.totalProjetos.toString(),
      icon: FileText,
      change: "Projetos + Planejamentos",
      color: "text-bex"
    },
    {
      title: "Projetos Ativos",
      value: metrics.projetosAtivos.toString(),
      icon: Clock,
      change: "Em andamento",
      color: "text-orange-400"
    },
    {
      title: "Projetos Concluídos",
      value: metrics.projetosConcluidos.toString(),
      icon: CheckCircle,
      change: "Finalizados com sucesso",
      color: "text-bex"
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
            <Button variant="outline" size="sm" data-tour="dashboard-help">
              <Info className="h-4 w-4 mr-2" />
              Como usar
            </Button>
          </SimpleHelpModal>
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
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
            {/* 🎯 FASE 4: Filtros de Status */}
            <Button
              variant={filtroStatus === 'todos' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('todos')}
              size="sm"
            >
              Todos os Clientes
            </Button>
            <Button
              variant={filtroStatus === 'ativos' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('ativos')}
              size="sm"
            >
              Com Projetos Ativos
            </Button>
            <Button
              variant={filtroStatus === 'concluidos' ? 'default' : 'outline'}
              onClick={() => setFiltroStatus('concluidos')}
              size="sm"
            >
              Com Projetos Concluídos
            </Button>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button data-tour="criar-planejamento">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuItem 
                  onClick={() => {
                    setTipoModal('avulso');
                    setDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Zap className="h-4 w-4 mr-2 text-green-500" />
                  <div className="flex flex-col">
                    <div className="font-medium">Projeto Avulso</div>
                    <div className="text-xs text-muted-foreground">Job pontual, produto rápido</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setTipoModal('campanha');
                    setDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Megaphone className="h-4 w-4 mr-2 text-purple-500" />
                  <div className="flex flex-col">
                    <div className="font-medium">Campanha Publicitária</div>
                    <div className="text-xs text-muted-foreground">Ação com múltiplas peças</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setTipoModal('plano_editorial');
                    setDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <div className="flex flex-col">
                    <div className="font-medium">Plano Editorial</div>
                    <div className="text-xs text-muted-foreground">Planejamento mensal de conteúdo</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Modal de Criação */}
        <CriarProjetoAvulsoModal
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          tipo={tipoModal}
          onSuccess={async () => {
            setDialogOpen(false);
            
            toast({
              title: "✅ Projeto criado com sucesso!",
              description: "Atualizando dashboard...",
            });
            
            setLoading(true);
            await fetchClientesEProjetos();
            
            toast({
              title: "✅ Dashboard atualizado!",
              description: "O novo projeto já aparece na lista.",
            });
          }}
        />

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour="metricas">
        {metricsData.map((item, index) => (
          <BexCard variant="glow" key={index} className="hover-lift-bex">
            <BexCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <BexCardTitle className="text-sm font-medium text-bex">
                {item.title}
              </BexCardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </BexCardHeader>
            <BexCardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.change}
              </p>
            </BexCardContent>
          </BexCard>
        ))}
      </div>

      {/* Tabela Clientes e Projetos */}
      <BexCard variant="gaming">
        <BexCardHeader>
          <BexCardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-bex" />
            Clientes e Projetos
          </BexCardTitle>
        </BexCardHeader>
        <BexCardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : clientesComProjetos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente vinculado a você encontrado</p>
            </div>
          ) : (() => {
            // 🎯 Aplicar filtro de status
            const clientesFiltrados = clientesComProjetos.filter(cliente => {
              if (filtroStatus === 'ativos') return cliente.projetosAtivos > 0;
              if (filtroStatus === 'concluidos') return cliente.projetosConcluidos > 0;
              return true; // 'todos'
            });

            return clientesFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum cliente com {filtroStatus === 'ativos' ? 'projetos ativos' : 'projetos concluídos'}
                </p>
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
                    <TableHead className="text-center">Alertas</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente) => (
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
                        <BexBadge variant="bexOutline">{cliente.totalProjetos}</BexBadge>
                      </TableCell>
                      <TableCell className="text-center">
                        <BexBadge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                          {cliente.projetosAtivos}
                        </BexBadge>
                      </TableCell>
                      <TableCell className="text-center">
                        <BexBadge variant="bex">
                          {cliente.projetosConcluidos}
                        </BexBadge>
                      </TableCell>
                      <TableCell className="text-center">
                        <BexBadge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                          {cliente.projetosPendentes}
                        </BexBadge>
                      </TableCell>
                      <TableCell className="text-center">
                        <BexBadge variant="secondary">
                          {cliente.projetosPausados}
                        </BexBadge>
                      </TableCell>
                      <TableCell className="text-center">
                        <BexBadge variant={getStatusVariant(cliente.status)}>
                          {getStatusText(cliente.status)}
                        </BexBadge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {cliente.aprovacoesPendentes > 0 && (
                            <BexBadge variant="destructive" className="flex items-center gap-1">
                              <Bell className="h-3 w-3" />
                              {cliente.aprovacoesPendentes}
                            </BexBadge>
                          )}
                          {cliente.mensagensNaoLidas > 0 && (
                            <BexBadge variant="secondary" className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {cliente.mensagensNaoLidas}
                            </BexBadge>
                          )}
                          {cliente.aprovacoesPendentes === 0 && cliente.mensagensNaoLidas === 0 && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
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
            );
          })()}
        </BexCardContent>
      </BexCard>
        </TabsContent>
        
        <TabsContent value="tarefas">
          <TarefasPorSetor />
        </TabsContent>
      </Tabs>
    </div>
  );
}