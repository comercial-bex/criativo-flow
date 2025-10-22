import { supabase } from '@/integrations/supabase/client';

export async function queryWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 3
): Promise<{ data: T | null; error: any }> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    const result = await queryFn();
    
    // Se sucesso, retornar
    if (!result.error) {
      console.log('✅ Query successful');
      return result;
    }
    
    // Se JWT expired, tentar refresh
    if (result.error?.code === 'PGRST303' || result.error?.message?.includes('JWT expired')) {
      console.log(`🔄 JWT expired, attempting refresh (attempt ${i + 1}/${maxRetries})`);
      
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('❌ Failed to refresh session:', refreshError);
        return { data: null, error: refreshError };
      }
      
      // Aguardar 1s antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }
    
    // Outros erros, retornar imediatamente
    lastError = result.error;
    console.error('❌ Query error:', result.error);
    return result;
  }
  
  return { data: null, error: lastError };
}
