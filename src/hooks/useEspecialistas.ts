// BEX 3.0 - Hook para buscar especialistas

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEspecialistas() {
  return useQuery({
    queryKey: ['especialistas'],
    queryFn: async () => {
      // Buscar todos os aprovados com suas roles
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          nome, 
          especialidade,
          user_roles!inner(role)
        `)
        .eq('status', 'aprovado')
        .neq('user_roles.role', 'cliente')
        .order('nome');
      
      if (error) {
        console.error('❌ Erro ao buscar especialistas no hook:', error);
        throw error;
      }
      
      console.log('✅ Especialistas do hook:', data);
      
      // Mapear para formato esperado
      return (data || []).map(profile => ({
        id: profile.id,
        nome: profile.nome,
        especialidade: profile.especialidade || 'admin',
        role: (profile.user_roles as any)?.[0]?.role
      }));
    }
  });
}
