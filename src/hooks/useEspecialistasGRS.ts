// BEX 3.0 - Hook para buscar apenas especialistas GRS

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEspecialistasGRS() {
  return useQuery({
    queryKey: ['especialistas-grs'],
    queryFn: async () => {
      // Buscar apenas GRS aprovados
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          nome,
          email,
          telefone,
          especialidade,
          user_roles(role)
        `)
        .eq('status', 'aprovado')
        .eq('especialidade', 'grs')
        .order('nome');
      
      if (error) {
        console.error('❌ Erro ao buscar especialistas GRS:', error);
        throw error;
      }
      
      // Filtrar apenas quem tem role GRS
      const especialistasGRS = (data || []).filter(profile => {
        const roles = (profile.user_roles as any) || [];
        return roles.some((r: any) => r.role === 'grs');
      });
      
      console.log('✅ Especialistas GRS:', especialistasGRS);
      
      // Mapear para formato esperado
      return especialistasGRS.map(profile => ({
        id: profile.id,
        nome: profile.nome,
        email: profile.email,
        telefone: profile.telefone,
        especialidade: profile.especialidade || 'grs',
        role: 'grs'
      }));
    }
  });
}
