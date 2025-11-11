import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook centralizado para prefetch inteligente de dados
 * Carrega dados antes da navegação para melhor UX
 */
export function usePrefetchData() {
  const queryClient = useQueryClient();

  // Prefetch de tarefas por usuário
  const prefetchMinhasTarefas = async (userId: string, setor?: string) => {
    const queryKey = setor 
      ? ['tarefas-optimized', 'list', { executorId: userId, executorArea: setor }]
      : ['tarefas-optimized', 'minhas', userId];

    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        let query = supabase
          .from('tarefa')
          .select(`
            *,
            pessoas:responsavel_id (id, nome, email),
            clientes:cliente_id (id, nome),
            projetos:projeto_id (id, titulo)
          `);

        if (setor) {
          query = query.eq('executor_id', userId);
          if (setor !== 'all') {
            query = query.eq('executor_area', setor as any);
          }
        } else {
          query = query.eq('responsavel_id', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const tarefas = (data || []).map((t: any) => ({
          ...t,
          data_prazo: t.prazo_executor || t.data_prazo,
          responsavel_nome: t.pessoas?.nome,
          cliente_nome: t.clientes?.nome,
          projeto_nome: t.projetos?.titulo,
        }));

        return { tarefas, total: tarefas.length };
      },
      staleTime: 2 * 60 * 1000, // 2 minutos
    });
  };

  // Prefetch de stats de tarefas
  const prefetchTarefasStats = async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['tarefas-optimized', 'stats', userId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('tarefa')
          .select('status, data_prazo, prazo_executor, created_at')
          .eq('responsavel_id', userId);

        if (error) throw error;

        const agora = new Date();
        const inicioSemana = new Date(agora);
        inicioSemana.setDate(agora.getDate() - 7);

        return {
          total: data.length,
          em_andamento: data.filter((t: any) => 
            t.status === 'em_andamento' || t.status === 'em_producao'
          ).length,
          vencidas: data.filter((t: any) => {
            const prazo = new Date(t.prazo_executor || t.data_prazo || '');
            return prazo < agora && t.status !== 'concluido' && t.status !== 'publicado';
          }).length,
          concluidas_semana: data.filter((t: any) => {
            const updated = new Date(t.created_at);
            return (
              (t.status === 'concluido' || t.status === 'publicado') &&
              updated >= inicioSemana
            );
          }).length,
        };
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  // Prefetch de projetos
  const prefetchProjetos = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['projetos-optimized', 'list', { includeRelations: true }],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('projeto' as any)
          .select(`
            *,
            clientes:cliente_id (id, nome, logo_url, cor_primaria),
            pessoas:responsavel_id (id, nome, email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const projetos = (data || []).map((p: any) => ({
          ...p,
          cliente_nome: p.clientes?.nome,
          cliente_logo: p.clientes?.logo_url,
          cliente_cor: p.clientes?.cor_primaria,
          responsavel_nome: p.pessoas?.nome,
        }));

        return { projetos, total: projetos.length };
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  // Prefetch de clientes ativos
  const prefetchClientes = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['clientes-optimized', 'ativos'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cliente' as any)
          .select('*')
          .eq('ativo', true)
          .order('nome', { ascending: true });

        if (error) throw error;
        return data || [];
      },
      staleTime: 10 * 60 * 1000, // 10 minutos
    });
  };

  // Prefetch de dashboard GRS
  const prefetchDashboardGRS = async (userId: string) => {
    await Promise.all([
      prefetchProjetos(),
      prefetchClientes(),
      prefetchMinhasTarefas(userId),
      prefetchTarefasStats(userId),
    ]);
  };

  // Prefetch de dashboard setor (Audiovisual/Design)
  const prefetchDashboardSetor = async (userId: string, setor: string) => {
    await Promise.all([
      prefetchMinhasTarefas(userId, setor),
      prefetchTarefasStats(userId),
      prefetchProjetos(),
    ]);
  };

  return {
    prefetchMinhasTarefas,
    prefetchTarefasStats,
    prefetchProjetos,
    prefetchClientes,
    prefetchDashboardGRS,
    prefetchDashboardSetor,
  };
}
