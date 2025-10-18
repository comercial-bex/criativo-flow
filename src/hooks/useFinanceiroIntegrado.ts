import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MODULE_QUERY_CONFIG } from "@/lib/queryConfig";

interface LancamentoIntegrado {
  id: string;
  data_lancamento: string;
  descricao: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  tarefa_titulo: string | null;
  tarefa_status: string | null;
  evento_titulo: string | null;
  evento_tipo: string | null;
  projeto_titulo: string | null;
}

export function useFinanceiroIntegrado(params?: {
  projetoId?: string;
  clienteId?: string;
}) {
  const { data: lancamentos = [], isLoading } = useQuery({
    queryKey: ['financeiro-integrado', params?.projetoId, params?.clienteId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_financeiro_integrado', {
        p_projeto_id: params?.projetoId || null,
        p_cliente_id: params?.clienteId || null
      });

      if (error) throw error;
      return data as LancamentoIntegrado[];
    },
    enabled: !!(params?.projetoId || params?.clienteId),
    ...MODULE_QUERY_CONFIG.lancamentos
  });

  // Calcular totais
  const totalReceitas = lancamentos
    .filter(l => l.tipo === 'receita')
    .reduce((sum, l) => sum + Number(l.valor), 0);

  const totalDespesas = lancamentos
    .filter(l => l.tipo === 'despesa')
    .reduce((sum, l) => sum + Number(l.valor), 0);

  const saldo = totalReceitas - totalDespesas;

  // Custos por tarefa
  const custosPorTarefa = lancamentos
    .filter(l => l.tarefa_titulo)
    .reduce((acc, l) => {
      const titulo = l.tarefa_titulo!;
      acc[titulo] = (acc[titulo] || 0) + Number(l.valor);
      return acc;
    }, {} as Record<string, number>);

  // Custos por tipo de evento
  const custosPorEvento = lancamentos
    .filter(l => l.evento_tipo)
    .reduce((acc, l) => {
      const tipo = l.evento_tipo!;
      acc[tipo] = (acc[tipo] || 0) + Number(l.valor);
      return acc;
    }, {} as Record<string, number>);

  return {
    lancamentos,
    isLoading,
    resumo: {
      totalReceitas,
      totalDespesas,
      saldo,
      margemLucro: totalReceitas > 0 
        ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 
        : 0
    },
    analises: {
      custosPorTarefa,
      custosPorEvento,
      tarefaMaisCara: Object.entries(custosPorTarefa).sort((a, b) => b[1] - a[1])[0],
      eventoMaisCaro: Object.entries(custosPorEvento).sort((a, b) => b[1] - a[1])[0]
    }
  };
}
