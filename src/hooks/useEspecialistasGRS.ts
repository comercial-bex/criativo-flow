// BEX 3.0 - Hook para buscar apenas especialistas GRS

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEspecialistasGRS() {
  return useQuery({
    queryKey: ['especialistas-grs'],
    queryFn: async () => {
      // Buscar apenas GRS aprovados usando tabela pessoas
      const { data, error } = await supabase
        .from('pessoas')
        .select(`
          id, 
          nome,
          email,
          telefones,
          papeis
        `)
        .eq('status', 'ativo')
        .contains('papeis', ['grs'])
        .order('nome');
      
      if (error) {
        console.error('❌ Erro ao buscar especialistas GRS:', error);
        throw error;
      }
      
      console.log('✅ Especialistas GRS:', data);
      
      // Mapear para formato esperado
      return (data || []).map(pessoa => ({
        id: pessoa.id,
        nome: pessoa.nome,
        email: pessoa.email,
        telefone: Array.isArray(pessoa.telefones) && pessoa.telefones.length > 0 
          ? pessoa.telefones[0] 
          : null,
        especialidade: 'grs',
        role: 'grs'
      }));
    }
  });
}
