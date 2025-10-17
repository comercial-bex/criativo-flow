import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AccessLoggerProps {
  action?: string;
  metadata?: Record<string, any>;
}

export function AccessLogger({ action = 'page_view', metadata = {} }: AccessLoggerProps) {
  const { user } = useAuth();

  useEffect(() => {
    const logAccess = async () => {
      if (!user?.email) return;

      try {
        // Obter informações básicas do cliente
        const userAgent = navigator.userAgent;
        const currentUrl = window.location.href;
        
        const logData = {
          p_user_id: user.id,
          p_email: user.email,
          p_action: action,
          p_ip_address: null, // Will be filled by edge function if needed
          p_user_agent: userAgent,
          p_error_message: null,
          p_metadata: {
            url: currentUrl,
            timestamp: new Date().toISOString(),
            ...metadata
          }
        };

        // Log de acesso usando função SQL
        await supabase.rpc('log_user_access', logData);
      } catch (error) {
        // Erro silencioso - funcionalidade de background
      }
    };

    logAccess();
  }, [user, action, metadata]);

  // Component não renderiza nada visualmente
  return null;
}

// Hook para facilitar o uso
export function useAccessLogger() {
  const { user } = useAuth();

  const logAction = async (action: string, metadata: Record<string, any> = {}) => {
    if (!user?.email) return;

    try {
      const logData = {
        p_user_id: user.id,
        p_email: user.email,
        p_action: action,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
        p_error_message: null,
        p_metadata: {
          timestamp: new Date().toISOString(),
          ...metadata
        }
      };

      await supabase.rpc('log_user_access', logData);
    } catch (error) {
      // Erro silencioso - funcionalidade de background
    }
  };

  return { logAction };
}