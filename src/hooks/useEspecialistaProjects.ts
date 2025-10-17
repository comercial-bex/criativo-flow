import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Projeto {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string;
  mes_referencia: string | null;
  clientes?: {
    id: string;
    nome: string;
  };
  is_gerente: boolean;
}

export function useEspecialistaProjects(especialistaId: string | null) {
  return useQuery({
    queryKey: ['especialista-projects', especialistaId],
    queryFn: async () => {
      if (!especialistaId) return [];

      const { data, error } = await supabase
        .from('projeto_especialistas')
        .select(`
          is_gerente,
          projetos:projeto_id (
            id,
            titulo,
            descricao,
            status,
            mes_referencia,
            clientes (
              id,
              nome
            )
          )
        `)
        .eq('especialista_id', especialistaId);

      if (error) {
        console.error('Erro ao buscar projetos do especialista:', error);
        throw error;
      }

      const projetosFormatados = (data || []).map((item: any) => ({
        ...item.projetos,
        is_gerente: item.is_gerente
      }));

      return projetosFormatados as Projeto[];
    },
    enabled: !!especialistaId
  });
}
