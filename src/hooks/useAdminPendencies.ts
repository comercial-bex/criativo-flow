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

export interface InactiveClient {
  id: string;
  nome: string;
  status: string;
  updated_at: string;
  responsavel_nome?: string;
}

export interface ExpiringContract {
  id: string;
  titulo: string;
  data_fim: string;
  cliente_nome?: string;
  valor_mensal: number | null;
}

export interface PendingBudget {
  id: string;
  titulo: string;
  created_at: string;
  cliente_nome?: string;
  valor_total: number;
}

export interface NewBriefing {
  id: string;
  titulo: string;
  created_at: string;
  cliente_nome?: string;
}

export interface UpcomingInvoice {
  id: string;
  numero: string | null;
  descricao: string;
  vencimento: string;
  valor: number;
  cliente_nome?: string;
}

export interface InactiveProject {
  id: string;
  titulo: string;
  updated_at: string;
  cliente_nome?: string;
  status: string;
}

export interface AdminPendencies {
  // Critical
  pendingUsers: PendingUser[];
  pendingApprovals: PendingApproval[];
  overdueTasks: OverdueTask[];
  totalCritical: number;
  
  // Warning (Atenção)
  inactiveClients: InactiveClient[];
  expiringContracts: ExpiringContract[];
  pendingBudgets: PendingBudget[];
  totalWarning: number;
  
  // Info (Informacional)
  newBriefings: NewBriefing[];
  upcomingInvoices: UpcomingInvoice[];
  inactiveProjects: InactiveProject[];
  totalInfo: number;
  
  loading: boolean;
}

export function useAdminPendencies() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-pendencies"],
    queryFn: async () => {
      // ========== CRITICAL ==========
      
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

      const formattedTasks = (tasks || []).map((task: any) => ({
        id: task.id,
        titulo: task.titulo,
        descricao: task.descricao,
        data_prazo: task.data_prazo,
        status: task.status,
        projeto_id: task.projeto_id,
        cliente_nome: task.projetos?.clientes?.nome || "Cliente não encontrado",
      }));

      // ========== WARNING (ATENÇÃO) ==========
      
      // 4. Buscar clientes inativos
      const { data: inactiveClients, error: inactiveError } = await supabase
        .from("clientes")
        .select(`
          id,
          nome,
          status,
          updated_at,
          profiles!clientes_responsavel_id_fkey(nome)
        `)
        .eq("status", "inativo")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (inactiveError) throw inactiveError;

      const formattedInactiveClients = (inactiveClients || []).map((client: any) => ({
        id: client.id,
        nome: client.nome,
        status: client.status,
        updated_at: client.updated_at,
        responsavel_nome: client.profiles?.nome || "Sem responsável",
      }));

      // 5. Buscar contratos próximos do vencimento (30 dias)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { data: contracts, error: contractsError } = await supabase
        .from("contratos")
        .select(`
          id,
          titulo,
          data_fim,
          valor_mensal,
          clientes!inner(nome)
        `)
        .eq("status", "vigente")
        .lte("data_fim", thirtyDaysFromNow.toISOString().split("T")[0])
        .order("data_fim", { ascending: true })
        .limit(20);

      if (contractsError) throw contractsError;

      const formattedContracts = (contracts || []).map((contract: any) => ({
        id: contract.id,
        titulo: contract.titulo,
        data_fim: contract.data_fim,
        valor_mensal: contract.valor_mensal,
        cliente_nome: contract.clientes?.nome || "Cliente não encontrado",
      }));

      // 6. Buscar orçamentos aguardando resposta (> 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: budgets, error: budgetsError } = await supabase
        .from("orcamentos")
        .select(`
          id,
          titulo,
          created_at,
          valor_total,
          clientes!inner(nome)
        `)
        .eq("status", "em_analise")
        .lte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true })
        .limit(20);

      if (budgetsError) throw budgetsError;

      const formattedBudgets = (budgets || []).map((budget: any) => ({
        id: budget.id,
        titulo: budget.titulo,
        created_at: budget.created_at,
        valor_total: budget.valor_total,
        cliente_nome: budget.clientes?.nome || "Cliente não encontrado",
      }));

      // ========== INFO (INFORMACIONAL) ==========
      
      // 7. Buscar novas solicitações de briefing (últimos 7 dias)
      const { data: briefings, error: briefingsError } = await supabase
        .from("briefings")
        .select(`
          id,
          titulo,
          created_at,
          clientes!inner(nome)
        `)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      if (briefingsError) throw briefingsError;

      const formattedBriefings = (briefings || []).map((briefing: any) => ({
        id: briefing.id,
        titulo: briefing.titulo,
        created_at: briefing.created_at,
        cliente_nome: briefing.clientes?.nome || "Cliente não encontrado",
      }));

      // 8. Buscar faturas vencendo esta semana
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: invoices, error: invoicesError } = await supabase
        .from("faturas")
        .select(`
          id,
          numero,
          descricao,
          vencimento,
          valor,
          clientes!inner(nome)
        `)
        .eq("status", "pendente")
        .gte("vencimento", today)
        .lte("vencimento", nextWeek.toISOString().split("T")[0])
        .order("vencimento", { ascending: true })
        .limit(20);

      if (invoicesError) throw invoicesError;

      const formattedInvoices = (invoices || []).map((invoice: any) => ({
        id: invoice.id,
        numero: invoice.numero,
        descricao: invoice.descricao,
        vencimento: invoice.vencimento,
        valor: invoice.valor,
        cliente_nome: invoice.clientes?.nome || "Cliente não encontrado",
      }));

      // 9. Buscar projetos sem atividade recente (> 15 dias)
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      
      const { data: projects, error: projectsError } = await supabase
        .from("projetos")
        .select(`
          id,
          titulo,
          updated_at,
          status,
          clientes!inner(nome)
        `)
        .eq("status", "ativo")
        .lte("updated_at", fifteenDaysAgo.toISOString())
        .order("updated_at", { ascending: true })
        .limit(20);

      if (projectsError) throw projectsError;

      const formattedProjects = (projects || []).map((project: any) => ({
        id: project.id,
        titulo: project.titulo,
        updated_at: project.updated_at,
        status: project.status,
        cliente_nome: project.clientes?.nome || "Cliente não encontrado",
      }));

      // Calcular totais
      const totalCritical = 
        (users?.length || 0) + 
        (formattedApprovals?.length || 0) + 
        (formattedTasks?.length || 0);

      const totalWarning = 
        (formattedInactiveClients?.length || 0) + 
        (formattedContracts?.length || 0) + 
        (formattedBudgets?.length || 0);

      const totalInfo = 
        (formattedBriefings?.length || 0) + 
        (formattedInvoices?.length || 0) + 
        (formattedProjects?.length || 0);

      return {
        // Critical
        pendingUsers: users || [],
        pendingApprovals: formattedApprovals,
        overdueTasks: formattedTasks,
        totalCritical,
        
        // Warning
        inactiveClients: formattedInactiveClients,
        expiringContracts: formattedContracts,
        pendingBudgets: formattedBudgets,
        totalWarning,
        
        // Info
        newBriefings: formattedBriefings,
        upcomingInvoices: formattedInvoices,
        inactiveProjects: formattedProjects,
        totalInfo,
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  return {
    // Critical
    pendingUsers: data?.pendingUsers || [],
    pendingApprovals: data?.pendingApprovals || [],
    overdueTasks: data?.overdueTasks || [],
    totalCritical: data?.totalCritical || 0,
    
    // Warning
    inactiveClients: data?.inactiveClients || [],
    expiringContracts: data?.expiringContracts || [],
    pendingBudgets: data?.pendingBudgets || [],
    totalWarning: data?.totalWarning || 0,
    
    // Info
    newBriefings: data?.newBriefings || [],
    upcomingInvoices: data?.upcomingInvoices || [],
    inactiveProjects: data?.inactiveProjects || [],
    totalInfo: data?.totalInfo || 0,
    
    loading: isLoading,
    refetch,
  };
}
