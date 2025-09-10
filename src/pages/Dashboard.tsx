import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, FolderOpen, Target, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalClientes: number;
  totalProjetos: number;
  totalLeads: number;
  tarefasPendentes: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const statsCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClientes,
      icon: Users,
      description: 'Clientes cadastrados',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Projetos Ativos',
      value: stats.totalProjetos,
      icon: FolderOpen,
      description: 'Projetos em andamento',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Leads no Funil',
      value: stats.totalLeads,
      icon: Target,
      description: 'Oportunidades ativas',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Tarefas Pendentes',
      value: stats.tarefasPendentes,
      icon: Clock,
      description: 'Aguardando execução',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">ERP Agência Marketing</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Bem-vindo, {user?.email}
            </span>
            <Button onClick={handleSignOut} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral dos seus dados e métricas importantes
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/crm')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>CRM / Comercial</span>
              </CardTitle>
              <CardDescription>
                Gerencie leads e oportunidades de vendas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/projetos')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5" />
                <span>Projetos</span>
              </CardTitle>
              <CardDescription>
                Acompanhe projetos e tarefas em andamento
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/clientes')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Clientes</span>
              </CardTitle>
              <CardDescription>
                Cadastre e gerencie informações de clientes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/financeiro')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Financeiro</span>
              </CardTitle>
              <CardDescription>
                Controle de orçamentos e receitas
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;