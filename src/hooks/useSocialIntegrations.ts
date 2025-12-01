import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useClientContext } from '@/hooks/useClientContext';
import { toast } from '@/lib/toast-compat';

interface SocialIntegration {
  id: string;
  cliente_id: string;
  provider: string;
  provider_user_id: string;
  account_id: string;
  account_name: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  account_data: any;
  permissions: any;
  is_active: boolean;
  connected_by: string | null;
  created_at: string;
  updated_at: string;
}

interface SocialMetric {
  id: string;
  integration_id: string;
  cliente_id: string;
  metric_type: string;
  metric_value: number;
  metric_date: string;
  raw_data: any;
}

export function useSocialIntegrations(clienteId?: string) {
  const { user } = useAuth();
  const { clienteId: contextClienteId } = useClientContext();
  const [integrations, setIntegrations] = useState<SocialIntegration[]>([]);
  const [metrics, setMetrics] = useState<SocialMetric[]>([]);
  const [loading, setLoading] = useState(false);

  // Use provided clienteId or context clienteId
  const targetClienteId = clienteId || contextClienteId;

  const fetchIntegrations = useCallback(async () => {
    if (!user || !targetClienteId) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase
        .from('social_integrations_cliente' as any)
        .select('*')
        .eq('cliente_id', targetClienteId)
        .eq('is_active', true)
        .order('created_at', { ascending: false }) as any);

      if (error) {
        console.error('Erro ao buscar integrações:', error);
        toast.error('Erro ao carregar integrações sociais');
        return;
      }

      setIntegrations((data as SocialIntegration[]) || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar integrações');
    } finally {
      setLoading(false);
    }
  }, [user, targetClienteId]);

  const fetchMetrics = useCallback(async (integrationId?: string) => {
    if (!user || !targetClienteId) return;

    try {
      let query = (supabase
        .from('social_metrics_cliente' as any)
        .select(`
          *,
          social_integrations_cliente!inner(cliente_id, provider, account_name)
        `)
        .eq('cliente_id', targetClienteId)
        .order('metric_date', { ascending: false })
        .limit(100) as any);

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar métricas:', error);
        return;
      }

      setMetrics((data as SocialMetric[]) || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar métricas:', error);
    }
  }, [user, targetClienteId]);

  const disconnectIntegration = useCallback(async (integrationId: string) => {
    if (!targetClienteId) return false;

    try {
      const { error } = await (supabase
        .from('social_integrations_cliente' as any)
        .update({ is_active: false })
        .eq('id', integrationId)
        .eq('cliente_id', targetClienteId) as any);

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
  }, [targetClienteId, fetchIntegrations]);

  const getIntegrationsByProvider = useCallback((provider: string) => {
    return integrations.filter(int => int.provider === provider && int.is_active);
  }, [integrations]);

  const hasIntegration = useCallback((provider: string) => {
    return integrations.some(int => int.provider === provider && int.is_active);
  }, [integrations]);

  const connectSocialAccount = useCallback(async (provider: string, accountData: any) => {
    if (!targetClienteId || !user) return false;

    try {
      const { error } = await (supabase
        .from('social_integrations_cliente' as any)
        .insert({
          cliente_id: targetClienteId,
          provider: provider,
          provider_user_id: accountData.provider_user_id,
          account_id: accountData.account_id,
          account_name: accountData.account_name,
          access_token: accountData.access_token,
          refresh_token: accountData.refresh_token,
          token_expires_at: accountData.token_expires_at,
          account_data: accountData.account_data || {},
          permissions: accountData.permissions || {},
          connected_by: user.id
        }) as any);

      if (error) {
        console.error('Erro ao conectar conta:', error);
        toast.error('Erro ao conectar conta social');
        return false;
      }

      toast.success('Conta conectada com sucesso');
      fetchIntegrations();
      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao conectar conta');
      return false;
    }
  }, [targetClienteId, user, fetchIntegrations]);

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
    getIntegrationsByProvider,
    hasIntegration,
    connectSocialAccount,
    clienteId: targetClienteId
  };
}