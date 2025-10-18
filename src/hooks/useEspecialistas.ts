import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEspecialistas() {
  return useQuery({
    queryKey: ['especialistas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select(`
          id,
          nome,
          email,
          telefones,
          profile_id,
          papeis
        `)
        .contains('papeis', ['especialista'])
        .eq('status', 'ativo')
        .not('profile_id', 'is', null)
        .order('nome');
      
      if (error) {
        console.error('❌ Erro ao buscar especialistas:', error);
        throw error;
      }
      
      return (data || []).map(pessoa => ({
        id: pessoa.profile_id!,
        nome: pessoa.nome,
        email: pessoa.email,
        telefone: Array.isArray(pessoa.telefones) ? pessoa.telefones[0] : null,
        especialidade: 'especialista',
        papeis: pessoa.papeis
      }));
    }
  });
}
