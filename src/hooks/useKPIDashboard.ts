import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KPIDashboard {
  receita_mes_atual: number;
  despesa_mes_atual: number;
  inadimplencia_total: number;
  lucro_mes_atual: number;
  projetos_ativos: number;
  projetos_concluidos_mes: number;
  tarefas_pendentes: number;
  tarefas_atrasadas: number;
  tarefas_concluidas_mes: number;
  clientes_ativos: number;
  novos_clientes_mes: number;
  metas_concluidas: number;
  metas_atrasadas: number;
  progresso_medio_metas: number;
  equipamentos_ativos: number;
  equipamentos_em_uso: number;
  manutencoes_vencidas: number;
  colaboradores_ativos: number;
  folha_prevista_mes: number;
  aprovacoes_pendentes: number;
  atualizado_em: string;
}

export function useKPIDashboard() {
  return useQuery({
    queryKey: ['kpi-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_kpis_dashboard');
      
      if (error) {
        console.error('Erro ao buscar KPIs:', error);
        throw error;
      }
      
      return (data?.[0] || null) as KPIDashboard | null;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (KPIs atualizam rápido)
    refetchInterval: 5 * 60 * 1000, // Refresh automático a cada 5 minutos
    refetchOnWindowFocus: true,
  });
}
