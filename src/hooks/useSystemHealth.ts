import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

interface IntegrityCheck {
  total_auth_users: number;
  users_with_profile: number;
  users_with_role: number;
  orphan_auth_users: number;
  orphan_profiles: number;
  integrity_score: number;
}

interface HealthLog {
  id: string;
  check_type: string;
  status: 'ok' | 'warning' | 'error';
  details: Record<string, any>;
  created_at: string;
}

export const useSystemHealth = () => {
  const queryClient = useQueryClient();

  // Verificar integridade
  const { data: integrity, isLoading: integrityLoading, refetch: checkIntegrity } = useQuery({
    queryKey: ['system-integrity'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_user_integrity');
      if (error) throw error;
      return data?.[0] as IntegrityCheck;
    },
    staleTime: 3 * 60 * 1000, // 3 min - health check não muda tanto
    gcTime: 10 * 60 * 1000, // 10 min em cache
    refetchInterval: 5 * 60 * 1000, // 5 min - reduzido de 1 min
  });

  // Buscar logs de saúde
  const { data: healthLogs } = useQuery({
    queryKey: ['health-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_health_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as HealthLog[];
    },
  });

  // Sincronizar órfãos automaticamente
  const syncOrphansMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('auto_sync_orphan_users');
      if (error) throw error;
      return data as { success: boolean; synced_count: number };
    },
    onSuccess: (data) => {
      smartToast.success(
        'Sincronização concluída',
        `${data.synced_count} usuário(s) sincronizado(s)`
      );
      queryClient.invalidateQueries({ queryKey: ['system-integrity'] });
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
    },
    onError: (error: any) => {
      smartToast.error('Erro na sincronização', error.message);
    },
  });

  // Calcular status geral
  const getOverallStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (!integrity) return 'warning';
    
    if (integrity.orphan_auth_users > 0 || integrity.orphan_profiles > 0) {
      return 'critical';
    }
    
    if (integrity.integrity_score < 95) {
      return 'warning';
    }
    
    return 'healthy';
  };

  return {
    integrity,
    integrityLoading,
    healthLogs,
    overallStatus: getOverallStatus(),
    checkIntegrity,
    syncOrphans: syncOrphansMutation.mutate,
    isSyncing: syncOrphansMutation.isPending,
  };
};
