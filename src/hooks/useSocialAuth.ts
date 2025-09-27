import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientContext } from '@/hooks/useClientContext';
import { toast } from 'sonner';

type SocialProvider = 'facebook' | 'google' | 'instagram';

export function useSocialAuth() {
  const [loading, setLoading] = useState(false);
  const { clienteId } = useClientContext();

  const signInWithProvider = useCallback(async (provider: SocialProvider) => {
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      let scopes = '';
      
      switch (provider) {
        case 'facebook':
          scopes = 'email,pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights';
          break;
        case 'google':
          scopes = 'email,profile,https://www.googleapis.com/auth/business.manage';
          break;
        case 'instagram':
          scopes = 'user_profile,user_media';
          break;
        default:
          scopes = 'email';
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'instagram' ? 'facebook' : provider, // Instagram usa OAuth do Facebook
        options: {
          redirectTo: redirectUrl,
          scopes
        }
      });

      if (error) {
        console.error(`Erro no login com ${provider}:`, error);
        
        // Mensagens de erro mais específicas
        let errorMessage = `Erro ao conectar com ${provider}`;
        if (error.message?.includes('not enabled')) {
          errorMessage = `${provider} não está configurado. Configure OAuth no painel do Supabase primeiro.`;
        } else if (error.message?.includes('invalid_request')) {
          errorMessage = `Configuração OAuth inválida para ${provider}. Verifique as configurações.`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        return { error };
      }

      // O redirecionamento acontece automaticamente
      return { error: null };
    } catch (error: any) {
      console.error(`Erro inesperado no login ${provider}:`, error);
      toast.error('Erro inesperado no login social');
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const connectSocialAccount = useCallback(async (provider: SocialProvider) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para conectar uma conta social');
        return { error: new Error('User not authenticated') };
      }

      if (!clienteId) {
        toast.error('Selecione um cliente antes de conectar uma conta social');
        return { error: new Error('Client not selected') };
      }

      // Store client context for OAuth callback
      localStorage.setItem('oauth_client_id', clienteId);
      localStorage.setItem('oauth_provider', provider);
      
      return await signInWithProvider(provider);
    } catch (error: any) {
      console.error('Erro ao conectar conta social:', error);
      toast.error('Erro ao conectar conta social');
      return { error };
    }
  }, [signInWithProvider, clienteId]);

  return {
    loading,
    signInWithProvider,
    connectSocialAccount
  };
}