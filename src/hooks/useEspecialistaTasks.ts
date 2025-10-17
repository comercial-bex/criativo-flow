import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Tarefa {
  id: string;
  titulo: string;
  status: string;
  prioridade: string;
  data_prazo: string | null;
  projeto: {
    id: string;
    titulo: string;
    clientes?: {
      nome: string;
    };
  };
}

export function useEspecialistaTasks(especialistaId: string | null) {
  return useQuery({
    queryKey: ['especialista-tasks', especialistaId],
    queryFn: async () => {
      if (!especialistaId) return [];

      const { data, error } = await supabase
        .from('tarefa')
        .select(`
          id,
          titulo,
          status,
          prioridade,
          prazo_executor,
          projeto_id,
          cliente_id
        `)
        .eq('responsavel_id', especialistaId)
        .order('prazo_executor', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tarefas do especialista:', error);
        throw error;
      }

      const tarefasFormatadas = await Promise.all((data || []).map(async (tarefa: any) => {
        let projeto: any = null;
        if (tarefa.projeto_id) {
          const { data: projetoData } = await supabase
            .from('projetos')
            .select('id, titulo, clientes(nome)')
            .eq('id', tarefa.projeto_id)
            .single();
          projeto = projetoData;
        }
        
        return {
          ...tarefa,
          data_prazo: tarefa.prazo_executor,
          projeto
        };
      }));

      return tarefasFormatadas as Tarefa[];
    },
    enabled: !!especialistaId
  });
}
