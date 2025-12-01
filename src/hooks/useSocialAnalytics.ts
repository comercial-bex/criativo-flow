import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast-compat';

interface SocialMetricData {
  id: string;
  integration_id: string;
  metric_type: string;
  metric_value: number;
  metric_date: string;
  raw_data: any;
  integration?: {
    provider: string;
    account_name: string;
    account_id: string;
  };
}

interface AggregatedMetrics {
  date: string;
  [key: string]: number | string;
}

export function useSocialAnalytics(clienteId?: string, integrationId?: string) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SocialMetricData[]>([]);
  const [aggregatedMetrics, setAggregatedMetrics] = useState<AggregatedMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
  });

  const fetchMetrics = useCallback(async () => {
    if (!user || !clienteId) return;

    setLoading(true);
    try {
      let query = (supabase
        .from('social_metrics_cliente' as any)
        .select(`
          *,
          social_integrations_cliente!inner(
            provider,
            account_name,
            account_id,
            cliente_id
          )
        `)
        .eq('social_integrations_cliente.cliente_id', clienteId)
        .gte('metric_date', dateRange.start.toISOString())
        .lte('metric_date', dateRange.end.toISOString())
        .order('metric_date', { ascending: true }) as any);

      // Filter by specific integration if provided
      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar métricas:', error);
        toast.error('Erro ao carregar métricas sociais');
        return;
      }

      const formattedData = ((data || []) as any[]).map((item: any) => ({
        ...item,
        integration: item.social_integrations_cliente,
      })) as SocialMetricData[];

      setMetrics(formattedData);

      // Aggregate metrics by date
      const aggregated = aggregateMetricsByDate(formattedData);
      setAggregatedMetrics(aggregated);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar métricas');
    } finally {
      setLoading(false);
    }
  }, [user, clienteId, integrationId, dateRange]);

  const aggregateMetricsByDate = (data: SocialMetricData[]): AggregatedMetrics[] => {
    const byDate: Record<string, Record<string, number>> = {};

    data.forEach(metric => {
      const date = new Date(metric.metric_date).toISOString().split('T')[0];
      
      if (!byDate[date]) {
        byDate[date] = {};
      }

      const key = integrationId 
        ? metric.metric_type 
        : `${metric.integration?.provider}_${metric.metric_type}`;

      byDate[date][key] = (byDate[date][key] || 0) + metric.metric_value;
    });

    return Object.entries(byDate).map(([date, metrics]) => ({
      date,
      ...metrics,
    }));
  };

  const exportToCSV = useCallback(() => {
    if (metrics.length === 0) {
      toast.warning('Nenhuma métrica para exportar');
      return;
    }

    const headers = ['Data', 'Tipo de Métrica', 'Valor', 'Provedor', 'Conta'];
    const rows = metrics.map(metric => [
      new Date(metric.metric_date).toLocaleDateString('pt-BR'),
      metric.metric_type,
      metric.metric_value.toString(),
      metric.integration?.provider || '',
      metric.integration?.account_name || metric.integration?.account_id || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `metricas_sociais_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Relatório exportado com sucesso!');
  }, [metrics]);

  const getMetricSummary = useCallback(() => {
    const summary: Record<string, { total: number; average: number; min: number; max: number }> = {};

    metrics.forEach(metric => {
      const key = metric.metric_type;
      
      if (!summary[key]) {
        summary[key] = {
          total: 0,
          average: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      summary[key].total += metric.metric_value;
      summary[key].min = Math.min(summary[key].min, metric.metric_value);
      summary[key].max = Math.max(summary[key].max, metric.metric_value);
    });

    Object.keys(summary).forEach(key => {
      const metricsByType = metrics.filter(m => m.metric_type === key);
      summary[key].average = summary[key].total / metricsByType.length;
    });

    return summary;
  }, [metrics]);

  useEffect(() => {
    if (clienteId) {
      fetchMetrics();
    }
  }, [fetchMetrics, clienteId]);

  return {
    metrics,
    aggregatedMetrics,
    loading,
    dateRange,
    setDateRange,
    fetchMetrics,
    exportToCSV,
    getMetricSummary,
    clienteId,
    integrationId,
  };
}
