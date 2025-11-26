/**
 * Hook de Social Auth - DESABILITADO
 * Tabelas social_* foram removidas
 */

export function useSocialAuth() {
  return {
    loading: false,
    signInWithProvider: (_provider: string) => {
      console.warn('⚠️ social_integrations_cliente removida');
      return Promise.resolve({ error: new Error('Feature disabled') });
    },
    connectSocialAccount: (_provider: string) => {
      console.warn('⚠️ social_integrations_cliente removida');
      return Promise.resolve({ error: new Error('Feature disabled') });
    },
    validateAccountRequirements: (_provider: string) => {
      return Promise.resolve({ success: false, requirements: [], message: 'Feature disabled' });
    },
    fetchAvailableAccounts: (_provider: string, _accessToken: string) => {
      return Promise.resolve({ success: false, accounts: [], validAccounts: [] });
    },
    connectMultipleAccounts: (_accounts: any[]) => {
      console.warn('⚠️ social_integrations_cliente removida');
      return Promise.resolve({ success: false, connectedCount: 0 });
    },
  };
}
