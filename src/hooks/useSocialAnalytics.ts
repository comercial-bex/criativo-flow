/**
 * Hook de Social Analytics - DESABILITADO
 * Tabelas social_* foram removidas
 */

export function useSocialAnalytics(_clienteId?: string, _integrationId?: string) {
  return {
    metrics: [],
    aggregatedMetrics: [],
    loading: false,
    dateRange: {
      start: new Date(),
      end: new Date(),
    },
    setDateRange: () => {},
    fetchMetrics: () => Promise.resolve(),
    exportToCSV: () => console.warn('⚠️ social_metrics_cliente removida'),
    getMetricSummary: () => ({}),
    clienteId: _clienteId,
    integrationId: _integrationId,
  };
}
