import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjetoGRS {
  id: string;
  titulo: string;
  status: string;
  data_prazo: string | null;
  cliente_id: string;
  cliente_nome: string;
  progresso: number;
}

interface MetricasGRS {
  projetosPendentes: number;
  tarefasNovo: number;
  tarefasEmAndamento: number;
  tarefasConcluido: number;
}

const QUERY_KEY = 'projetos-grs';

// ============================================================================
// FETCH PROJETOS DO GRS COM MÉTRICAS
// ============================================================================
export function useProjetosGRSOptimized(grsId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'dashboard', grsId],
    queryFn: async () => {
      if (!grsId) {
        return {
          projetos: [],
          metricas: {
            projetosPendentes: 0,
            tarefasNovo: 0,
            tarefasEmAndamento: 0,
            tarefasConcluido: 0
          }
        };
      }

      // Buscar projetos do GRS
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select(`
          id,
          titulo,
          status,
          data_prazo,
          cliente_id,
          progresso,
          clientes:cliente_id (
            nome
          )
        `)
        .eq('responsavel_grs_id', grsId)
        .not('status', 'in', '("arquivado","inativo")')
        .order('data_prazo', { ascending: true })
        .limit(10);

      if (projetosError) throw projetosError;

      const projetos: ProjetoGRS[] = (projetosData || []).map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        status: p.status,
        data_prazo: p.data_prazo,
        cliente_id: p.cliente_id,
        cliente_nome: p.clientes?.nome || 'Cliente',
        progresso: p.progresso || 0
      }));

      // Buscar métricas em paralelo
      const [pendentes, novo, emAndamento, concluido] = await Promise.all([
        supabase
          .from('projetos')
          .select('*', { count: 'exact', head: true })
          .eq('responsavel_grs_id', grsId)
          .eq('status', 'ativo'),
        
        supabase
          .from('tarefa')
          .select('*', { count: 'exact', head: true })
          .eq('responsavel_id', grsId)
          .eq('status', 'backlog'),
        
        supabase
          .from('tarefa')
          .select('*', { count: 'exact', head: true })
          .eq('responsavel_id', grsId)
          .eq('status', 'em_producao'),
        
        supabase
          .from('tarefa')
          .select('*', { count: 'exact', head: true })
          .eq('responsavel_id', grsId)
          .eq('status', 'publicado')
      ]);

      const metricas: MetricasGRS = {
        projetosPendentes: pendentes.count || 0,
        tarefasNovo: novo.count || 0,
        tarefasEmAndamento: emAndamento.count || 0,
        tarefasConcluido: concluido.count || 0
      };

      return { projetos, metricas };
    },
    enabled: !!grsId,
    staleTime: 2 * 60 * 1000, // 2 minutos - dashboard precisa ser relativamente atualizado
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
  });
}

// ============================================================================
// FETCH APENAS MÉTRICAS GRS (mais leve)
// ============================================================================
export function useMetricasGRS(grsId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'metricas', grsId],
    queryFn: async () => {
      if (!grsId) {
        return {
          projetosPendentes: 0,
          tarefasNovo: 0,
          tarefasEmAndamento: 0,
          tarefasConcluido: 0
        };
      }

      const [pendentes, novo, emAndamento, concluido] = await Promise.all([
        supabase
          .from('projetos')
          .select('*', { count: 'exact', head: true })
          .eq('responsavel_grs_id', grsId)
          .eq('status', 'ativo'),
        
        supabase
          .from('tarefa')
          .select('*', { count: 'exact', head: true })
          .eq('responsavel_id', grsId)
          .eq('status', 'backlog'),
        
        supabase
          .from('tarefa')
          .select('*', { count: 'exact', head: true })
          .eq('responsavel_id', grsId)
          .eq('status', 'em_producao'),
        
        supabase
          .from('tarefa')
          .select('*', { count: 'exact', head: true })
          .eq('responsavel_id', grsId)
          .eq('status', 'publicado')
      ]);

      return {
        projetosPendentes: pendentes.count || 0,
        tarefasNovo: novo.count || 0,
        tarefasEmAndamento: emAndamento.count || 0,
        tarefasConcluido: concluido.count || 0
      };
    },
    enabled: !!grsId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}
