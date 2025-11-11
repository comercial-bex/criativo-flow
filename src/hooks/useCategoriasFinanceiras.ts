import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: "receita" | "despesa";
  cor: string;
  descricao?: string;
}

/**
 * Hook para buscar categorias financeiras com cache
 */
export function useCategoriasFinanceiras() {
  return useQuery({
    queryKey: ['categorias-financeiras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data as CategoriaFinanceira[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - categorias mudam raramente
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}
