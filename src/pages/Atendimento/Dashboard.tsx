import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { Users, Phone, MessageSquare, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalClientes: number;
  ticketsAbertos: number;
  mensagensHoje: number;
  satisfacao: number;
}

export default function AtendimentoDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    ticketsAbertos: 0,
    mensagensHoje: 0,
    satisfacao: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data para demonstração
    setStats({
      totalClientes: 156,
      ticketsAbertos: 23,
      mensagensHoje: 87,
      satisfacao: 94,
    });
  };

  const statsCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClientes.toString(),
      description: 'Clientes ativos',
      icon: Users,
      trend: { value: '12%', isPositive: true }
    },
    {
      title: 'Tickets Abertos',
      value: stats.ticketsAbertos.toString(),
      description: 'Aguardando resposta',
      icon: Phone,
      trend: { value: '5', isPositive: false }
    },
    {
      title: 'Mensagens Hoje',
      value: stats.mensagensHoje.toString(),
      description: 'Interações do dia',
      icon: MessageSquare,
      trend: { value: '+25', isPositive: true }
    },
    {
      title: 'Satisfação',
      value: `${stats.satisfacao}%`,
      description: 'Média mensal',
      icon: CheckCircle,
      trend: { value: '+8%', isPositive: true }
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard Atendimento"
        description="Acompanhe métricas e atividades do atendimento ao cliente"
      />

      <StatsGrid stats={statsCards} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tickets Recentes</CardTitle>
            <CardDescription>Últimas solicitações de suporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Problema com login</p>
                  <p className="text-sm text-muted-foreground">Cliente: João Silva</p>
                </div>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">Urgente</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Dúvida sobre plano</p>
                  <p className="text-sm text-muted-foreground">Cliente: Maria Santos</p>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Média</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas interações com clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm">Ticket #1234 resolvido</p>
                  <p className="text-xs text-muted-foreground">há 15 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm">Nova mensagem recebida</p>
                  <p className="text-xs text-muted-foreground">há 32 minutos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}