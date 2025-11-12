import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Trophy, AlertCircle, Target } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function DashboardAnalytics() {
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d');

  // Buscar métricas de performance histórica
  const { data: performanceData } = useQuery({
    queryKey: ['analytics-performance', periodo],
    queryFn: async () => {
      const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90;
      const { data, error } = await supabase
        .from('post_performance_metrics')
        .select('*')
        .gte('created_at', new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as any[] || [];
    }
  });

  // Buscar variações vencedoras de A/B testing
  const { data: abTestData } = useQuery({
    queryKey: ['analytics-ab-test'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts_planejamento')
        .select(`
          id,
          titulo,
          variacao_vencedora,
          confianca_estatistica,
          post_ab_variations!inner(
            variacao_tipo,
            variacao_texto,
            impressoes,
            cliques,
            engajamentos
          )
        `)
        .not('variacao_vencedora', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as any[] || [];
    }
  });

  // Buscar métricas por tipo de conteúdo
  const { data: tipoConteudoData } = useQuery({
    queryKey: ['analytics-tipo-conteudo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_performance_metrics')
        .select('tipo_conteudo, taxa_engajamento, taxa_cliques')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar por tipo de conteúdo
      const grouped = ((data || []) as any[]).reduce((acc: any, item: any) => {
        if (!acc[item.tipo_conteudo]) {
          acc[item.tipo_conteudo] = {
            tipo: item.tipo_conteudo,
            total: 0,
            somaEngajamento: 0,
            somaCliques: 0
          };
        }
        acc[item.tipo_conteudo].total += 1;
        acc[item.tipo_conteudo].somaEngajamento += item.taxa_engajamento || 0;
        acc[item.tipo_conteudo].somaCliques += item.taxa_cliques || 0;
        return acc;
      }, {});

      return Object.values(grouped).map((g: any) => ({
        tipo: g.tipo,
        engajamento_medio: (g.somaEngajamento / g.total).toFixed(2),
        cliques_medio: (g.somaCliques / g.total).toFixed(2),
        posts: g.total
      }));
    }
  });

  // Calcular KPIs
  const kpis = {
    engajamentoMedio: performanceData && performanceData.length > 0
      ? (performanceData.reduce((acc: number, p: any) => acc + (p.taxa_engajamento || 0), 0) / performanceData.length).toFixed(2)
      : '0.00',
    melhorHorario: performanceData && performanceData.length > 0
      ? performanceData.reduce((max: any, p: any) => (p.taxa_engajamento || 0) > (max.taxa_engajamento || 0) ? p : max, performanceData[0])?.hora_publicacao || 'N/A'
      : 'N/A',
    melhorDia: performanceData && performanceData.length > 0
      ? performanceData.reduce((max: any, p: any) => (p.taxa_engajamento || 0) > (max.taxa_engajamento || 0) ? p : max, performanceData[0])?.dia_semana || 'N/A'
      : 'N/A',
    testesAtivos: abTestData?.length || 0
  };

  return (
    <div className="space-y-6">
      {/* KPIs Resumidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.engajamentoMedio}%</div>
            <p className="text-xs text-muted-foreground">Últimos {periodo}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Horário</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.melhorHorario}h</div>
            <p className="text-xs text-muted-foreground">Maior engajamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Dia</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.melhorDia}</div>
            <p className="text-xs text-muted-foreground">Da semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testes A/B</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.testesAtivos}</div>
            <p className="text-xs text-muted-foreground">Vencedores identificados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Análises Detalhadas */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance Histórica</TabsTrigger>
          <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
          <TabsTrigger value="conteudo">Por Tipo de Conteúdo</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Engajamento</CardTitle>
              <CardDescription>Taxa de engajamento ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="created_at" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="taxa_engajamento" 
                    stroke="hsl(var(--primary))" 
                    name="Engajamento (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="taxa_cliques" 
                    stroke="hsl(var(--secondary))" 
                    name="CTR (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variações Vencedoras</CardTitle>
              <CardDescription>Top 10 testes A/B com melhores resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abTestData?.map((test: any) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{test.titulo}</h4>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(test.confianca_estatistica)}% confiança
                      </span>
                    </div>
                    <div className="bg-muted/50 p-3 rounded text-sm">
                      <strong>Variação Vencedora:</strong>
                      <p className="mt-1 text-muted-foreground">
                        {test.post_ab_variations?.[0]?.variacao_texto?.slice(0, 150)}...
                      </p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span>👁️ {test.post_ab_variations?.[0]?.impressoes || 0} impressões</span>
                        <span>👆 {test.post_ab_variations?.[0]?.cliques || 0} cliques</span>
                        <span>❤️ {test.post_ab_variations?.[0]?.engajamentos || 0} engajamentos</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conteudo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Tipo de Conteúdo</CardTitle>
              <CardDescription>Comparação de engajamento entre diferentes tipos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tipoConteudoData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="engajamento_medio" fill="hsl(var(--primary))" name="Engajamento Médio (%)" />
                  <Bar dataKey="cliques_medio" fill="hsl(var(--secondary))" name="CTR Médio (%)" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={tipoConteudoData || []}
                      dataKey="posts"
                      nameKey="tipo"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {(tipoConteudoData || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
