import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { useSocialAnalytics } from "@/hooks/useSocialAnalytics";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar as CalendarIcon, Download, TrendingUp, Users, Heart, MessageCircle, Share2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const providerColors = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  google: '#4285F4',
  tiktok: '#000000',
};

const metricIcons = {
  followers: Users,
  engagement: Heart,
  impressions: TrendingUp,
  reach: Share2,
  comments: MessageCircle,
  likes: Heart,
  shares: Share2,
};

const metricLabels = {
  followers: "Seguidores",
  engagement: "Engajamento",
  impressions: "Impressões",
  reach: "Alcance",
  comments: "Comentários",
  likes: "Curtidas",
  shares: "Compartilhamentos",
};

export default function SocialAnalytics() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | undefined>();
  
  const { integrations, loading: integrationsLoading } = useSocialIntegrations(clienteId);
  const { 
    aggregatedMetrics, 
    loading: metricsLoading, 
    dateRange, 
    setDateRange,
    exportToCSV,
    getMetricSummary,
  } = useSocialAnalytics(clienteId, selectedIntegrationId);

  const summary = getMetricSummary();

  if (!clienteId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Cliente não identificado
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedIntegration = integrations.find(i => i.id === selectedIntegrationId);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Análise de Redes Sociais
          </h1>
          <p className="text-muted-foreground mt-2">
            Métricas detalhadas e relatórios de performance
          </p>
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {/* Account Selector */}
          <div className="flex-1 min-w-[250px]">
            <label className="text-sm font-medium mb-2 block">Conta</label>
            <Select
              value={selectedIntegrationId || 'all'}
              onValueChange={(value) => setSelectedIntegrationId(value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📊 Todas as Contas (Consolidado)</SelectItem>
                {integrations.map((integration) => (
                  <SelectItem key={integration.id} value={integration.id}>
                    <div className="flex items-center gap-2">
                      <Badge
                        style={{ 
                          backgroundColor: `${providerColors[integration.provider as keyof typeof providerColors]}20`,
                          color: providerColors[integration.provider as keyof typeof providerColors],
                        }}
                      >
                        {integration.provider.toUpperCase()}
                      </Badge>
                      <span>{integration.account_name || integration.account_id}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Picker */}
          <div className="flex-1 min-w-[250px]">
            <label className="text-sm font-medium mb-2 block">Período</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.start && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.start ? format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR }) : 'Data inicial'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.start}
                    onSelect={(date) => date && setDateRange({ ...dateRange, start: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.end && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.end ? format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR }) : 'Data final'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.end}
                    onSelect={(date) => date && setDateRange({ ...dateRange, end: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {integrationsLoading || metricsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {Object.keys(summary).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(summary).slice(0, 4).map(([metricType, stats]) => {
                const Icon = metricIcons[metricType as keyof typeof metricIcons] || BarChart3;
                return (
                  <Card key={metricType}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {metricLabels[metricType as keyof typeof metricLabels] || metricType}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-1">
                        {Math.round(stats.average).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Máx: {stats.max.toLocaleString('pt-BR')} | Mín: {stats.min.toLocaleString('pt-BR')}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Charts */}
          {aggregatedMetrics.length > 0 ? (
            <div className="space-y-6">
              {/* Main Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Temporal</CardTitle>
                  <CardDescription>
                    {selectedIntegration 
                      ? `Dados de ${selectedIntegration.account_name || selectedIntegration.account_id}`
                      : 'Dados consolidados de todas as contas'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={aggregatedMetrics}>
                      <defs>
                        {Object.keys(aggregatedMetrics[0] || {})
                          .filter(key => key !== 'date')
                          .map((key, index) => {
                            const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
                            return (
                              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                              </linearGradient>
                            );
                          })}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
                      />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      {Object.keys(aggregatedMetrics[0] || {})
                        .filter(key => key !== 'date')
                        .map((key, index) => {
                          const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
                          return (
                            <Area
                              key={key}
                              type="monotone"
                              dataKey={key}
                              stroke={colors[index % colors.length]}
                              strokeWidth={2}
                              fill={`url(#gradient-${key})`}
                              name={metricLabels[key as keyof typeof metricLabels] || key}
                            />
                          );
                        })}
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparação de Métricas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={aggregatedMetrics}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
                      />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip />
                      <Legend />
                      {Object.keys(aggregatedMetrics[0] || {})
                        .filter(key => key !== 'date')
                        .slice(0, 3)
                        .map((key, index) => {
                          const colors = ['#8b5cf6', '#ec4899', '#3b82f6'];
                          return (
                            <Bar
                              key={key}
                              dataKey={key}
                              fill={colors[index]}
                              name={metricLabels[key as keyof typeof metricLabels] || key}
                            />
                          );
                        })}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium text-muted-foreground">Nenhuma métrica encontrada</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ajuste os filtros ou aguarde a sincronização de dados
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
