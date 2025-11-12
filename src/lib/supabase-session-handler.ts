import { supabase } from '@/integrations/supabase/client';

export function setupSessionRefresh() {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth state change:', event);
    
    if (event === 'TOKEN_REFRESHED') {
      console.log('✅ JWT refreshed successfully');
      // Toast removido - não é crítico mostrar refreshes automáticos
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('🚪 User signed out');
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    }
    
    if (!session && event !== 'INITIAL_SESSION') {
      console.log('⚠️ No session detected');
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    }
  });
}
