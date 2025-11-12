import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

export interface TransacaoFinanceira {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria_id?: string;
  descricao?: string;
  titulo?: string;
  valor: number;
  data_pagamento?: string;
  data_vencimento: string;
  status: string;
  cliente_id?: string;
  projeto_id?: string;
  centro_custo_id?: string;
  forma_pagamento?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  categorias_financeiras?: {
    id: string;
    nome: string;
    tipo: string;
    cor: string;
  };
  clientes?: {
    id: string;
    nome: string;
  };
  projetos?: {
    id: string;
    titulo: string;
  };
}

export interface TransacaoInput {
  tipo: 'receita' | 'despesa';
  titulo: string;
  categoria_id?: string;
  descricao?: string;
  valor: number;
  data_pagamento?: string;
  data_vencimento: string;
  status: string;
  cliente_id?: string;
  projeto_id?: string;
  centro_custo_id?: string;
  forma_pagamento?: string;
  observacoes?: string;
}

const QUERY_KEY = 'transacoes_financeiras';

// ============================================================================
// FETCH TRANSAÇÕES COM FILTROS
// ============================================================================
interface FetchTransacoesParams {
  tipo?: 'receita' | 'despesa';
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  clienteId?: string;
  projetoId?: string;
}

export function useTransacoes(params: FetchTransacoesParams = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      let query = supabase
        .from('transacoes_financeiras')
        .select(`
          *,
          categorias_financeiras:categoria_id (
            id,
            nome,
            tipo,
            cor
          ),
          clientes:cliente_id (
            id,
            nome
          ),
          projetos:projeto_id (
            id,
            titulo
          ),
          centros_custo:centro_custo_id (
            id,
            nome,
            codigo
          )
        `)
        .order('data_vencimento', { ascending: false });

      // Aplicar filtros
      if (params.tipo) {
        query = query.eq('tipo', params.tipo);
      }
      if (params.status) {
        query = query.eq('status', params.status);
      }
      if (params.dataInicio) {
        query = query.gte('data_vencimento', params.dataInicio);
      }
      if (params.dataFim) {
        query = query.lte('data_vencimento', params.dataFim);
      }
      if (params.clienteId) {
        query = query.eq('cliente_id', params.clienteId);
      }
      if (params.projetoId) {
        query = query.eq('projeto_id', params.projetoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TransacaoFinanceira[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

// ============================================================================
// CRIAR TRANSAÇÃO
// ============================================================================
export function useCreateTransacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transacao: TransacaoInput) => {
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .insert([transacao])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['financial-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['receitas-despesas-mensal'] });
      toast.success('Transação criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar transação:', error);
      toast.error('Erro ao criar transação');
    },
  });
}

// ============================================================================
// ATUALIZAR TRANSAÇÃO
// ============================================================================
export function useUpdateTransacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TransacaoInput> }) => {
      const { data: updated, error } = await supabase
        .from('transacoes_financeiras')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['financial-kpis'] });
      toast.success('Transação atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar transação:', error);
      toast.error('Erro ao atualizar transação');
    },
  });
}

// ============================================================================
// DELETAR TRANSAÇÃO
// ============================================================================
export function useDeleteTransacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transacoes_financeiras')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['financial-kpis'] });
      toast.success('Transação removida com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao deletar transação:', error);
      toast.error('Erro ao deletar transação');
    },
  });
}

// ============================================================================
// ESTATÍSTICAS FINANCEIRAS
// ============================================================================
export function useFinancialStats(periodo: 'mes' | 'trimestre' | 'ano' = 'mes') {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats', periodo],
    queryFn: async () => {
      const hoje = new Date();
      let dataInicio: Date;

      switch (periodo) {
        case 'trimestre':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
          break;
        case 'ano':
          dataInicio = new Date(hoje.getFullYear(), 0, 1);
          break;
        default:
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      }

      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .select('tipo, valor, status')
        .gte('data_vencimento', dataInicio.toISOString().split('T')[0]);

      if (error) throw error;

      const totalReceitas = data
        .filter(t => t.tipo === 'receita' && t.status === 'pago')
        .reduce((sum, t) => sum + Number(t.valor), 0);
      
      const totalDespesas = data
        .filter(t => t.tipo === 'despesa' && t.status === 'pago')
        .reduce((sum, t) => sum + Number(t.valor), 0);

      const saldo = totalReceitas - totalDespesas;

      const stats = {
        totalReceitas,
        totalDespesas,
        saldo,
        receitasPendentes: data
          .filter(t => t.tipo === 'receita' && t.status === 'pendente')
          .reduce((sum, t) => sum + Number(t.valor), 0),
        despesasPendentes: data
          .filter(t => t.tipo === 'despesa' && t.status === 'pendente')
          .reduce((sum, t) => sum + Number(t.valor), 0),
        atrasados: data.filter(t => t.status === 'atrasado').length,
        margemLucro: totalReceitas > 0 
          ? Number(((saldo / totalReceitas) * 100).toFixed(2))
          : 0,
      };

      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
}

// ============================================================================
// FLUXO DE CAIXA (Projeção)
// ============================================================================
export function useFluxoCaixa(diasFuturos: number = 30) {
  return useQuery({
    queryKey: [QUERY_KEY, 'fluxo-caixa', diasFuturos],
    queryFn: async () => {
      const hoje = new Date();
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + diasFuturos);

      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .select('tipo, valor, data_vencimento, status')
        .gte('data_vencimento', hoje.toISOString().split('T')[0])
        .lte('data_vencimento', dataFim.toISOString().split('T')[0])
        .in('status', ['pendente', 'pago']);

      if (error) throw error;

      // Agrupar por data
      const fluxoPorDia = data.reduce((acc: any, t) => {
        const dataKey = t.data_vencimento;
        if (!acc[dataKey]) {
          acc[dataKey] = { data: dataKey, receitas: 0, despesas: 0, saldo: 0 };
        }

        if (t.tipo === 'receita') {
          acc[dataKey].receitas += Number(t.valor);
        } else {
          acc[dataKey].despesas += Number(t.valor);
        }

        acc[dataKey].saldo = acc[dataKey].receitas - acc[dataKey].despesas;
        return acc;
      }, {});

      return Object.values(fluxoPorDia).sort((a: any, b: any) => 
        a.data.localeCompare(b.data)
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
