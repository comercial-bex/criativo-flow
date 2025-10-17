import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, subMonths, format } from 'date-fns';
import { MODULE_QUERY_CONFIG } from '@/lib/queryConfig';

export function useFolhaAnalytics(mesesRetroativos: number = 6) {
  const { data: evolucaoMensal, isLoading: loadingEvolucao } = useQuery({
    queryKey: ['folha-evolucao', mesesRetroativos],
    ...MODULE_QUERY_CONFIG.folhaPonto,
    queryFn: async () => {
      const hoje = new Date();
      const dataInicio = startOfMonth(subMonths(hoje, mesesRetroativos));
      
      const { data, error } = await supabase
        .from('financeiro_folha')
        .select('competencia, total_liquido, total_encargos, total_colaboradores, mes, ano')
        .gte('competencia', format(dataInicio, 'yyyy-MM-dd'))
        .order('competencia', { ascending: true });
      
      if (error) throw error;
      
      return data.map(f => ({
        mes: `${String(f.mes).padStart(2, '0')}/${f.ano}`,
        total_liquido: f.total_liquido,
        total_encargos: f.total_encargos,
        total_colaboradores: f.total_colaboradores,
      }));
    },
  });

  const { data: composicaoEncargos, isLoading: loadingComposicao } = useQuery({
    queryKey: ['folha-composicao-encargos'],
    ...MODULE_QUERY_CONFIG.folhaPonto,
    queryFn: async () => {
      // Buscar última folha processada
      const { data: ultimaFolha } = await supabase
        .from('financeiro_folha')
        .select('id, total_encargos')
        .eq('status', 'processada')
        .order('competencia', { ascending: false })
        .limit(1)
        .single();
      
      if (!ultimaFolha) return [];
      
      const { data: itens } = await supabase
        .from('financeiro_folha_itens')
        .select('encargos')
        .eq('folha_id', ultimaFolha.id);
      
      if (!itens) return [];
      
      // Agregar encargos por tipo
      const agregado: Record<string, number> = {};
      
      itens.forEach(item => {
        (item.encargos as any[])?.forEach(enc => {
          if (!agregado[enc.nome]) {
            agregado[enc.nome] = 0;
          }
          agregado[enc.nome] += enc.valor;
        });
      });
      
      const total = Object.values(agregado).reduce((sum, val) => sum + val, 0);
      
      return Object.entries(agregado).map(([nome, valor]) => ({
        nome,
        valor,
        percentual: (valor / total) * 100,
      }));
    },
  });

  const { data: taxaAbsenteismo, isLoading: loadingAbsenteismo } = useQuery({
    queryKey: ['folha-absenteismo'],
    ...MODULE_QUERY_CONFIG.folhaPonto,
    queryFn: async () => {
      const hoje = new Date();
      const mesAtual = format(hoje, 'yyyy-MM-01');
      
      const { data: pontos } = await supabase
        .from('rh_folha_ponto')
        .select('status')
        .eq('competencia', mesAtual);
      
      if (!pontos || pontos.length === 0) return 0;
      
      // Considerar rejeitados como ausências para cálculo
      const ausencias = pontos.filter(p => p.status === 'rejeitado').length;
      return (ausencias / pontos.length) * 100;
    },
  });

  return {
    evolucaoMensal: evolucaoMensal || [],
    composicaoEncargos: composicaoEncargos || [],
    taxaAbsenteismo: taxaAbsenteismo || 0,
    isLoading: loadingEvolucao || loadingComposicao || loadingAbsenteismo,
  };
}
