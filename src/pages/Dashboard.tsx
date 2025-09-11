import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, FolderOpen, Target, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BuilderComponent } from '@/components/BuilderComponent';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';

interface DashboardStats {
  totalClientes: number;
  totalProjetos: number;
  totalLeads: number;
  tarefasPendentes: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    totalProjetos: 0,
    totalLeads: 0,
    tarefasPendentes: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientes, projetos, leads, tarefas] = await Promise.all([
          supabase.from('clientes').select('*', { count: 'exact' }),
          supabase.from('projetos').select('*', { count: 'exact' }),
          supabase.from('leads').select('*', { count: 'exact' }),
          supabase.from('tarefas').select('*', { count: 'exact' }).neq('status', 'concluido')
        ]);

        setStats({
          totalClientes: clientes.count || 0,
          totalProjetos: projetos.count || 0,
          totalLeads: leads.count || 0,
          tarefasPendentes: tarefas.count || 0
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      title: 'Total de Clientes',
      value: loading ? '...' : stats.totalClientes,
      icon: Users,
      description: 'Clientes cadastrados',
      trend: { value: '12%', isPositive: true }
    },
    {
      title: 'Projetos Ativos',
      value: loading ? '...' : stats.totalProjetos,
      icon: FolderOpen,
      description: 'Projetos em andamento',
      trend: { value: '5%', isPositive: true }
    },
    {
      title: 'Leads no Funil',
      value: loading ? '...' : stats.totalLeads,
      icon: Target,
      description: 'Oportunidades ativas',
      trend: { value: '3%', isPositive: true }
    },
    {
      title: 'Tarefas Pendentes',
      value: loading ? '...' : stats.tarefasPendentes,
      icon: Clock,
      description: 'Aguardando execução',
      trend: { value: '2%', isPositive: false }
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
      title: 'Projetos',
      description: 'Acompanhe projetos e tarefas em andamento',
      icon: FolderOpen,
      onClick: () => navigate('/projetos')
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

      <SectionHeader
        title="Dashboard"
        description="Visão geral dos seus dados e métricas importantes"
        icon={BarChart3}
      />

      <StatsGrid stats={statsData} />

      <QuickActions
        title="Acesso Rápido"
        actions={quickActions}
        columns={4}
      />
    </div>
  );
};

export default Dashboard;