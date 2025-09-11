import { useState } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { FeatureCard } from '@/components/FeatureCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  Download,
  FileSpreadsheet,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Relatorios = () => {
  const { toast } = useToast();
  const [periodo, setPeriodo] = useState('30');

  const statsData = [
    {
      title: "Receita Total",
      value: "R$ 125.430",
      icon: DollarSign,
      description: "Últimos 30 dias",
      trend: { value: "12%", isPositive: true },
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Novos Clientes",
      value: "23",
      icon: Users,
      description: "Este mês",
      trend: { value: "8%", isPositive: true },
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Projetos Concluídos",
      value: "15",
      icon: Target,
      description: "Últimos 30 dias",
      trend: { value: "5%", isPositive: false },
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Taxa de Conversão",
      value: "32%",
      icon: TrendingUp,
      description: "Leads → Clientes",
      trend: { value: "3%", isPositive: true },
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const relatoriosDisponiveis = [
    {
      title: "Relatório Financeiro",
      description: "Análise completa de receitas, despesas e fluxo de caixa",
      icon: DollarSign,
      badge: "PDF",
      formato: "PDF",
      tamanho: "2.3 MB"
    },
    {
      title: "Performance de Vendas",
      description: "Métricas de vendas, conversões e pipeline",
      icon: Target,
      badge: "Excel",
      formato: "XLSX",
      tamanho: "1.8 MB"
    },
    {
      title: "Relatório de Clientes",
      description: "Dados detalhados sobre clientes e segmentação",
      icon: Users,
      badge: "CSV",
      formato: "CSV",
      tamanho: "850 KB"
    },
    {
      title: "Analytics de Projetos",
      description: "Tempo de execução, recursos e performance",
      icon: BarChart3,
      badge: "PDF",
      formato: "PDF",
      tamanho: "3.1 MB"
    }
  ];

  const handleDownload = (relatorio: string) => {
    toast({
      title: "Download iniciado",
      description: `${relatorio} está sendo preparado para download.`
    });
  };

  const chartData = [
    { mes: 'Jan', receita: 85000, despesas: 65000 },
    { mes: 'Fev', receita: 92000, despesas: 68000 },
    { mes: 'Mar', receita: 78000, despesas: 72000 },
    { mes: 'Abr', receita: 105000, despesas: 75000 },
    { mes: 'Mai', receita: 125430, despesas: 82000 },
  ];

  return (
    <div className="p-6 space-y-8">
      <SectionHeader
        title="Relatórios & Analytics"
        description="Análise de dados e relatórios gerenciais completos"
        icon={BarChart3}
        badge="Pro"
        action={{
          label: "Exportar Tudo",
          onClick: () => handleDownload("Relatório Completo"),
          icon: Download
        }}
      />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Período de Análise</h3>
          <p className="text-sm text-muted-foreground">
            Selecione o período para visualizar os dados
          </p>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 3 meses</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <StatsGrid stats={statsData} />

      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Receita vs Despesas
                </CardTitle>
                <CardDescription>
                  Comparativo dos últimos 5 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded">
                  <div className="text-center space-y-2">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Gráfico de Receita vs Despesas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Distribuição por Categoria
                </CardTitle>
                <CardDescription>
                  Receitas por categoria de serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded">
                  <div className="text-center space-y-2">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Gráfico de Pizza - Categorias
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Principais Métricas do Período</CardTitle>
              <CardDescription>
                Resumo executivo dos últimos {periodo} dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">89%</div>
                  <div className="text-sm text-muted-foreground">Satisfação do Cliente</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-muted-foreground">Leads Gerados</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-purple-600">4.2</div>
                  <div className="text-sm text-muted-foreground">Projetos por Cliente</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-orange-600">95%</div>
                  <div className="text-sm text-muted-foreground">Entregas no Prazo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Fluxo de Caixa</CardTitle>
                <CardDescription>
                  Movimentação financeira detalhada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-muted/20 rounded">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Gráfico de Fluxo de Caixa
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Receita Bruta</span>
                    <span className="font-medium text-green-600">R$ 125.430</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Despesas</span>
                    <span className="font-medium text-red-600">R$ 82.150</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Lucro Líquido</span>
                      <span className="font-bold text-primary">R$ 43.280</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Margem de Lucro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-primary">34.5%</div>
                    <p className="text-sm text-muted-foreground">
                      Meta: 30%
                    </p>
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      Acima da Meta
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vendas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Funil de Vendas</CardTitle>
                <CardDescription>
                  Performance do pipeline de vendas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Leads</span>
                      <span>156 (100%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Qualificados</span>
                      <span>89 (57%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '57%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Propostas</span>
                      <span>45 (29%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '29%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fechados</span>
                      <span>23 (15%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '15%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Vendedores</CardTitle>
                <CardDescription>
                  Performance individual da equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { nome: "João Silva", vendas: "R$ 45.230", deals: 8 },
                    { nome: "Maria Santos", vendas: "R$ 38.150", deals: 6 },
                    { nome: "Pedro Costa", vendas: "R$ 29.800", deals: 5 },
                    { nome: "Ana Lima", vendas: "R$ 22.350", deals: 4 }
                  ].map((vendedor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{vendedor.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {vendedor.deals} deals fechados
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{vendedor.vendas}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projetos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Status dos Projetos</CardTitle>
                <CardDescription>
                  Distribuição atual dos projetos por status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2 p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-blue-600">Em Andamento</div>
                  </div>
                  <div className="text-center space-y-2 p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">15</div>
                    <div className="text-sm text-green-600">Concluídos</div>
                  </div>
                  <div className="text-center space-y-2 p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <div className="text-sm text-orange-600">Atrasados</div>
                  </div>
                  <div className="text-center space-y-2 p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-purple-600">Planejados</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Projeto</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-3xl font-bold text-primary">28 dias</div>
                <p className="text-sm text-muted-foreground">
                  Média de conclusão
                </p>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  5 dias a menos que o mês passado
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Relatórios Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatoriosDisponiveis.map((relatorio, index) => (
            <FeatureCard
              key={index}
              title={relatorio.title}
              description={relatorio.description}
              icon={relatorio.icon}
              badge={relatorio.badge}
              variant="outlined"
              actionLabel="Baixar"
              onAction={() => handleDownload(relatorio.title)}
            >
              <div className="text-xs text-muted-foreground">
                Formato: {relatorio.formato} • {relatorio.tamanho}
              </div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Relatorios;