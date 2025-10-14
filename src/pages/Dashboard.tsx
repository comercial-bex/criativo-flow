import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Users, FolderOpen, Target, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BuilderComponent } from '@/components/BuilderComponent';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { SkeletonDashboard } from '@/components/ui/skeleton-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  totalClientes: number;
  totalProjetos: number;
  totalLeads: number;
  tarefasPendentes: number;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    totalProjetos: 0,
    totalLeads: 0,
    tarefasPendentes: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { startTutorial, hasSeenTutorial } = useTutorial('dashboard');

  useEffect(() => {
    // FASE 3: Renderizar UI imediatamente
    setLoading(false);
    
    const fetchStats = async () => {
      try {
        // Try to fetch stats, but use fallbacks if tables don't exist
        const fetchClientesCount = async () => {
          try {
            const { count } = await supabase.from('clientes').select('*', { count: 'exact' });
            return count || 0;
          } catch { return 0; }
        };

        const fetchProjetosCount = async () => {
          try {
            const { count } = await supabase.from('projetos').select('*', { count: 'exact' });
            return count || 0;
          } catch { return 0; }
        };

        const fetchLeadsCount = async () => {
          try {
            const { count } = await supabase.from('leads').select('*', { count: 'exact' });
            return count || 0;
          } catch { return 0; }
        };

        const fetchTarefasCount = async () => {
          try {
            const { count } = await supabase.from('tarefas').select('*', { count: 'exact' }).neq('status', 'concluido');
            return count || 0;
          } catch { return 0; }
        };

        const statsPromises = [
          fetchClientesCount(),
          fetchProjetosCount(),
          fetchLeadsCount(),
          fetchTarefasCount()
        ];

        const [totalClientes, totalProjetos, totalLeads, tarefasPendentes] = await Promise.all(statsPromises);

        setStats({
          totalClientes,
          totalProjetos,
          totalLeads,
          tarefasPendentes
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setStats({
          totalClientes: 0,
          totalProjetos: 0,
          totalLeads: 0,
          tarefasPendentes: 0
        });
      }
    };

    // FASE 3: Buscar dados em background usando requestIdleCallback
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => fetchStats());
    } else {
      setTimeout(() => fetchStats(), 0);
    }
  }, []);

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
      {/* Builder.io Layout */}
      <BuilderComponent model="page" />

      <div className="flex items-center justify-between">
        <SectionHeader
          title="Dashboard"
          description="Visão geral dos seus dados e métricas importantes"
          icon={BarChart3}
        />
        <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
      </div>

      <div data-tour="kpis">
        <StatsGrid stats={statsData} />
      </div>

      <div data-tour="acoes-rapidas">
        <QuickActions
          title="Acesso Rápido"
          actions={quickActions}
          columns={4}
        />
      </div>
    </div>
  );
}

export default Dashboard;