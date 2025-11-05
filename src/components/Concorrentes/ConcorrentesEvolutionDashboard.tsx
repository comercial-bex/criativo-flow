import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompetitorEvolution } from '@/hooks/useCompetitorEvolution';
import { Loader2, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConcorrentesEvolutionDashboardProps {
  concorrenteId: string;
  nomeConcorrente?: string;
}

export function ConcorrentesEvolutionDashboard({ concorrenteId, nomeConcorrente }: ConcorrentesEvolutionDashboardProps) {
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('90d');

  const periodo = (() => {
    const fim = new Date();
    const inicio = new Date();
    
    switch (periodoFiltro) {
      case '30d':
        inicio.setDate(inicio.getDate() - 30);
        break;
      case '90d':
        inicio.setDate(inicio.getDate() - 90);
        break;
      case '180d':
        inicio.setDate(inicio.getDate() - 180);
        break;
      case '365d':
        inicio.setFullYear(inicio.getFullYear() - 1);
        break;
    }
    
    return { inicio, fim };
  })();

  const { data, isLoading } = useCompetitorEvolution({ concorrenteId, periodo });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.snapshots.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Sem dados históricos disponíveis para este concorrente
          </p>
        </CardContent>
      </Card>
    );
  }

  const cores = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    tiktok: '#000000',
    youtube: '#FF0000',
    linkedin: '#0A66C2',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{nomeConcorrente || data.nome_concorrente}</h2>
          <p className="text-muted-foreground">Evolução de métricas competitivas</p>
        </div>
        
        <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 3 meses</SelectItem>
            <SelectItem value="180d">Últimos 6 meses</SelectItem>
            <SelectItem value="365d">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Melhor Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{data.resumo.melhor_plataforma}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maior Crescimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.resumo.maior_crescimento}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engajamento Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.resumo.engajamento_atual ? `${data.resumo.engajamento_atual.toFixed(2)}%` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {data.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insights Automáticos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">💡</Badge>
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Evolução de Seguidores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução de Seguidores por Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trends[0]?.dados_grafico || []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="data" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
                labelFormatter={(value) => format(new Date(value), "dd 'de' MMM", { locale: ptBR })}
              />
              <Legend />
              
              {data.trends.map(trend => (
                <Line
                  key={trend.plataforma}
                  data={trend.dados_grafico}
                  type="monotone"
                  dataKey="valor"
                  name={trend.plataforma.charAt(0).toUpperCase() + trend.plataforma.slice(1)}
                  stroke={cores[trend.plataforma as keyof typeof cores]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Variações */}
      <Card>
        <CardHeader>
          <CardTitle>Variações por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.trends.map(trend => {
              const variacaoSemanal = trend.variacao_semanal || 0;
              const variacaoMensal = trend.variacao_mensal || 0;
              
              return (
                <div key={trend.plataforma} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium capitalize">{trend.plataforma}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Semanal: </span>
                      <span className={variacaoSemanal >= 0 ? 'text-success' : 'text-destructive'}>
                        {variacaoSemanal >= 0 ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />}
                        {variacaoSemanal > 0 ? '+' : ''}{variacaoSemanal.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Mensal: </span>
                      <span className={variacaoMensal >= 0 ? 'text-success' : 'text-destructive'}>
                        {variacaoMensal >= 0 ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />}
                        {variacaoMensal > 0 ? '+' : ''}{variacaoMensal.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
