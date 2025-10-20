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
        .eq('status', 'aprovado')
        .order('nome');
      
      if (error) {
        console.error('❌ Erro ao buscar especialistas:', error);
        throw error;
      }
      
      return (data || []).map(pessoa => {
        // Determinar especialidade com base nos papeis
        const especialidade = pessoa.papeis?.includes('grs') ? 'grs' :
                            pessoa.papeis?.includes('design') ? 'design' :
                            pessoa.papeis?.includes('audiovisual') ? 'audiovisual' :
                            'especialista';
        
        return {
          id: pessoa.profile_id || pessoa.id,
          nome: pessoa.nome,
          email: pessoa.email || '',
          telefone: Array.isArray(pessoa.telefones) ? pessoa.telefones[0] : null,
          especialidade,
          papeis: pessoa.papeis
        };
      });
    }
  });
}
