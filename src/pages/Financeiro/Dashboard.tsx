import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { DollarSign, TrendingUp, PieChart, AlertCircle } from 'lucide-react';

interface DashboardStats {
  receitaTotal: number;
  receitaRecorrente: number;
  pendentesRecebimento: number;
  inadimplencia: number;
}

export default function FinanceiroDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    receitaTotal: 0,
    receitaRecorrente: 0,
    pendentesRecebimento: 0,
    inadimplencia: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data para demonstração
    setStats({
      receitaTotal: 185000,
      receitaRecorrente: 125000,
      pendentesRecebimento: 35000,
      inadimplencia: 2.5,
    });
  };

  const statsCards = [
    {
      title: 'Receita Total',
      value: `R$ ${stats.receitaTotal.toLocaleString()}`,
      description: 'Últimos 30 dias',
      icon: DollarSign,
      trend: { value: '+18%', isPositive: true }
    },
    {
      title: 'Receita Recorrente',
      value: `R$ ${stats.receitaRecorrente.toLocaleString()}`,
      description: 'MRR atual',
      icon: TrendingUp,
      trend: { value: '+12%', isPositive: true }
    },
    {
      title: 'Pendentes',
      value: `R$ ${stats.pendentesRecebimento.toLocaleString()}`,
      description: 'A receber',
      icon: PieChart,
      trend: { value: '5%', isPositive: false }
    },
    {
      title: 'Inadimplência',
      value: `${stats.inadimplencia}%`,
      description: 'Taxa mensal',
      icon: AlertCircle,
      trend: { value: '0.5%', isPositive: false }
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard Financeiro"
        description="Acompanhe receitas, despesas e indicadores financeiros"
      />

      <StatsGrid stats={statsCards} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
            <CardDescription>Distribuição por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Gestão de Redes Sociais</span>
                <div className="text-right">
                  <p className="text-sm font-medium">R$ 85.000</p>
                  <p className="text-xs text-muted-foreground">46%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tráfego Pago</span>
                <div className="text-right">
                  <p className="text-sm font-medium">R$ 55.000</p>
                  <p className="text-xs text-muted-foreground">30%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Design</span>
                <div className="text-right">
                  <p className="text-sm font-medium">R$ 25.000</p>
                  <p className="text-xs text-muted-foreground">14%</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Audiovisual</span>
                <div className="text-right">
                  <p className="text-sm font-medium">R$ 20.000</p>
                  <p className="text-xs text-muted-foreground">10%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contas a Receber</CardTitle>
            <CardDescription>Próximos vencimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Cliente ABC Ltda</p>
                  <p className="text-sm text-muted-foreground">Vence em 3 dias</p>
                </div>
                <span className="text-sm font-medium text-green-600">R$ 12.500</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Empresa XYZ</p>
                  <p className="text-sm text-muted-foreground">Vence em 7 dias</p>
                </div>
                <span className="text-sm font-medium text-green-600">R$ 8.900</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">StartUp 123</p>
                  <p className="text-sm text-muted-foreground">Vencido há 2 dias</p>
                </div>
                <span className="text-sm font-medium text-red-600">R$ 5.200</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}