import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Especialidade {
  id: string;
  nome: string;
  role_sistema: string;
  cor: string;
  icone: string;
  categoria: string;
  ativo: boolean;
}

export function useEspecialidades() {
  return useQuery({
    queryKey: ['especialidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('especialidades')
        .select('*')
        .eq('ativo', true)
        .order('categoria, nome');
      
      if (error) {
        console.error('❌ Erro ao buscar especialidades:', error);
        throw error;
      }
      
      return data as Especialidade[];
    }
  });
}
