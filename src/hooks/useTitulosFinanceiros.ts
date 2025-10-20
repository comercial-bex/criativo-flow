import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface TituloFinanceiro {
  id: string;
  tipo: 'pagar' | 'receber';
  tipo_documento: string;
  numero_documento: string | null;
  cliente_id: string | null;
  fornecedor_id: string | null;
  projeto_id: string | null;
  contrato_id: string | null;
  valor_original: number;
  valor_pago: number;
  valor_desconto: number;
  valor_juros: number;
  valor_multa: number;
  valor_liquido: number;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento: string | null;
  data_competencia: string;
  status: 'pendente' | 'vencido' | 'pago' | 'cancelado' | 'renegociado';
  dias_atraso: number;
  forma_pagamento: string | null;
  comprovante_url: string | null;
  descricao: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  // Relações
  fornecedores?: { razao_social: string } | null;
  clientes?: { nome: string } | null;
  contratos?: { titulo: string } | null;
  projetos?: { titulo: string } | null;
}

export interface TituloFilters {
  tipo?: 'pagar' | 'receber';
  status?: string;
  fornecedor_id?: string;
  cliente_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

export function useTitulosFinanceiros(filters?: TituloFilters) {
  return useQuery({
    queryKey: ['titulos-financeiros', filters],
    queryFn: async () => {
      let query = supabase
        .from('titulos_financeiros')
        .select(`
          *,
          fornecedores (razao_social),
          clientes (nome),
          contratos (titulo),
          projetos (titulo)
        `)
        .order('data_vencimento', { ascending: true });

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status as any);
      }
      if (filters?.fornecedor_id) {
        query = query.eq('fornecedor_id', filters.fornecedor_id);
      }
      if (filters?.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id);
      }
      if (filters?.data_inicio) {
        query = query.gte('data_vencimento', filters.data_inicio);
      }
      if (filters?.data_fim) {
        query = query.lte('data_vencimento', filters.data_fim);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as TituloFinanceiro[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useRegistrarPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      titulo_id: string;
      data_pagamento: string;
      valor_pago: number;
      forma_pagamento?: string;
      comprovante_url?: string;
      observacoes?: string;
    }) => {
      const { error } = await supabase
        .from('titulos_financeiros')
        .update({
          status: 'pago',
          data_pagamento: params.data_pagamento,
          valor_pago: params.valor_pago,
          forma_pagamento: params.forma_pagamento,
          comprovante_url: params.comprovante_url,
          observacoes: params.observacoes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.titulo_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Pagamento registrado com sucesso");
      queryClient.invalidateQueries({ queryKey: ['titulos-financeiros'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-vencimentos'] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao registrar pagamento", error.message);
    },
  });
}

export function useCriarTitulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (titulo: Partial<TituloFinanceiro>) => {
      const { error } = await supabase
        .from('titulos_financeiros')
        .insert([titulo as any]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Título criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ['titulos-financeiros'] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao criar título", error.message);
    },
  });
}

export function useDashboardVencimentos() {
  return useQuery({
    queryKey: ['dashboard-vencimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_dashboard_vencimentos')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
