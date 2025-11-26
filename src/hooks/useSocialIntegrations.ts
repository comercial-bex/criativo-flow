/**
 * Hook de Social Integrations - DESABILITADO
 * Tabelas social_* foram removidas
 */

export function useSocialIntegrations(_clienteId?: string) {
  return {
    integrations: [],
    metrics: [],
    loading: false,
    fetchIntegrations: () => Promise.resolve(),
    fetchMetrics: (_integrationId?: string) => Promise.resolve(),
    disconnectIntegration: (_integrationId: string) => {
      console.warn('⚠️ social_integrations_cliente removida');
      return Promise.resolve(false);
    },
    getIntegrationsByProvider: (_provider: string) => [],
    hasIntegration: (_provider: string) => false,
    connectSocialAccount: (_provider: string, _accountData: any) => {
      console.warn('⚠️ social_integrations_cliente removida');
      return Promise.resolve(false);
    },
    clienteId: _clienteId,
  };
}
