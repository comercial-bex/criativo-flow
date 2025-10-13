// BEX 3.0 - Hook para buscar especialistas

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEspecialistas() {
  return useQuery({
    queryKey: ['especialistas'],
    queryFn: async () => {
      // Buscar todos os aprovados com suas roles (left join para incluir todos)
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
        .order('nome');
      
      if (error) {
        console.error('❌ Erro ao buscar especialistas no hook:', error);
        throw error;
      }
      
      // Filtrar apenas não-clientes
      const especialistas = (data || []).filter(profile => {
        const roles = (profile.user_roles as any) || [];
        return roles.length === 0 || roles.some((r: any) => r.role !== 'cliente');
      });
      
      console.log('✅ Especialistas do hook:', especialistas);
      
      // Mapear para formato esperado
      return especialistas.map(profile => ({
        id: profile.id,
        nome: profile.nome,
        email: profile.email,
        telefone: profile.telefone,
        especialidade: profile.especialidade || 'admin',
        role: ((profile.user_roles as any)?.[0]?.role) || 'admin'
      }));
    }
  });
}
