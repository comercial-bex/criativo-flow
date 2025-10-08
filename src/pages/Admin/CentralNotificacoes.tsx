import { useState } from "react";
import { useAdminPendencies } from "@/hooks/useAdminPendencies";
import { PendencyCard } from "@/components/Admin/PendencyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Users, 
  CheckCircle, 
  Clock,
  Eye,
  CheckSquare,
  XCircle,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function CentralNotificacoes() {
  const navigate = useNavigate();
  const { 
    pendingUsers, 
    pendingApprovals, 
    overdueTasks, 
    totalCritical,
    loading,
    refetch
  } = useAdminPendencies();

  const [expandedSections, setExpandedSections] = useState({
    users: true,
    approvals: true,
    tasks: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          status: "aprovado",
          aprovado_por: (await supabase.auth.getUser()).data.user?.id,
          data_aprovacao: new Date().toISOString(),
        })
        .eq("id", userId);

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
        .from("profiles")
        .update({ 
          status: "rejeitado",
          aprovado_por: (await supabase.auth.getUser()).data.user?.id,
          data_aprovacao: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      smartToast.success("Usuário rejeitado");
      refetch();
    } catch (error) {
      smartToast.error("Erro ao rejeitar usuário");
      console.error(error);
    }
  };

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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Central de Notificações
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie todos os itens pendentes de forma centralizada
          </p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                🔴 CRÍTICOS
              </p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                {totalCritical}
              </p>
            </div>
            <Bell className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                ✅ Usuários Pendentes
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                {pendingUsers.length}
              </p>
            </div>
            <Users className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                📋 Aprovações Cliente
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                {pendingApprovals.length}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-blue-500" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Critical Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
          🔴 Itens Críticos
        </h2>

        {/* Pending Users */}
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
                  {user.especialidade && (
                    <Badge variant="outline">{user.especialidade}</Badge>
                  )}
                  {user.cliente_id && (
                    <Badge variant="secondary">Cliente</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(user.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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

        {/* Pending Approvals */}
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
                    {format(new Date(approval.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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

        {/* Overdue Tasks */}
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
                    Venceu em {format(new Date(task.data_prazo), "dd/MM/yyyy", { locale: ptBR })}
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
    </div>
  );
}
