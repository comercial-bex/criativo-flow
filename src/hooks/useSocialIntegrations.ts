import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SocialIntegration {
  id: string;
  provider: string;
  provider_user_id: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  account_name: string | null;
  account_data: any;
  permissions: any;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface SocialMetric {
  id: string;
  integration_id: string;
  metric_type: string;
  metric_value: number;
  metric_date: string;
  raw_data: any;
}

export function useSocialIntegrations() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<SocialIntegration[]>([]);
  const [metrics, setMetrics] = useState<SocialMetric[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIntegrations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar integrações:', error);
        toast.error('Erro ao carregar integrações sociais');
        return;
      }

      setIntegrations(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar integrações');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMetrics = useCallback(async (integrationId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('social_metrics')
        .select(`
          *,
          social_integrations!inner(user_id, provider, account_name)
        `)
        .eq('social_integrations.user_id', user.id)
        .order('metric_date', { ascending: false })
        .limit(100);

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar métricas:', error);
        return;
      }

      setMetrics(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar métricas:', error);
    }
  }, [user]);

  const disconnectIntegration = useCallback(async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('social_integrations')
        .update({ is_active: false })
        .eq('id', integrationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erro ao desconectar integração:', error);
        toast.error('Erro ao desconectar conta');
        return false;
      }

      toast.success('Conta desconectada com sucesso');
      fetchIntegrations();
      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao desconectar conta');
      return false;
    }
  }, [user, fetchIntegrations]);

  const getIntegrationByProvider = useCallback((provider: string) => {
    return integrations.find(int => int.provider === provider);
  }, [integrations]);

  const hasIntegration = useCallback((provider: string) => {
    return integrations.some(int => int.provider === provider && int.is_active);
  }, [integrations]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return {
    integrations,
    metrics,
    loading,
    fetchIntegrations,
    fetchMetrics,
    disconnectIntegration,
    getIntegrationByProvider,
    hasIntegration
  };
}