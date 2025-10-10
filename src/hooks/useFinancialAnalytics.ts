import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export interface FinancialFilters {
  startDate: Date;
  endDate: Date;
  type?: "receita" | "despesa" | "all";
  clienteId?: string;
  projetoId?: string;
  categoriaId?: string;
}

export interface KPIData {
  receitaTotal: number;
  receitaVariacao: number;
  despesaTotal: number;
  despesaVariacao: number;
  lucroLiquido: number;
  lucroVariacao: number;
  margemLucro: number;
  inadimplencia: number;
  saldoCaixa: number;
}

export interface ReceitaDespesaMensal {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface ComposicaoCategoria {
  categoria: string;
  valor: number;
  percentual: number;
  ticketMedio?: number;
}

export interface ReceitaCliente {
  clienteNome: string;
  valor: number;
  numeroTransacoes: number;
}

export interface CustoSetor {
  setor: string;
  valorAtual: number;
  valorAnterior: number;
  variacao: number;
}

export function useFinancialAnalytics(filters: FinancialFilters) {
  // KPIs principais
  const { data: kpis, isLoading: loadingKPIs } = useQuery({
    queryKey: ["financial-kpis", filters],
    queryFn: async () => {
      const currentStart = filters.startDate.toISOString();
      const currentEnd = filters.endDate.toISOString();
      
      const previousStart = subMonths(filters.startDate, 1).toISOString();
      const previousEnd = subMonths(filters.endDate, 1).toISOString();

      // Receitas e despesas do período atual
      let currentQuery = supabase
        .from("transacoes_financeiras")
        .select("tipo, valor, status")
        .gte("data_vencimento", currentStart)
        .lte("data_vencimento", currentEnd);

      if (filters.clienteId) currentQuery = currentQuery.eq("cliente_id", filters.clienteId);
      if (filters.categoriaId) currentQuery = currentQuery.eq("categoria_id", filters.categoriaId);

      const { data: currentTransactions } = await currentQuery;

      // Período anterior
      let previousQuery = supabase
        .from("transacoes_financeiras")
        .select("tipo, valor")
        .gte("data_vencimento", previousStart)
        .lte("data_vencimento", previousEnd);

      if (filters.clienteId) previousQuery = previousQuery.eq("cliente_id", filters.clienteId);

      const { data: previousTransactions } = await previousQuery;

      const currentReceitas = currentTransactions?.filter(t => t.tipo === "receita").reduce((acc, t) => acc + Number(t.valor), 0) || 0;
      const currentDespesas = currentTransactions?.filter(t => t.tipo === "despesa").reduce((acc, t) => acc + Number(t.valor), 0) || 0;
      
      const previousReceitas = previousTransactions?.filter(t => t.tipo === "receita").reduce((acc, t) => acc + Number(t.valor), 0) || 0;
      const previousDespesas = previousTransactions?.filter(t => t.tipo === "despesa").reduce((acc, t) => acc + Number(t.valor), 0) || 0;

      const receitaVariacao = previousReceitas > 0 ? ((currentReceitas - previousReceitas) / previousReceitas) * 100 : 0;
      const despesaVariacao = previousDespesas > 0 ? ((currentDespesas - previousDespesas) / previousDespesas) * 100 : 0;
      
      const lucroLiquido = currentReceitas - currentDespesas;
      const previousLucro = previousReceitas - previousDespesas;
      const lucroVariacao = previousLucro > 0 ? ((lucroLiquido - previousLucro) / previousLucro) * 100 : 0;

      const margemLucro = currentReceitas > 0 ? (lucroLiquido / currentReceitas) * 100 : 0;

      // Inadimplência
      const atrasadas = currentTransactions?.filter(t => 
        t.tipo === "receita" && t.status === "atrasado"
      ).reduce((acc, t) => acc + Number(t.valor), 0) || 0;
      
      const inadimplencia = currentReceitas > 0 ? (atrasadas / currentReceitas) * 100 : 0;

      const kpiData: KPIData = {
        receitaTotal: currentReceitas,
        receitaVariacao,
        despesaTotal: currentDespesas,
        despesaVariacao,
        lucroLiquido,
        lucroVariacao,
        margemLucro,
        inadimplencia,
        saldoCaixa: lucroLiquido,
      };

      return kpiData;
    },
    refetchInterval: 300000, // 5 minutos
  });

  // Receitas x Despesas por mês
  const { data: receitasDespesas, isLoading: loadingReceitasDespesas } = useQuery({
    queryKey: ["receitas-despesas-mensal", filters],
    queryFn: async () => {
      const { data } = await supabase
        .from("transacoes_financeiras")
        .select("tipo, valor, data_vencimento")
        .gte("data_vencimento", filters.startDate.toISOString())
        .lte("data_vencimento", filters.endDate.toISOString());

      const grouped = data?.reduce((acc, t) => {
        const mes = format(new Date(t.data_vencimento), "MMM/yy");
        if (!acc[mes]) {
          acc[mes] = { mes, receitas: 0, despesas: 0, saldo: 0 };
        }
        if (t.tipo === "receita") {
          acc[mes].receitas += Number(t.valor);
        } else {
          acc[mes].despesas += Number(t.valor);
        }
        acc[mes].saldo = acc[mes].receitas - acc[mes].despesas;
        return acc;
      }, {} as Record<string, ReceitaDespesaMensal>);

      return Object.values(grouped || {});
    },
    refetchInterval: 600000, // 10 minutos
  });

  // Composição de receitas por categoria
  const { data: composicaoReceitas, isLoading: loadingComposicaoReceitas } = useQuery({
    queryKey: ["composicao-receitas", filters],
    queryFn: async () => {
      const { data } = await supabase
        .from("transacoes_financeiras")
        .select("valor, categoria_id, categorias_financeiras(nome)")
        .eq("tipo", "receita")
        .gte("data_vencimento", filters.startDate.toISOString())
        .lte("data_vencimento", filters.endDate.toISOString());

      const total = data?.reduce((acc, t) => acc + Number(t.valor), 0) || 0;

      const grouped = data?.reduce((acc, t) => {
        const categoria = (t.categorias_financeiras as any)?.nome || "Sem Categoria";
        if (!acc[categoria]) {
          acc[categoria] = { categoria, valor: 0, percentual: 0, count: 0 };
        }
        acc[categoria].valor += Number(t.valor);
        acc[categoria].count += 1;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped || {}).map((item: any) => ({
        categoria: item.categoria,
        valor: item.valor,
        percentual: total > 0 ? (item.valor / total) * 100 : 0,
        ticketMedio: item.count > 0 ? item.valor / item.count : 0,
      })) as ComposicaoCategoria[];
    },
    refetchInterval: 600000,
  });

  // Composição de despesas
  const { data: composicaoDespesas, isLoading: loadingComposicaoDespesas } = useQuery({
    queryKey: ["composicao-despesas", filters],
    queryFn: async () => {
      const { data } = await supabase
        .from("transacoes_financeiras")
        .select("valor, categoria_id, categorias_financeiras(nome)")
        .eq("tipo", "despesa")
        .gte("data_vencimento", filters.startDate.toISOString())
        .lte("data_vencimento", filters.endDate.toISOString());

      const total = data?.reduce((acc, t) => acc + Number(t.valor), 0) || 0;

      const grouped = data?.reduce((acc, t) => {
        const categoria = (t.categorias_financeiras as any)?.nome || "Sem Categoria";
        if (!acc[categoria]) {
          acc[categoria] = { categoria, valor: 0, percentual: 0 };
        }
        acc[categoria].valor += Number(t.valor);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped || {}).map((item: any) => ({
        categoria: item.categoria,
        valor: item.valor,
        percentual: total > 0 ? (item.valor / total) * 100 : 0,
      })) as ComposicaoCategoria[];
    },
    refetchInterval: 600000,
  });

  // Receita por cliente
  const { data: receitaPorCliente, isLoading: loadingReceitaCliente } = useQuery({
    queryKey: ["receita-cliente", filters],
    queryFn: async () => {
      const { data } = await supabase
        .from("transacoes_financeiras")
        .select("valor, cliente_id, clientes(nome)")
        .eq("tipo", "receita")
        .gte("data_vencimento", filters.startDate.toISOString())
        .lte("data_vencimento", filters.endDate.toISOString());

      const grouped = data?.reduce((acc, t) => {
        const clienteNome = (t.clientes as any)?.nome || "Sem Cliente";
        if (!acc[clienteNome]) {
          acc[clienteNome] = { clienteNome, valor: 0, numeroTransacoes: 0 };
        }
        acc[clienteNome].valor += Number(t.valor);
        acc[clienteNome].numeroTransacoes += 1;
        return acc;
      }, {} as Record<string, ReceitaCliente>);

      return Object.values(grouped || {})
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);
    },
    refetchInterval: 600000,
  });

  return {
    kpis,
    loadingKPIs,
    receitasDespesas,
    loadingReceitasDespesas,
    composicaoReceitas,
    loadingComposicaoReceitas,
    composicaoDespesas,
    loadingComposicaoDespesas,
    receitaPorCliente,
    loadingReceitaCliente,
  };
}
