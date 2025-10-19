import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface Divida {
  id: string;
  tipo: string;
  fornecedor_id: string | null;
  cliente_id: string | null;
  centro_custo_id: string | null;
  descricao: string;
  credor_devedor: string;
  valor_total: number;
  valor_pago: number;
  valor_restante: number;
  numero_parcelas: number;
  parcelas: any;
  data_emissao: string;
  proximo_vencimento: string | null;
  status: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export function useDividas(filters?: {
  tipo?: 'pagar' | 'receber';
  status?: string;
  fornecedor_id?: string;
  cliente_id?: string;
}) {
  return useQuery({
    queryKey: ['dividas', filters],
    queryFn: async () => {
      let query = supabase
        .from('dividas')
        .select('*')
        .order('data_primeiro_vencimento', { ascending: true });

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.fornecedor_id) {
        query = query.eq('fornecedor_id', filters.fornecedor_id);
      }
      if (filters?.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Divida[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCriarDivida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (divida: Partial<Divida>) => {
      const { error } = await supabase
        .from('dividas')
        .insert([divida as any]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Dívida cadastrada com sucesso");
      queryClient.invalidateQueries({ queryKey: ['dividas'] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao cadastrar dívida", error.message);
    },
  });
}

export function useAtualizarDivida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dados }: Partial<Divida> & { id: string }) => {
      const { error } = await supabase
        .from('dividas')
        .update(dados)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Dívida atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ['dividas'] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar dívida", error.message);
    },
  });
}

export function useRegistrarPagamentoParcela() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      divida_id: string;
      parcela_numero: number;
      valor_pago: number;
      data_pagamento: string;
    }) => {
      // Buscar dívida atual
      const { data: divida, error: fetchError } = await supabase
        .from('dividas')
        .select('*')
        .eq('id', params.divida_id)
        .single();
      
      if (fetchError) throw fetchError;

      // Atualizar parcela no JSONB
      const parcelas = Array.isArray(divida.parcelas) ? divida.parcelas : [];
      const parcelaIndex = parcelas.findIndex((p: any) => p.numero === params.parcela_numero);
      
      if (parcelaIndex !== -1) {
        const parcela = parcelas[parcelaIndex] as any;
        parcela.valor_pago = params.valor_pago;
        parcela.data_pagamento = params.data_pagamento;
        parcela.status = params.valor_pago >= (parcela.valor || 0) ? 'pago' : 'parcial';
      }

      // Calcular novo valor_pago total
      const novoValorPago = Array.isArray(parcelas) 
        ? parcelas.reduce((acc: number, p: any) => acc + (p.valor_pago || 0), 0)
        : 0;
      
      // Atualizar dívida
      const { error } = await supabase
        .from('dividas')
        .update({
          parcelas,
          valor_pago: novoValorPago,
          status: novoValorPago >= divida.valor_total ? 'quitada' : 'ativa',
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.divida_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Pagamento registrado");
      queryClient.invalidateQueries({ queryKey: ['dividas'] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao registrar pagamento", error.message);
    },
  });
}
