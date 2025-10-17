import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IntelligenceData {
  id: string;
  source_id: string;
  external_id: string;
  data_type: string;
  title: string;
  content: string;
  url?: string;
  region?: string;
  keywords: string[];
  metric_type?: string;
  metric_value?: number;
  published_at: string;
  retrieved_at: string;
  raw_payload: any;
  source?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface ConnectorStatus {
  connector_name: string;
  last_success_at?: string;
  last_error_at?: string;
  last_error_message?: string;
  calls_today: number;
  calls_this_hour: number;
  status: string;
  next_run_at?: string;
}

export interface IntelligenceAlert {
  id: string;
  cliente_id: string;
  name: string;
  alert_type: string;
  conditions: any;
  severity: string;
  is_active: boolean;
  last_triggered_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useIntelligenceData() {
  const [data, setData] = useState<IntelligenceData[]>([]);
  const [connectorStatus, setConnectorStatus] = useState<ConnectorStatus[]>([]);
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch intelligence data
  const fetchIntelligenceData = useCallback(async (limit = 50) => {
    try {
      const { data: intelligenceData, error } = await supabase
        .from('intelligence_data')
        .select(`
          *,
          source:intelligence_sources(id, name, type)
        `)
        .order('retrieved_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setData(intelligenceData || []);
    } catch (error) {
      console.error('Error fetching intelligence data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de inteligência",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Fetch connector status
  const fetchConnectorStatus = useCallback(async () => {
    try {
      const { data: statusData, error } = await supabase
        .from('connector_status')
        .select('*')
        .order('connector_name');

      if (error) throw error;
      setConnectorStatus(statusData || []);
    } catch (error) {
      console.error('Error fetching connector status:', error);
    }
  }, []);

  // Fetch alerts for current client
  const fetchAlerts = useCallback(async (clienteId?: string) => {
    if (!clienteId) return;

    try {
      const { data: alertsData, error } = await supabase
        .from('intelligence_alerts')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);

  // Refresh all data by calling the collector
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('intelligence-collector');
      
      if (error) throw error;
      
      // Handle the new response format
      if (result && !result.success) {
        const failedSources = result.results?.filter((r: any) => !r.success) || [];
        if (failedSources.length > 0) {
          toast({
            title: "Alguns conectores falharam",
            description: `${failedSources.length} fonte(s) com erro. Veja detalhes em Configurar.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Atualização parcial",
            description: result.error || "Alguns dados não puderam ser coletados",
          });
        }
      } else {
        const summary = result?.summary || {};
        toast({
          title: "Dados atualizados",
          description: `${summary.successful || 0} fonte(s) coletada(s) com sucesso`,
        });
      }
      
      // Refresh local data
      await Promise.all([
        fetchIntelligenceData(),
        fetchConnectorStatus()
      ]);
      
      return result;
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar os dados",
        variant: "destructive"
      });
      throw error;
    } finally {
      setRefreshing(false);
    }
  }, [fetchIntelligenceData, fetchConnectorStatus, toast]);

  // Test a specific source
  const testSource = useCallback(async (sourceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('intelligence-collector', {
        body: { test_mode: true, source_id: sourceId }
      });
      
      if (error) throw error;
      
      const result = data?.results?.[0];
      if (!result) {
        throw new Error('Nenhum resultado retornado');
      }
      
      return {
        success: result.success,
        message: result.success 
          ? `✅ Conectado - ${result.collected} item(s) encontrado(s)`
          : `❌ Erro: ${result.error}`,
        rawPreview: result.raw_preview,
        sampleData: result.sample_data
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erro: ${error.message}`,
        rawPreview: null,
        sampleData: null
      };
    }
  }, []);

  // Create a new alert
  const createAlert = useCallback(async (alert: Omit<IntelligenceAlert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newAlert, error } = await supabase
        .from('intelligence_alerts')
        .insert([alert])
        .select()
        .single();

      if (error) throw error;

      setAlerts(prev => [newAlert, ...prev]);
      
      toast({
        title: "Alerta criado",
        description: `Alerta "${alert.name}" criado com sucesso`,
      });

      return newAlert;
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Erro ao criar alerta",
        description: "Não foi possível criar o alerta",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Update an alert
  const updateAlert = useCallback(async (id: string, updates: Partial<IntelligenceAlert>) => {
    try {
      const { data: updatedAlert, error } = await supabase
        .from('intelligence_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === id ? updatedAlert : alert
      ));

      toast({
        title: "Alerta atualizado",
        description: "Alerta atualizado com sucesso",
      });

      return updatedAlert;
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Erro ao atualizar alerta",
        description: "Não foi possível atualizar o alerta",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Delete an alert
  const deleteAlert = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('intelligence_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== id));

      toast({
        title: "Alerta removido",
        description: "Alerta removido com sucesso",
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Erro ao remover alerta",
        description: "Não foi possível remover o alerta",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Filter data by type
  const getDataByType = useCallback((type: string) => {
    return data.filter(item => item.data_type === type);
  }, [data]);

  // Get latest data for each source
  const getLatestBySource = useCallback(() => {
    const sourceMap = new Map<string, IntelligenceData>();
    
    data.forEach(item => {
      if (item.source_id) {
        const existing = sourceMap.get(item.source_id);
        if (!existing || new Date(item.retrieved_at) > new Date(existing.retrieved_at)) {
          sourceMap.set(item.source_id, item);
        }
      }
    });
    
    return Array.from(sourceMap.values());
  }, [data]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchIntelligenceData(),
          fetchConnectorStatus()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchIntelligenceData, fetchConnectorStatus]);

  // Set up real-time subscriptions
  useEffect(() => {
    const channels = [
      supabase
        .channel('intelligence-data-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'intelligence_data'
          },
          (payload) => {
            setData(prev => [payload.new as IntelligenceData, ...prev.slice(0, 49)]);
          }
        )
        .subscribe(),

      supabase
        .channel('connector-status-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'connector_status'
          },
          () => {
            fetchConnectorStatus();
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchConnectorStatus]);

  return {
    // Data
    data,
    connectorStatus,
    alerts,
    
    // State
    loading,
    refreshing,
    
    // Actions
    refreshData,
    testSource,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    
    // Utilities
    getDataByType,
    getLatestBySource,
    
    // Manual fetchers
    fetchIntelligenceData,
    fetchConnectorStatus
  };
}