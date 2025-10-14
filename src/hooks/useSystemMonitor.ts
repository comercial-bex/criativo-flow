import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

export const useSystemMonitor = () => {
  const queryClient = useQueryClient();

  // Buscar todas as conexões
  const { data: connections, isLoading } = useQuery({
    queryKey: ['system-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_connections')
        .select('*')
        .order('group', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // 30s
  });

  // Buscar eventos críticos não reconhecidos
  const { data: criticalEvents } = useQuery({
    queryKey: ['system-events-critical'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_events_bus')
        .select('*, system_connections(*)')
        .eq('acknowledged', false)
        .in('event_type', ['error', 'warn'])
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000, // 15s para eventos críticos
  });

  // Buscar playbooks
  const { data: playbooks } = useQuery({
    queryKey: ['system-playbooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_playbooks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Buscar histórico de checks
  const { data: recentChecks } = useQuery({
    queryKey: ['system-checks-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_checks')
        .select('*, system_connections(*)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Testar uma conexão
  const testConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      try {
        const { data, error } = await supabase.functions.invoke('monitor-test-connection', {
          body: { connection_id: connectionId }
        });
        
        if (error) {
          // Se Edge Function não estiver disponível, usar fallback
          if (error.message?.includes('Failed to send') || error.message?.includes('FunctionsRelayError')) {
            const { testConnectionFallback } = await import('@/lib/monitor-fallback');
            return await testConnectionFallback(connectionId);
          }
          throw error;
        }
        
        return data;
      } catch (err: any) {
        console.error('[Monitor] Erro ao testar conexão:', err);
        throw err;
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['system-connections'] });
      queryClient.invalidateQueries({ queryKey: ['system-checks-recent'] });
      
      if (data?.fallback_mode) {
        smartToast.success('Teste concluído (modo local)', 'Conexão verificada');
      } else {
        smartToast.success('Teste concluído', 'Conexão verificada com sucesso');
      }
    },
    onError: (error: any) => {
      smartToast.error('Erro no teste', error.message);
    },
  });

  // Testar todas as conexões
  const testAll = useMutation({
    mutationFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('monitor-test-all');
        
        if (error) {
          // Se Edge Function não estiver disponível, usar fallback
          if (error.message?.includes('Failed to send') || error.message?.includes('FunctionsRelayError')) {
            const { testConnectionFallback } = await import('@/lib/monitor-fallback');
            
            // Buscar todas as conexões com monitoramento ativo
            const { data: connections } = await supabase
              .from('system_connections')
              .select('id')
              .eq('monitoring_enabled', true);
            
            if (!connections?.length) {
              return { total: 0, successful: 0, failed: 0, fallback_mode: true };
            }
            
            // Testar em lote (até 5 simultâneos)
            const batchSize = 5;
            let successful = 0;
            let failed = 0;
            
            for (let i = 0; i < connections.length; i += batchSize) {
              const batch = connections.slice(i, i + batchSize);
              const results = await Promise.allSettled(
                batch.map(conn => testConnectionFallback(conn.id))
              );
              
              successful += results.filter(r => r.status === 'fulfilled').length;
              failed += results.filter(r => r.status === 'rejected').length;
            }
            
            return { 
              total: connections.length, 
              successful, 
              failed,
              fallback_mode: true 
            };
          }
          throw error;
        }
        
        return data;
      } catch (err: any) {
        console.error('[Monitor] Erro ao testar todas conexões:', err);
        throw err;
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['system-connections'] });
      queryClient.invalidateQueries({ queryKey: ['system-checks-recent'] });
      queryClient.invalidateQueries({ queryKey: ['system-events-critical'] });
      
      const mode = data?.fallback_mode ? ' (modo local)' : '';
      smartToast.success(
        `Testes concluídos${mode}`,
        `${data.successful}/${data.total} conexões OK`
      );
    },
    onError: (error: any) => {
      smartToast.error(
        'Erro ao testar conexões', 
        error.message || 'Verifique se as Edge Functions estão disponíveis'
      );
    },
  });

  // Toggle monitoramento
  const toggleMonitoring = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('system_connections')
        .update({ monitoring_enabled: enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-connections'] });
    },
  });

  // Reconhecer evento
  const acknowledgeEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('system_events_bus')
        .update({ acknowledged: true })
        .eq('id', eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-events-critical'] });
      smartToast.success('Evento reconhecido');
    },
  });

  return {
    connections,
    isLoading,
    criticalEvents,
    playbooks,
    recentChecks,
    testConnection: testConnection.mutate,
    isTestingConnection: testConnection.isPending,
    testAll: testAll.mutate,
    isTestingAll: testAll.isPending,
    toggleMonitoring: toggleMonitoring.mutate,
    acknowledgeEvent: acknowledgeEvent.mutate,
  };
};
