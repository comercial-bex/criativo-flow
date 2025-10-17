import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

export interface OcorrenciaPonto {
  id: string;
  pessoa_id: string;
  data: string;
  tipo: 'extra' | 'folga' | 'falta';
  horas?: number;
  valor?: number;
  observacao?: string;
  status?: 'pendente' | 'aprovado' | 'rejeitado';
  created_at?: string;
  updated_at?: string;
}

/**
 * Hook para gerenciar ocorrências de ponto
 * @param pessoaId - ID da pessoa (estrutura unificada)
 * @param competencia - Mês/ano no formato YYYY-MM
 */
export function useOcorrenciasPonto(pessoaId?: string, competencia?: string) {
  const queryClient = useQueryClient();

  const { data: ocorrencias = [], isLoading } = useQuery({
    queryKey: ['ocorrencias-ponto', pessoaId, competencia],
    queryFn: async () => {
      let query = supabase
        .from('ocorrencias_ponto')
        .select('*', { count: 'exact' })
        .order('data', { ascending: false })
        .range(0, 49); // Paginação: primeiros 50 registros
      
      if (pessoaId) query = query.eq('pessoa_id', pessoaId);
      if (competencia) {
        const [ano, mes] = competencia.split('-');
        const dataInicio = `${ano}-${mes}-01`;
        const dataFim = new Date(parseInt(ano), parseInt(mes), 0).toISOString().split('T')[0];
        query = query.gte('data', dataInicio).lte('data', dataFim);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as OcorrenciaPonto[];
    },
    enabled: !!pessoaId || !!competencia,
    staleTime: 1 * 60 * 1000, // 1 minuto (dados dinâmicos)
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  const criarMutation = useMutation({
    mutationFn: async (dados: Omit<OcorrenciaPonto, 'id' | 'created_at' | 'updated_at'>) => {
      // Buscar salário base da pessoa para calcular valor
      if (dados.horas && !dados.valor) {
        const { data: pessoa } = await supabase
          .from('pessoas')
          .select('salario_base, fee_mensal')
          .eq('id', dados.pessoa_id)
          .single();
        
        if (pessoa) {
          const valorHora = (pessoa.salario_base || pessoa.fee_mensal || 0) / 220;
          dados.valor = valorHora * dados.horas * (dados.tipo === 'extra' ? 1.5 : 1);
        }
      }

      // Validar sobreposição de datas
      const { data: conflito } = await supabase
        .from('ocorrencias_ponto')
        .select('id')
        .eq('pessoa_id', dados.pessoa_id)
        .eq('data', dados.data)
        .single();
      
      if (conflito) {
        throw new Error('Já existe uma ocorrência registrada para esta data');
      }

      const { data, error } = await supabase
        .from('ocorrencias_ponto')
        .insert([dados])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias-ponto'] });
      smartToast.success('Ocorrência registrada com sucesso');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao registrar ocorrência', error.message);
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OcorrenciaPonto> & { id: string }) => {
      const { data, error } = await supabase
        .from('ocorrencias_ponto')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias-ponto'] });
      smartToast.success('Ocorrência atualizada com sucesso');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao atualizar ocorrência', error.message);
    },
  });

  const aprovarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ocorrencias_ponto')
        .update({ status: 'aprovado' } as any) // Cast para evitar erro de tipo
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias-ponto'] });
      smartToast.success('Ocorrência aprovada com sucesso');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao aprovar ocorrência', error.message);
    },
  });

  const rejeitarMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo?: string }) => {
      const { data, error } = await supabase
        .from('ocorrencias_ponto')
        .update({ status: 'rejeitado', observacao: motivo || 'Rejeitado' } as any) // Cast para evitar erro de tipo
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias-ponto'] });
      smartToast.success('Ocorrência rejeitada');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao rejeitar ocorrência', error.message);
    },
  });

  const deletarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ocorrencias_ponto')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias-ponto'] });
      smartToast.success('Ocorrência excluída com sucesso');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao excluir ocorrência', error.message);
    },
  });

  return {
    ocorrencias,
    isLoading,
    criar: criarMutation.mutate,
    atualizar: atualizarMutation.mutate,
    aprovar: aprovarMutation.mutate,
    rejeitar: rejeitarMutation.mutate,
    deletar: deletarMutation.mutate,
    isCriando: criarMutation.isPending,
    isAtualizando: atualizarMutation.isPending,
    isAprovando: aprovarMutation.isPending,
    isRejeitando: rejeitarMutation.isPending,
    isDeletando: deletarMutation.isPending,
  };
}
