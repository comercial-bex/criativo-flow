import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

/**
 * Normaliza competência para formato DATE (YYYY-MM-DD)
 * Aceita: "2025-10", "2025-10-01", Date object
 * Retorna: "2025-10-01"
 */
function normalizarCompetencia(competencia?: string | Date): string | undefined {
  if (!competencia) return undefined;
  
  // Se é Date object
  if (competencia instanceof Date) {
    return competencia.toISOString().split('T')[0];
  }
  
  // Se já está no formato completo YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(competencia)) {
    return competencia;
  }
  
  // Se está no formato YYYY-MM, adicionar -01
  if (/^\d{4}-\d{2}$/.test(competencia)) {
    return `${competencia}-01`;
  }
  
  // Tentar converter para Date e extrair
  try {
    return new Date(competencia).toISOString().split('T')[0];
  } catch {
    console.error(`❌ Formato de competência inválido: ${competencia}`);
    return undefined;
  }
}

export interface FolhaMes {
  id: string;
  pessoa_id: string;
  competencia: string;
  salario_base: number;
  total_extras: number;
  total_descontos: number;
  total_adiantamentos: number;
  total_a_pagar: number;
  status: 'aberta' | 'fechada' | 'paga';
  resumo?: {
    horas_extras?: number;
    faltas?: number;
    adiantamentos?: number;
    inss?: number;
    irrf?: number;
    outros_descontos?: number;
  };
  created_at?: string;
  updated_at?: string;
}

export function useFolhaMes(pessoaId?: string, competencia?: string) {
  const queryClient = useQueryClient();

  const { data: folhas = [], isLoading } = useQuery({
    queryKey: ['folha-mes', pessoaId, competencia],
    queryFn: async () => {
      let query = supabase
        .from('folha_mes')
        .select('*', { count: 'exact' })
        .order('competencia', { ascending: false })
        .range(0, 49); // Paginação: primeiros 50 registros
      
      if (pessoaId) query = query.eq('pessoa_id', pessoaId);
      if (competencia) {
        const competenciaNormalizada = normalizarCompetencia(competencia);
        if (competenciaNormalizada) {
          query = query.eq('competencia', competenciaNormalizada);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as FolhaMes[];
    },
    enabled: !!pessoaId || !!competencia,
    staleTime: 30 * 1000, // 30 segundos (dados críticos)
    gcTime: 2 * 60 * 1000, // 2 minutos
  });

  const calcularFolhaMutation = useMutation({
    mutationFn: async ({ pessoaId, competencia }: { pessoaId: string; competencia: string }) => {
      const competenciaNormalizada = normalizarCompetencia(competencia);
      
      if (!competenciaNormalizada) {
        throw new Error('Formato de competência inválido. Use YYYY-MM ou YYYY-MM-DD');
      }
      
      const { data, error } = await supabase.rpc('calcular_folha_mes', {
        p_pessoa_id: pessoaId,
        p_competencia: competenciaNormalizada,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folha-mes'] });
      smartToast.success('Folha calculada com sucesso');
    },
    onError: (error: any) => {
      console.error('❌ Erro ao calcular folha:', error);
      
      // Mensagens específicas por tipo de erro
      if (error.message?.includes('date') || error.message?.includes('formato')) {
        smartToast.error(
          'Erro de Data', 
          'Formato de competência inválido. Use YYYY-MM-DD (ex: 2025-10-01)'
        );
      } else if (error.code === 'PGRST116') {
        smartToast.error('Sem dados', 'Nenhum registro encontrado para esta competência');
      } else if (error.message?.includes('calcular_folha_mes')) {
        smartToast.error(
          'Função não encontrada', 
          'A função calcular_folha_mes não existe no banco de dados'
        );
      } else {
        smartToast.error('Erro ao calcular folha', error.message || 'Erro desconhecido');
      }
    },
  });

  const fecharFolhaMutation = useMutation({
    mutationFn: async ({ pessoaId, competencia }: { pessoaId: string; competencia: string }) => {
      const competenciaNormalizada = normalizarCompetencia(competencia);
      
      if (!competenciaNormalizada) {
        throw new Error('Formato de competência inválido. Use YYYY-MM ou YYYY-MM-DD');
      }
      
      const { data, error } = await supabase.rpc('fechar_folha_mes', {
        p_pessoa_id: pessoaId,
        p_competencia: competenciaNormalizada,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folha-mes'] });
      queryClient.invalidateQueries({ queryKey: ['adiantamentos'] });
      smartToast.success('Folha fechada com sucesso');
    },
    onError: (error: any) => {
      console.error('❌ Erro ao fechar folha:', error);
      
      if (error.message?.includes('date') || error.message?.includes('formato')) {
        smartToast.error(
          'Erro de Data', 
          'Formato de competência inválido. Use YYYY-MM-DD'
        );
      } else {
        smartToast.error('Erro ao fechar folha', error.message || 'Erro desconhecido');
      }
    },
  });

  const marcarComoPagaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('folha_mes')
        .update({ status: 'paga' })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folha-mes'] });
      smartToast.success('Folha marcada como paga');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao marcar folha como paga', error.message);
    },
  });

  return {
    folhas,
    isLoading,
    calcularFolha: calcularFolhaMutation.mutate,
    fecharFolha: fecharFolhaMutation.mutate,
    marcarComoPaga: marcarComoPagaMutation.mutate,
    isCalculando: calcularFolhaMutation.isPending,
    isFechando: fecharFolhaMutation.isPending,
    isMarcandoPaga: marcarComoPagaMutation.isPending,
  };
}
