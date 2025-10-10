import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

export interface Adiantamento {
  id: string;
  folha_item_id?: string;
  colaborador_id: string;
  competencia: string;
  valor: number;
  data_adiantamento: string;
  forma_pagamento: 'pix' | 'ted' | 'dinheiro' | 'deposito';
  chave_pix?: string;
  banco_conta?: string;
  comprovante_url?: string;
  observacao?: string;
  status: 'registrado' | 'abatido' | 'cancelado';
  criado_por?: string;
  created_at?: string;
}

export function useAdiantamentos(colaboradorId?: string, competencia?: string) {
  const queryClient = useQueryClient();

  const { data: adiantamentos = [], isLoading } = useQuery({
    queryKey: ['adiantamentos', colaboradorId, competencia],
    queryFn: async () => {
      let query = supabase.from('financeiro_adiantamentos').select('*').order('data_adiantamento', { ascending: false });
      
      if (colaboradorId) query = query.eq('colaborador_id', colaboradorId);
      if (competencia) query = query.eq('competencia', competencia);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Adiantamento[];
    },
    enabled: !!colaboradorId || !!competencia,
  });

  const criarMutation = useMutation({
    mutationFn: async (dados: Omit<Adiantamento, 'id' | 'created_at' | 'status'>) => {
      // Validar limite antes de criar
      const { data: validacao } = await supabase.rpc('fn_validar_limite_adiantamento', {
        p_colaborador_id: dados.colaborador_id,
        p_competencia: dados.competencia,
        p_novo_valor: dados.valor,
      });

      if (!validacao) {
        throw new Error('Valor excede o limite permitido (salário base do mês)');
      }

      const { data, error } = await supabase
        .from('financeiro_adiantamentos')
        .insert([{ ...dados, criado_por: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adiantamentos'] });
      smartToast.success('Adiantamento registrado com sucesso');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao registrar adiantamento', error.message);
    },
  });

  const cancelarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financeiro_adiantamentos')
        .update({ status: 'cancelado' })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adiantamentos'] });
      smartToast.success('Adiantamento cancelado');
    },
    onError: (error: any) => {
      smartToast.error('Erro ao cancelar adiantamento', error.message);
    },
  });

  return {
    adiantamentos,
    isLoading,
    criar: criarMutation.mutate,
    cancelar: cancelarMutation.mutate,
    isCriando: criarMutation.isPending,
    isCancelando: cancelarMutation.isPending,
  };
}
