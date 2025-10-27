import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PessoaAtiva {
  id: string;
  nome: string;
  papeis: string[];
  avatar_url?: string | null;
}

/**
 * Hook para buscar pessoas ativas no sistema
 * Filtra apenas pessoas com acesso ao sistema e ordenadas por nome
 */
export function usePessoasAtivas(papel?: string) {
  return useQuery({
    queryKey: ['pessoas-ativas', papel],
    queryFn: async () => {
      let query = supabase
        .from('pessoas')
        .select('id, nome, papeis, avatar_url')
        .not('profile_id', 'is', null) // Pessoas com acesso ao sistema
        .order('nome', { ascending: true });

      if (papel) {
        query = query.contains('papeis', [papel]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar pessoas ativas:', error);
        throw error;
      }

      return (data || []) as PessoaAtiva[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
