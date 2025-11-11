import { useQueries } from '@tanstack/react-query';
import { StaggerChildren, StaggerItem } from '@/components/transitions';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Users, FolderOpen, Target, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { QUERY_CONFIG } from '@/lib/queryConfig';

function Dashboard() {
  const navigate = useNavigate();
  const { startTutorial, hasSeenTutorial } = useTutorial('dashboard');

  // Execute todas as queries em paralelo com useQueries
  const queries = useQueries({
    queries: [
      {
        queryKey: ['dashboard-stats', 'clientes'],
        queryFn: async () => {
          const { count, error } = await supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true });
          if (error) throw error;
          return count || 0;
        },
        ...QUERY_CONFIG.semiStatic,
      },
      {
        queryKey: ['dashboard-stats', 'projetos'],
        queryFn: async () => {
          const { count, error } = await supabase
            .from('projetos')
            .select('*', { count: 'exact', head: true });
          if (error) throw error;
          return count || 0;
        },
        ...QUERY_CONFIG.semiStatic,
      },
      {
        queryKey: ['dashboard-stats', 'leads'],
        queryFn: async () => {
          const { count, error } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true });
          if (error) throw error;
          return count || 0;
        },
        ...QUERY_CONFIG.dynamic,
      },
      {
        queryKey: ['dashboard-stats', 'tarefas-pendentes'],
        queryFn: async () => {
          const { count, error } = await supabase
            .from('tarefa')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'concluido');
          if (error) throw error;
          return count || 0;
        },
        ...QUERY_CONFIG.dynamic,
      },
    ],
  });

  // Extrai resultados e estados de loading
  const [clientesQuery, projetosQuery, leadsQuery, tarefasQuery] = queries;
  const isLoading = queries.some(q => q.isLoading);

  const stats = {
    totalClientes: clientesQuery.data ?? 0,
    totalProjetos: projetosQuery.data ?? 0,
    totalLeads: leadsQuery.data ?? 0,
    tarefasPendentes: tarefasQuery.data ?? 0,
  };

  const statsData = [
    {
      title: 'Total de Clientes',
      value: stats.totalClientes,
      icon: Users,
      description: 'Clientes cadastrados',
      trend: { value: '12%', isPositive: true },
      dataTour: 'kpi-clientes'
    },
    {
      title: 'Projetos Ativos',
      value: stats.totalProjetos,
      icon: FolderOpen,
      description: 'Projetos em andamento',
      trend: { value: '5%', isPositive: true },
      dataTour: 'kpi-projetos'
    },
    {
      title: 'Leads no Funil',
      value: stats.totalLeads,
      icon: Target,
      description: 'Oportunidades ativas',
      trend: { value: '3%', isPositive: true },
      dataTour: 'kpi-leads'
    },
    {
      title: 'Tarefas Pendentes',
      value: stats.tarefasPendentes,
      icon: Clock,
      description: 'Aguardando execução',
      trend: { value: '2%', isPositive: false },
      dataTour: 'kpi-tarefas'
    }
  ];

  const quickActions = [
    {
      title: 'CRM / Comercial',
      description: 'Gerencie leads e oportunidades de vendas',
      icon: Target,
      onClick: () => navigate('/crm')
    },
    {
      title: 'Clientes',
      description: 'Cadastre e gerencie informações de clientes',
      icon: Users,
      onClick: () => navigate('/clientes')
    },
    {
      title: 'Financeiro',
      description: 'Controle de orçamentos e receitas',
      icon: BarChart3,
      onClick: () => navigate('/financeiro')
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <StaggerChildren staggerDelay={0.1}>
        <StaggerItem>
          <div className="flex items-center justify-between">
            <SectionHeader
              title="Dashboard"
              description="Visão geral dos seus dados e métricas importantes"
              icon={BarChart3}
            />
            <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          </div>
        </StaggerItem>

        <StaggerItem delay={0.1}>
          <div data-tour="kpis">
            <StatsGrid stats={statsData} loading={isLoading} />
          </div>
        </StaggerItem>

        <StaggerItem delay={0.2}>
          <div data-tour="acoes-rapidas">
            <QuickActions
              title="Acesso Rápido"
              actions={quickActions}
              columns={4}
            />
          </div>
        </StaggerItem>
      </StaggerChildren>
    </div>
  );
}

export default Dashboard;