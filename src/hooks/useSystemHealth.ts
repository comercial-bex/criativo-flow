import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

interface IntegrityCheck {
  total_auth_users: number;
  users_with_profile: number;
  users_with_role: number;
  orphan_auth_users: number;
  orphan_profiles: number;
  pessoas_sem_role?: number;
  clientes_sem_onboarding?: number;
  propostas_sem_cliente?: number;
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

  const { data: integrity, isLoading: integrityLoading, refetch: checkIntegrity } = useQuery({
    queryKey: ['system-integrity'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_user_integrity');
      if (error) throw error;
      return data?.[0] as IntegrityCheck;
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

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

  const syncOrphansMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('auto_sync_orphan_users');
      if (error) throw error;
      return data as { success: boolean; synced_count: number };
    },
    onSuccess: (data) => {
      smartToast.success('Sincronização concluída', `${data.synced_count} usuário(s) sincronizado(s)`);
      queryClient.invalidateQueries({ queryKey: ['system-integrity'] });
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
    },
    onError: (error: any) => {
      smartToast.error('Erro na sincronização', error.message);
    },
  });

  // Nova mutation para correção completa de integridade
  const fixIntegrityMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('fix-integrity');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const results = data.results || {};
      smartToast.success(
        'Integridade corrigida',
        `${results.fase1_roles_synced || 0} roles, ${results.fase2_onboarding_created || 0} onboardings`
      );
      queryClient.invalidateQueries({ queryKey: ['system-integrity'] });
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
    },
    onError: (error: any) => {
      smartToast.error('Erro na correção', error.message);
    },
  });

  const getOverallStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (!integrity) return 'warning';
    if (integrity.orphan_auth_users > 0 || integrity.orphan_profiles > 0) return 'critical';
    if (integrity.integrity_score < 95) return 'warning';
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
    fixIntegrity: fixIntegrityMutation.mutate,
    isFixing: fixIntegrityMutation.isPending,
  };
};
