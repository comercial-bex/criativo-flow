import { useState, useEffect } from 'react';
import { BexCard, BexCardContent, BexCardDescription, BexCardHeader, BexCardTitle } from '@/components/ui/bex-card';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { Users, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  totalEquipe: number;
  metasAlcancadas: number;
  projetos: number;
  alertas: number;
}

export default function GestorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEquipe: 0,
    metasAlcancadas: 0,
    projetos: 0,
    alertas: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data para demonstração
    setStats({
      totalEquipe: 32,
      metasAlcancadas: 87,
      projetos: 45,
      alertas: 3,
    });
  };

  const statsCards = [
    {
      title: 'Equipe Total',
      value: stats.totalEquipe.toString(),
      description: 'Colaboradores ativos',
      icon: Users,
      trend: { value: '+2', isPositive: true }
    },
    {
      title: 'Metas Alcançadas',
      value: `${stats.metasAlcancadas}%`,
      description: 'Deste mês',
      icon: Target,
      trend: { value: '+12%', isPositive: true }
    },
    {
      title: 'Projetos Ativos',
      value: stats.projetos.toString(),
      description: 'Em andamento',
      icon: TrendingUp,
      trend: { value: '+8', isPositive: true }
    },
    {
      title: 'Alertas',
      value: stats.alertas.toString(),
      description: 'Precisam atenção',
      icon: AlertTriangle,
      trend: { value: '1', isPositive: false }
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard Gestor"
        description="Visão executiva de equipes, projetos e performance geral"
      />

      <StatsGrid stats={statsCards} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BexCard variant="gaming">
          <BexCardHeader>
            <BexCardTitle>Performance por Equipe</BexCardTitle>
            <BexCardDescription>Indicadores principais de cada área</BexCardDescription>
          </BexCardHeader>
          <BexCardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">GRS</span>
                <div className="text-right">
                  <p className="text-sm font-medium">92%</p>
                  <p className="text-xs text-muted-foreground">23 projetos</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Design</span>
                <div className="text-right">
                  <p className="text-sm font-medium">88%</p>
                  <p className="text-xs text-muted-foreground">18 projetos</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tráfego</span>
                <div className="text-right">
                  <p className="text-sm font-medium">95%</p>
                  <p className="text-xs text-muted-foreground">12 campanhas</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Atendimento</span>
                <div className="text-right">
                  <p className="text-sm font-medium">94%</p>
                  <p className="text-xs text-muted-foreground">156 clientes</p>
                </div>
              </div>
            </div>
          </BexCardContent>
        </BexCard>

        <BexCard variant="glass">
          <BexCardHeader>
            <BexCardTitle>Alertas e Pendências</BexCardTitle>
            <BexCardDescription>Itens que precisam de sua atenção</BexCardDescription>
          </BexCardHeader>
          <BexCardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg border-red-200">
                <div>
                  <p className="font-medium text-red-800">Projeto atrasado</p>
                  <p className="text-sm text-muted-foreground">Cliente XYZ - 3 dias de atraso</p>
                </div>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">Urgente</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg border-yellow-200">
                <div>
                  <p className="font-medium text-yellow-800">Aprovação pendente</p>
                  <p className="text-sm text-muted-foreground">Orçamento #1245 - R$ 15.000</p>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Média</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg border-blue-200">
                <div>
                  <p className="font-medium text-blue-800">Reunião agendada</p>
                  <p className="text-sm text-muted-foreground">Review mensal - Hoje às 15h</p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Info</span>
              </div>
            </div>
          </BexCardContent>
        </BexCard>
      </div>
    </div>
  );
}