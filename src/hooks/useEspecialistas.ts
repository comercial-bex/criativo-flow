// BEX 3.0 - Hook para buscar especialistas

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEspecialistas() {
  return useQuery({
    queryKey: ['especialistas'],
    queryFn: async () => {
      // Buscar especialistas aprovados OU admins
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          nome, 
          especialidade,
          user_roles!inner(role)
        `)
        .eq('status', 'aprovado')
        .or('especialidade.in.(audiovisual,design,filmmaker,grs),user_roles.role.eq.admin')
        .order('nome');
      
      if (error) throw error;
      
      // Mapear para formato esperado, mostrando "Admin" para admins sem especialidade
      return (data || []).map(profile => ({
        id: profile.id,
        nome: profile.nome,
        especialidade: profile.especialidade || 'admin'
      }));
    }
  });
}
