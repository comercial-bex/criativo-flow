import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEspecialistaMetrics(especialistaId: string) {
  return useQuery({
    queryKey: ['especialista-metrics', especialistaId],
    queryFn: async () => {
      // Contar projetos atribuídos
      const { count: projetosAtribuidos } = await supabase
        .from('projeto_especialistas')
        .select('*', { count: 'exact', head: true })
        .eq('especialista_id', especialistaId);

      // Contar tarefas concluídas
      const { count: tarefasConcluidas } = await supabase
        .from('tarefa')
        .select('*', { count: 'exact', head: true })
        .eq('responsavel_id', especialistaId)
        .eq('status', 'publicado' as any);

      // Contar total de tarefas
      const { count: totalTarefas } = await supabase
        .from('tarefa')
        .select('*', { count: 'exact', head: true })
        .eq('responsavel_id', especialistaId);

      // Calcular taxa de conclusão de tarefas (usamos isso ao invés de aprovação)
      const taxaConclusao = totalTarefas && totalTarefas > 0 
        ? Math.round((tarefasConcluidas || 0) / totalTarefas * 100)
        : 0;

      // Verificar se é gerente em algum projeto
      const { data: gerenteProjetos } = await supabase
        .from('projeto_especialistas')
        .select('projeto_id')
        .eq('especialista_id', especialistaId)
        .eq('is_gerente', true);

      return {
        projetosAtribuidos: projetosAtribuidos || 0,
        tarefasConcluidas: tarefasConcluidas || 0,
        totalTarefas: totalTarefas || 0,
        taxaConclusao,
        isGerente: (gerenteProjetos?.length || 0) > 0
      };
    },
    enabled: !!especialistaId
  });
}
