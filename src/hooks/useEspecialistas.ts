// BEX 3.0 - Hook para buscar especialistas

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEspecialistas() {
  return useQuery({
    queryKey: ['especialistas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, especialidade')
        .in('especialidade', ['audiovisual', 'design', 'filmmaker'])
        .eq('status', 'aprovado')
        .order('nome');
      
      if (error) throw error;
      return data || [];
    }
  });
}
