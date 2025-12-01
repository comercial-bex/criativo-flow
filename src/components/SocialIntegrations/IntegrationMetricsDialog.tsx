import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, TrendingUp, Users, Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/lib/toast-compat';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface IntegrationMetricsDialogProps {
  integrationId: string;
  accountName: string;
  provider: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MetricData {
  id: string;
  metric_type: string;
  metric_value: number;
  metric_date: string;
  raw_data: any;
}

const metricIcons = {
  followers: Users,
  engagement: Heart,
  impressions: TrendingUp,
  reach: Share2,
  comments: MessageCircle,
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

export function IntegrationMetricsDialog({
  integrationId,
  accountName,
  provider,
  open,
  onOpenChange,
}: IntegrationMetricsDialogProps) {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open && integrationId) {
      fetchMetrics();
    }
  }, [open, integrationId]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase
        .from('social_metrics_cliente' as any)
        .select('*')
        .eq('integration_id', integrationId)
        .order('metric_date', { ascending: false })
        .limit(30) as any);

      if (error) throw error;

      setMetrics((data as MetricData[]) || []);
      
      // Calculate latest stats
      const latestStats: Record<string, number> = {};
      (data as MetricData[])?.forEach((metric: MetricData) => {
        if (!latestStats[metric.metric_type]) {
          latestStats[metric.metric_type] = metric.metric_value;
        }
      });
      setStats(latestStats);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      toast.error('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = (metricType: string) => {
    return metrics
      .filter(m => m.metric_type === metricType)
      .reverse()
      .map(m => ({
        date: format(new Date(m.metric_date), 'dd/MMM', { locale: ptBR }),
        value: m.metric_value,
      }));
  };

  const providerColors = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    google: '#4285F4',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Métricas da Conta
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                style={{ 
                  backgroundColor: `${providerColors[provider as keyof typeof providerColors]}20`,
                  color: providerColors[provider as keyof typeof providerColors],
                  borderColor: providerColors[provider as keyof typeof providerColors]
                }}
                className="border"
              >
                {provider.toUpperCase()}
              </Badge>
              <span className="font-medium">{accountName}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : metrics.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Nenhuma métrica encontrada</p>
            <p className="text-sm mt-2">
              As métricas aparecerão aqui após a primeira sincronização de dados
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats).slice(0, 4).map(([type, value]) => {
                const Icon = metricIcons[type as keyof typeof metricIcons] || TrendingUp;
                return (
                  <Card key={type}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {metricLabels[type as keyof typeof metricLabels] || type}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {value.toLocaleString('pt-BR')}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts */}
            {Object.keys(stats).slice(0, 2).map(metricType => {
              const chartData = getChartData(metricType);
              if (chartData.length === 0) return null;

              return (
                <Card key={metricType}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {metricLabels[metricType as keyof typeof metricLabels] || metricType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`gradient-${metricType}`} x1="0" y1="0" x2="0" y2="1">
                            <stop 
                              offset="5%" 
                              stopColor={providerColors[provider as keyof typeof providerColors]} 
                              stopOpacity={0.3}
                            />
                            <stop 
                              offset="95%" 
                              stopColor={providerColors[provider as keyof typeof providerColors]} 
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={providerColors[provider as keyof typeof providerColors]}
                          strokeWidth={2}
                          fill={`url(#gradient-${metricType})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}

            {/* Recent Metrics Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Histórico Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.slice(0, 10).map((metric) => (
                    <div 
                      key={metric.id} 
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {metricLabels[metric.metric_type as keyof typeof metricLabels] || metric.metric_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(metric.metric_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <span className="font-semibold">
                        {metric.metric_value.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
