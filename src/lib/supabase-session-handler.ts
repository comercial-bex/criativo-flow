import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function setupSessionRefresh() {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth state change:', event);
    
    if (event === 'TOKEN_REFRESHED') {
      console.log('✅ JWT refreshed successfully');
      toast.success('Sessão renovada', {
        duration: 2000,
      });
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('🚪 User signed out');
      toast.info('Você foi desconectado', {
        duration: 3000,
      });
      setTimeout(() => {
        window.location.href = '/auth';
      }, 3000);
    }
    
    if (!session && event !== 'INITIAL_SESSION') {
      console.log('⚠️ No session detected');
      toast.error('Sua sessão expirou. Redirecionando...', {
        duration: 3000,
      });
      setTimeout(() => {
        window.location.href = '/auth';
      }, 3000);
    }
  });
}
