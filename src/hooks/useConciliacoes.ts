import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface ConciliacaoItem {
  id: string;
  conciliacao_id: string;
  data_movimento: string;
  descricao: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  conciliado: boolean;
  lancamento_id: string | null;
  observacoes: string | null;
}

export interface Conciliacao {
  id: string;
  conta_bancaria_id: string;
  mes_referencia: string;
  saldo_inicial: number;
  saldo_final_extrato: number;
  saldo_final_sistema: number;
  diferenca: number;
  status: string;
  conciliado_por: string | null;
  conciliado_em: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  itens?: ConciliacaoItem[];
}

export function useConciliacoes(contaBancariaId?: string, mesReferencia?: string) {
  return useQuery({
    queryKey: ['conciliacoes', contaBancariaId, mesReferencia],
    queryFn: async () => {
      let query = supabase
        .from('conciliacoes_bancarias')
        .select('*')
        .order('mes_referencia', { ascending: false });

      if (contaBancariaId) {
        query = query.eq('conta_bancaria_id', contaBancariaId);
      }
      if (mesReferencia) {
        query = query.eq('mes_referencia', mesReferencia);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Conciliacao[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useConciliacaoItens(conciliacaoId: string) {
  return useQuery({
    queryKey: ['conciliacao-itens', conciliacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conciliacoes_itens')
        .select('*')
        .eq('conciliacao_id', conciliacaoId)
        .order('data_movimento', { ascending: false });
      
      if (error) throw error;
      return data as ConciliacaoItem[];
    },
    enabled: !!conciliacaoId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCriarConciliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conciliacao: Partial<Conciliacao>) => {
      const { error } = await supabase
        .from('conciliacoes_bancarias')
        .insert([conciliacao as any]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Conciliação criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ['conciliacoes'] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao criar conciliação", error.message);
    },
  });
}

export function useAtualizarConciliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dados }: Partial<Conciliacao> & { id: string }) => {
      const { error } = await supabase
        .from('conciliacoes_bancarias')
        .update(dados)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Conciliação atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ['conciliacoes'] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar conciliação", error.message);
    },
  });
}

export function useConciliarItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, conciliado }: { id: string; conciliado: boolean }) => {
      const { error } = await supabase
        .from('conciliacoes_itens')
        .update({ conciliado })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Item atualizado");
      queryClient.invalidateQueries({ queryKey: ['conciliacao-itens'] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar item", error.message);
    },
  });
}
