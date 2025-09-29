import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { Package, Truck, DollarSign, Clock } from 'lucide-react';

interface DashboardStats {
  pedidosAtivos: number;
  entregasPendentes: number;
  valorMes: number;
  tempoMedioEntrega: number;
}

export default function FornecedorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    pedidosAtivos: 0,
    entregasPendentes: 0,
    valorMes: 0,
    tempoMedioEntrega: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data para demonstração
    setStats({
      pedidosAtivos: 24,
      entregasPendentes: 8,
      valorMes: 45000,
      tempoMedioEntrega: 3.5,
    });
  };

  const statsCards = [
    {
      title: 'Pedidos Ativos',
      value: stats.pedidosAtivos.toString(),
      description: 'Em produção/envio',
      icon: Package,
      trend: { value: '+6', isPositive: true }
    },
    {
      title: 'Entregas Pendentes',
      value: stats.entregasPendentes.toString(),
      description: 'Aguardando envio',
      icon: Truck,
      trend: { value: '2', isPositive: false }
    },
    {
      title: 'Faturamento Mensal',
      value: `R$ ${stats.valorMes.toLocaleString()}`,
      description: 'Mês atual',
      icon: DollarSign,
      trend: { value: '+22%', isPositive: true }
    },
    {
      title: 'Tempo Médio',
      value: `${stats.tempoMedioEntrega} dias`,
      description: 'Para entrega',
      icon: Clock,
      trend: { value: '0.5d', isPositive: false }
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard Fornecedor"
        description="Acompanhe pedidos, entregas e performance como fornecedor"
      />

      <StatsGrid stats={statsCards} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>Últimas solicitações de produtos/serviços</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Material Gráfico - Cliente A</p>
                  <p className="text-sm text-muted-foreground">Pedido #1245 • R$ 2.500</p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Produção</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Equipamento Video - Cliente B</p>
                  <p className="text-sm text-muted-foreground">Pedido #1244 • R$ 8.900</p>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Envio</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Software Licença - Cliente C</p>
                  <p className="text-sm text-muted-foreground">Pedido #1243 • R$ 1.200</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Entregue</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance de Entregas</CardTitle>
            <CardDescription>Histórico dos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Entregas no Prazo</span>
                <div className="text-right">
                  <p className="text-sm font-medium">92%</p>
                  <p className="text-xs text-muted-foreground">46 de 50</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tempo Médio</span>
                <div className="text-right">
                  <p className="text-sm font-medium">3.5 dias</p>
                  <p className="text-xs text-muted-foreground">Meta: 4 dias</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avaliação Clientes</span>
                <div className="text-right">
                  <p className="text-sm font-medium">4.8/5.0</p>
                  <p className="text-xs text-muted-foreground">128 avaliações</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}