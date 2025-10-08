import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PendingUser {
  id: string;
  nome: string;
  email: string;
  especialidade: string | null;
  created_at: string;
  cliente_id: string | null;
}

export interface PendingApproval {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  created_at: string;
  cliente_id: string;
  cliente_nome?: string;
  solicitante_nome?: string;
}

export interface OverdueTask {
  id: string;
  titulo: string;
  descricao: string | null;
  data_prazo: string;
  status: string;
  projeto_id: string;
  cliente_nome?: string;
  responsavel_nome?: string;
}

export interface AdminPendencies {
  pendingUsers: PendingUser[];
  pendingApprovals: PendingApproval[];
  overdueTasks: OverdueTask[];
  totalCritical: number;
  loading: boolean;
}

export function useAdminPendencies() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-pendencies"],
    queryFn: async () => {
      // 1. Buscar usuários pendentes de aprovação
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, nome, email, especialidade, created_at, cliente_id")
        .eq("status", "pendente_aprovacao")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // 2. Buscar aprovações de clientes pendentes
      const { data: approvals, error: approvalsError } = await supabase
        .from("aprovacoes_cliente")
        .select(`
          id,
          titulo,
          descricao,
          tipo,
          created_at,
          cliente_id,
          clientes!inner(nome)
        `)
        .eq("status", "pendente")
        .order("created_at", { ascending: false });

      if (approvalsError) throw approvalsError;

      // Formatar aprovações
      const formattedApprovals = (approvals || []).map((approval: any) => ({
        id: approval.id,
        titulo: approval.titulo,
        descricao: approval.descricao,
        tipo: approval.tipo,
        created_at: approval.created_at,
        cliente_id: approval.cliente_id,
        cliente_nome: approval.clientes?.nome || "Cliente não encontrado",
      }));

      // 3. Buscar tarefas atrasadas
      const today = new Date().toISOString().split("T")[0];
      const { data: tasks, error: tasksError } = await supabase
        .from("tarefas_projeto")
        .select(`
          id,
          titulo,
          descricao,
          data_prazo,
          status,
          projeto_id,
          projetos!inner(
            cliente_id,
            clientes(nome)
          )
        `)
        .lt("data_prazo", today)
        .not("status", "in", '("concluida","cancelada")')
        .order("data_prazo", { ascending: true })
        .limit(20);

      if (tasksError) throw tasksError;

      // Formatar tarefas
      const formattedTasks = (tasks || []).map((task: any) => ({
        id: task.id,
        titulo: task.titulo,
        descricao: task.descricao,
        data_prazo: task.data_prazo,
        status: task.status,
        projeto_id: task.projeto_id,
        cliente_nome: task.projetos?.clientes?.nome || "Cliente não encontrado",
      }));

      const totalCritical = 
        (users?.length || 0) + 
        (formattedApprovals?.length || 0) + 
        (formattedTasks?.length || 0);

      return {
        pendingUsers: users || [],
        pendingApprovals: formattedApprovals,
        overdueTasks: formattedTasks,
        totalCritical,
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  return {
    pendingUsers: data?.pendingUsers || [],
    pendingApprovals: data?.pendingApprovals || [],
    overdueTasks: data?.overdueTasks || [],
    totalCritical: data?.totalCritical || 0,
    loading: isLoading,
    refetch,
  };
}
