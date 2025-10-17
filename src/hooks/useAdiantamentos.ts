import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

export interface Adiantamento {
  id: string;
  folha_item_id?: string;
  colaborador_id?: string; // DEPRECATED: Use pessoa_id
  pessoa_id?: string; // Novo campo unificado
  competencia: string;
  valor: number;
  data_adiantamento: string;
  forma_pagamento: 'pix' | 'ted' | 'dinheiro' | 'deposito';
  chave_pix?: string;
  banco_conta?: string;
  comprovante_url?: string;
  observacao?: string;
  status: 'registrado' | 'abatido' | 'cancelado' | 'descontado';
  criado_por?: string;
  created_at?: string;
}

/**
 * Hook para gerenciar adiantamentos
 * @param pessoaId - ID da pessoa (estrutura unificada) - PREFERENCIAL
 * @param competencia - Mês/ano no formato YYYY-MM
 * @param colaboradorId - DEPRECATED: Use pessoaId (mantido por retrocompat 30 dias)
 */
export function useAdiantamentos(
  pessoaId?: string, 
  competencia?: string, 
  colaboradorId?: string
) {
  const queryClient = useQueryClient();

  // Priorizar pessoa_id, fallback para colaborador_id
  const id = pessoaId || colaboradorId;
  
  // Removido console.warn de produção - migrar para logger quando necessário

  const { data: adiantamentos = [], isLoading } = useQuery({
    queryKey: ['adiantamentos', id, competencia],
    queryFn: async () => {
      let query = supabase
        .from('financeiro_adiantamentos')
        .select('*', { count: 'exact' })
        .order('data_adiantamento', { ascending: false })
        .range(0, 49); // Paginação: primeiros 50 registros
      
      if (id) {
        // Buscar por pessoa_id primeiro, depois colaborador_id (retrocompat)
        query = query.or(`pessoa_id.eq.${id},colaborador_id.eq.${id}`);
      }
      if (competencia) query = query.eq('competencia', competencia);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Adiantamento[];
    },
    enabled: !!id || !!competencia,
    staleTime: 1 * 60 * 1000, // 1 minuto (dados dinâmicos)
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  const criarMutation = useMutation({
    mutationFn: async (dados: Omit<Adiantamento, 'id' | 'created_at' | 'status'>) => {
      // Priorizar pessoa_id, fallback para colaborador_id
      const idParaValidar = dados.pessoa_id || dados.colaborador_id;
      
      if (!idParaValidar) {
        throw new Error('pessoa_id ou colaborador_id deve ser fornecido');
      }

      // Validar limite antes de criar
      const { data: validacao } = await supabase.rpc('fn_validar_limite_adiantamento', {
        p_colaborador_id: idParaValidar,
        p_competencia: dados.competencia,
        p_novo_valor: dados.valor,
      });

      if (!validacao) {
        throw new Error('Valor excede o limite permitido (salário base do mês)');
      }

      const { data, error } = await supabase
        .from('financeiro_adiantamentos')
        .insert([{ 
          ...dados,
          pessoa_id: dados.pessoa_id || idParaValidar, // Sempre preencher pessoa_id
          colaborador_id: dados.colaborador_id || idParaValidar, // Manter retrocompat
          criado_por: (await supabase.auth.getUser()).data.user?.id 
        } as any])
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
