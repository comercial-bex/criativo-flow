import { useState, useEffect } from "react";
import { useAdminPendencies } from "@/hooks/useAdminPendencies";
import { PendencyCard } from "@/components/Admin/PendencyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Users, 
  CheckCircle, 
  Clock,
  Eye,
  CheckSquare,
  XCircle,
  RefreshCw,
  UserX,
  FileText,
  Calculator,
  Briefcase,
  DollarSign,
  FolderOpen,
  Search,
  Filter,
  AlertTriangle
} from "lucide-react";
import { format, formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function CentralNotificacoes() {
  const navigate = useNavigate();
  const { 
    // Critical
    pendingUsers, 
    pendingApprovals, 
    overdueTasks, 
    totalCritical,
    
    // Warning
    inactiveClients,
    expiringContracts,
    pendingBudgets,
    totalWarning,
    
    // Info
    newBriefings,
    upcomingInvoices,
    inactiveProjects,
    totalInfo,
    
    loading,
    refetch
  } = useAdminPendencies();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedSections, setExpandedSections] = useState({
    users: true,
    approvals: true,
    tasks: true,
    inactiveClients: true,
    expiringContracts: true,
    pendingBudgets: true,
    newBriefings: true,
    upcomingInvoices: true,
    inactiveProjects: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Setup realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-pendencies-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: 'status=eq.pendente_aprovacao'
      }, () => refetch())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'aprovacoes_cliente',
        filter: 'status=eq.pendente'
      }, () => refetch())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'briefings'
      }, () => refetch())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleApproveUser = async (userId: string) => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user?.id;
      const { error } = await supabase
        .from("pessoas")
        .update({ 
          status: "aprovado",
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", userId);

      if (error) throw error;

      smartToast.success("Usuário aprovado com sucesso");
      refetch();
    } catch (error) {
      smartToast.error("Erro ao aprovar usuário");
      console.error(error);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("pessoas")
        .update({ 
          status: "rejeitado",
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", userId);

      if (error) throw error;

      smartToast.success("Usuário rejeitado");
      refetch();
    } catch (error) {
      smartToast.error("Erro ao rejeitar usuário");
      console.error(error);
    }
  };

  const totalPendencies = totalCritical + totalWarning + totalInfo;

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Central de Notificações
          </h1>
          <p className="text-muted-foreground mt-2">
            {totalPendencies} itens pendentes no total
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-2 border-red-200 dark:border-red-900/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                🔴 CRÍTICOS
              </p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                {totalCritical}
              </p>
            </div>
            <Bell className="h-12 w-12 text-red-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-900/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                ⚠️ ATENÇÃO
              </p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">
                {totalWarning}
              </p>
            </div>
            <AlertTriangle className="h-12 w-12 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-900/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                📊 INFORMACIONAL
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                {totalInfo}
              </p>
            </div>
            <FileText className="h-12 w-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-2 border-green-200 dark:border-green-900/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                📈 TOTAL
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                {totalPendencies}
              </p>
            </div>
            <Filter className="h-12 w-12 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Todos ({totalPendencies})
          </TabsTrigger>
          <TabsTrigger value="critical">
            🔴 Críticos ({totalCritical})
          </TabsTrigger>
          <TabsTrigger value="warning">
            ⚠️ Atenção ({totalWarning})
          </TabsTrigger>
          <TabsTrigger value="info">
            📊 Info ({totalInfo})
          </TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all" className="space-y-6 mt-6">
          {/* Critical Section */}
          {totalCritical > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                🔴 Itens Críticos
              </h2>
              
              <PendencyCard
                title="Usuários Pendentes de Aprovação"
                count={pendingUsers.length}
                icon={Users}
                variant="critical"
                isExpanded={expandedSections.users}
                onToggle={() => toggleSection("users")}
              >
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{user.nome}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {user.papeis && user.papeis.length > 0 && (
                          <Badge variant="outline">{user.papeis[0]}</Badge>
                        )}
                        {user.cliente_id && (
                          <Badge variant="secondary">Cliente</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistance(new Date(user.created_at), new Date(), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApproveUser(user.id)}
                        className="gap-2"
                      >
                        <CheckSquare className="h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectUser(user.id)}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
              </PendencyCard>

              <PendencyCard
                title="Aprovações de Clientes Pendentes"
                count={pendingApprovals.length}
                icon={CheckCircle}
                variant="critical"
                isExpanded={expandedSections.approvals}
                onToggle={() => toggleSection("approvals")}
              >
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{approval.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {approval.cliente_nome}
                      </p>
                      {approval.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {approval.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{approval.tipo}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistance(new Date(approval.created_at), new Date(), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/aprovacao-job`)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                  </div>
                ))}
              </PendencyCard>

              <PendencyCard
                title="Tarefas Atrasadas"
                count={overdueTasks.length}
                icon={Clock}
                variant="critical"
                isExpanded={expandedSections.tasks}
                onToggle={() => toggleSection("tasks")}
              >
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border border-red-200 dark:border-red-900/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{task.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {task.cliente_nome}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="destructive">
                          Venceu {formatDistance(new Date(task.data_prazo), new Date(), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </Badge>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/tarefas`)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Tarefa
                    </Button>
                  </div>
                ))}
              </PendencyCard>
            </div>
          )}

          {/* Warning Section */}
          {totalWarning > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                ⚠️ Itens de Atenção
              </h2>

              <PendencyCard
                title="Clientes Inativos"
                count={inactiveClients.length}
                icon={UserX}
                variant="warning"
                isExpanded={expandedSections.inactiveClients}
                onToggle={() => toggleSection("inactiveClients")}
              >
                {inactiveClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{client.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Responsável: {client.responsavel_nome}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{client.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Última atualização: {formatDistance(new Date(client.updated_at), new Date(), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/clientes`)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Cliente
                    </Button>
                  </div>
                ))}
              </PendencyCard>

              <PendencyCard
                title="Contratos Próximos do Vencimento"
                count={expiringContracts.length}
                icon={FileText}
                variant="warning"
                isExpanded={expandedSections.expiringContracts}
                onToggle={() => toggleSection("expiringContracts")}
              >
                {expiringContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{contract.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {contract.cliente_nome}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          Vence {formatDistance(new Date(contract.data_fim), new Date(), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </Badge>
                        {contract.valor_mensal && (
                          <Badge variant="secondary">
                            R$ {contract.valor_mensal.toLocaleString('pt-BR')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/contratos`)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Contrato
                    </Button>
                  </div>
                ))}
              </PendencyCard>

              <PendencyCard
                title="Orçamentos Aguardando Resposta"
                count={pendingBudgets.length}
                icon={Calculator}
                variant="warning"
                isExpanded={expandedSections.pendingBudgets}
                onToggle={() => toggleSection("pendingBudgets")}
              >
                {pendingBudgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{budget.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {budget.cliente_nome}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          R$ {budget.valor_total.toLocaleString('pt-BR')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Enviado {formatDistance(new Date(budget.created_at), new Date(), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/administrativo/orcamentos`)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Orçamento
                    </Button>
                  </div>
                ))}
              </PendencyCard>
            </div>
          )}

          {/* Info Section */}
          {totalInfo > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                📊 Itens Informacionais
              </h2>

              <PendencyCard
                title="Novos Briefings (Últimos 7 dias)"
                count={newBriefings.length}
                icon={Briefcase}
                variant="info"
                isExpanded={expandedSections.newBriefings}
                onToggle={() => toggleSection("newBriefings")}
              >
                {newBriefings.map((briefing) => (
                  <div
                    key={briefing.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{briefing.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {briefing.cliente_nome}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistance(new Date(briefing.created_at), new Date(), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/grs/planejamentos`)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Briefing
                    </Button>
                  </div>
                ))}
              </PendencyCard>

              <PendencyCard
                title="Faturas Vencendo Esta Semana"
                count={upcomingInvoices.length}
                icon={DollarSign}
                variant="info"
                isExpanded={expandedSections.upcomingInvoices}
                onToggle={() => toggleSection("upcomingInvoices")}
              >
                {upcomingInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {invoice.numero || invoice.descricao}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {invoice.cliente_nome}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          R$ {invoice.valor.toLocaleString('pt-BR')}
                        </Badge>
                        <Badge variant="outline">
                          Vence em {format(new Date(invoice.vencimento), "dd/MM/yyyy", { locale: ptBR })}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/financeiro`)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Fatura
                    </Button>
                  </div>
                ))}
              </PendencyCard>

              <PendencyCard
                title="Projetos Sem Atividade (>15 dias)"
                count={inactiveProjects.length}
                icon={FolderOpen}
                variant="info"
                isExpanded={expandedSections.inactiveProjects}
                onToggle={() => toggleSection("inactiveProjects")}
              >
                {inactiveProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{project.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {project.cliente_nome}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{project.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Última atividade: {formatDistance(new Date(project.updated_at), new Date(), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/grs/cliente/${project.cliente_nome}/projetos`)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Projeto
                    </Button>
                  </div>
                ))}
              </PendencyCard>
            </div>
          )}
        </TabsContent>

        {/* Critical Only Tab */}
        <TabsContent value="critical" className="space-y-4 mt-6">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            🔴 Itens Críticos
          </h2>
          
          <PendencyCard
            title="Usuários Pendentes de Aprovação"
            count={pendingUsers.length}
            icon={Users}
            variant="critical"
            isExpanded={expandedSections.users}
            onToggle={() => toggleSection("users")}
          >
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium">{user.nome}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {user.papeis && user.papeis.length > 0 && (
                      <Badge variant="outline">{user.papeis[0]}</Badge>
                    )}
                    {user.cliente_id && (
                      <Badge variant="secondary">Cliente</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(new Date(user.created_at), new Date(), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApproveUser(user.id)}
                    className="gap-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRejectUser(user.id)}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </PendencyCard>

          <PendencyCard
            title="Aprovações de Clientes Pendentes"
            count={pendingApprovals.length}
            icon={CheckCircle}
            variant="critical"
            isExpanded={expandedSections.approvals}
            onToggle={() => toggleSection("approvals")}
          >
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium">{approval.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {approval.cliente_nome}
                  </p>
                  {approval.descricao && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {approval.descricao}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{approval.tipo}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(new Date(approval.created_at), new Date(), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/aprovacao-job`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar
                </Button>
              </div>
            ))}
          </PendencyCard>

          <PendencyCard
            title="Tarefas Atrasadas"
            count={overdueTasks.length}
            icon={Clock}
            variant="critical"
            isExpanded={expandedSections.tasks}
            onToggle={() => toggleSection("tasks")}
          >
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-red-200 dark:border-red-900/50"
              >
                <div className="flex-1">
                  <p className="font-medium">{task.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {task.cliente_nome}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="destructive">
                      Venceu {formatDistance(new Date(task.data_prazo), new Date(), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </Badge>
                    <Badge variant="outline">{task.status}</Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/admin/tarefas`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Tarefa
                </Button>
              </div>
            ))}
          </PendencyCard>
        </TabsContent>

        {/* Warning Only Tab */}
        <TabsContent value="warning" className="space-y-4 mt-6">
          <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            ⚠️ Itens de Atenção
          </h2>

          <PendencyCard
            title="Clientes Inativos"
            count={inactiveClients.length}
            icon={UserX}
            variant="warning"
            isExpanded={expandedSections.inactiveClients}
            onToggle={() => toggleSection("inactiveClients")}
          >
            {inactiveClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium">{client.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    Responsável: {client.responsavel_nome}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{client.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Última atualização: {formatDistance(new Date(client.updated_at), new Date(), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/clientes`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Cliente
                </Button>
              </div>
            ))}
          </PendencyCard>

          <PendencyCard
            title="Contratos Próximos do Vencimento"
            count={expiringContracts.length}
            icon={FileText}
            variant="warning"
            isExpanded={expandedSections.expiringContracts}
            onToggle={() => toggleSection("expiringContracts")}
          >
            {expiringContracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium">{contract.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {contract.cliente_nome}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      Vence {formatDistance(new Date(contract.data_fim), new Date(), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </Badge>
                    {contract.valor_mensal && (
                      <Badge variant="secondary">
                        R$ {contract.valor_mensal.toLocaleString('pt-BR')}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/admin/contratos`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Contrato
                </Button>
              </div>
            ))}
          </PendencyCard>

          <PendencyCard
            title="Orçamentos Aguardando Resposta"
            count={pendingBudgets.length}
            icon={Calculator}
            variant="warning"
            isExpanded={expandedSections.pendingBudgets}
            onToggle={() => toggleSection("pendingBudgets")}
          >
            {pendingBudgets.map((budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium">{budget.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {budget.cliente_nome}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      R$ {budget.valor_total.toLocaleString('pt-BR')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Enviado {formatDistance(new Date(budget.created_at), new Date(), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/administrativo/orcamentos`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Orçamento
                </Button>
              </div>
            ))}
          </PendencyCard>
        </TabsContent>

        {/* Info Only Tab */}
        <TabsContent value="info" className="space-y-4 mt-6">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            📊 Itens Informacionais
          </h2>

          <PendencyCard
            title="Novos Briefings (Últimos 7 dias)"
            count={newBriefings.length}
            icon={Briefcase}
            variant="info"
            isExpanded={expandedSections.newBriefings}
            onToggle={() => toggleSection("newBriefings")}
          >
            {newBriefings.map((briefing) => (
              <div
                key={briefing.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium">{briefing.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {briefing.cliente_nome}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(new Date(briefing.created_at), new Date(), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/grs/planejamentos`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Briefing
                </Button>
              </div>
            ))}
          </PendencyCard>

          <PendencyCard
            title="Faturas Vencendo Esta Semana"
            count={upcomingInvoices.length}
            icon={DollarSign}
            variant="info"
            isExpanded={expandedSections.upcomingInvoices}
            onToggle={() => toggleSection("upcomingInvoices")}
          >
            {upcomingInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {invoice.numero || invoice.descricao}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {invoice.cliente_nome}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      R$ {invoice.valor.toLocaleString('pt-BR')}
                    </Badge>
                    <Badge variant="outline">
                      Vence em {format(new Date(invoice.vencimento), "dd/MM/yyyy", { locale: ptBR })}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/financeiro`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Fatura
                </Button>
              </div>
            ))}
          </PendencyCard>

          <PendencyCard
            title="Projetos Sem Atividade (>15 dias)"
            count={inactiveProjects.length}
            icon={FolderOpen}
            variant="info"
            isExpanded={expandedSections.inactiveProjects}
            onToggle={() => toggleSection("inactiveProjects")}
          >
            {inactiveProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium">{project.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {project.cliente_nome}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{project.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Última atividade: {formatDistance(new Date(project.updated_at), new Date(), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/grs/cliente/${project.cliente_nome}/projetos`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Projeto
                </Button>
              </div>
            ))}
          </PendencyCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
