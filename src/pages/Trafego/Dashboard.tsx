import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { TrendingUp, Eye, MousePointer, DollarSign } from 'lucide-react';

interface DashboardStats {
  impressoes: number;
  cliques: number;
  conversoes: number;
  gastoTotal: number;
}

export default function TrafegoDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    impressoes: 0,
    cliques: 0,
    conversoes: 0,
    gastoTotal: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data para demonstração
    setStats({
      impressoes: 125000,
      cliques: 3500,
      conversoes: 185,
      gastoTotal: 8500,
    });
  };

  const statsCards = [
    {
      title: 'Impressões',
      value: stats.impressoes.toLocaleString(),
      description: 'Últimos 30 dias',
      icon: Eye,
      trend: { value: '+15%', isPositive: true }
    },
    {
      title: 'Cliques',
      value: stats.cliques.toLocaleString(),
      description: 'CTR: 2.8%',
      icon: MousePointer,
      trend: { value: '+8%', isPositive: true }
    },
    {
      title: 'Conversões',
      value: stats.conversoes.toString(),
      description: 'Taxa: 5.3%',
      icon: TrendingUp,
      trend: { value: '+12%', isPositive: true }
    },
    {
      title: 'Gasto Total',
      value: `R$ ${stats.gastoTotal.toLocaleString()}`,
      description: 'CPC médio: R$ 2,43',
      icon: DollarSign,
      trend: { value: '3%', isPositive: false }
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard Tráfego"
        description="Monitore performance de campanhas e métricas de tráfego pago"
      />

      <StatsGrid stats={statsCards} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campanhas Ativas</CardTitle>
            <CardDescription>Performance das campanhas em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Campanha Black Friday</p>
                  <p className="text-sm text-muted-foreground">Facebook Ads • R$ 2.500 gasto</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Ativa</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Google Ads - Produtos</p>
                  <p className="text-sm text-muted-foreground">Google Ads • R$ 1.800 gasto</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Ativa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas por Plataforma</CardTitle>
            <CardDescription>Comparativo de performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Facebook Ads</span>
                <div className="text-right">
                  <p className="text-sm font-medium">R$ 4.200</p>
                  <p className="text-xs text-muted-foreground">142 conversões</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Google Ads</span>
                <div className="text-right">
                  <p className="text-sm font-medium">R$ 3.800</p>
                  <p className="text-xs text-muted-foreground">98 conversões</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Instagram Ads</span>
                <div className="text-right">
                  <p className="text-sm font-medium">R$ 500</p>
                  <p className="text-xs text-muted-foreground">12 conversões</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}