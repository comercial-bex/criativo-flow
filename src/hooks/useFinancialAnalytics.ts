import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export interface FinancialFilters {
  startDate: Date;
  endDate: Date;
  type?: "receita" | "despesa" | "all";
  tipo?: "receita" | "despesa"; // Alias para compatibilidade
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
      const { data: transacoes, error } = await supabase
        .from("transacoes_financeiras")
        .select("*")
        .gte("data_vencimento", filters.startDate)
        .lte("data_vencimento", filters.endDate);

      if (error) throw error;

      // Filtros adicionais
      const filteredData = (transacoes || []).filter((t) => {
        if (filters.tipo && t.tipo !== filters.tipo) return false;
        if (filters.clienteId && t.cliente_id !== filters.clienteId) return false;
        if (filters.categoriaId && t.categoria_id !== filters.categoriaId) return false;
        return true;
      });

      // Cálculos de KPIs
      const totalReceitas = filteredData
        .filter((t) => t.tipo === "receita")
        .reduce((acc, t) => acc + Number(t.valor), 0);

      const totalDespesas = filteredData
        .filter((t) => t.tipo === "despesa")
        .reduce((acc, t) => acc + Number(t.valor), 0);

      const lucro = totalReceitas - totalDespesas;

      // Calcular variação de lucro (comparar com período anterior)
      const periodoAnterior = new Date(filters.startDate);
      const diasPeriodo = Math.ceil(
        (new Date(filters.endDate).getTime() - new Date(filters.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      periodoAnterior.setDate(periodoAnterior.getDate() - diasPeriodo);
      const startDateAnterior = periodoAnterior.toISOString().split("T")[0];

      const { data: transacoesAnteriores } = await supabase
        .from("transacoes_financeiras")
        .select("tipo, valor")
        .gte("data_vencimento", startDateAnterior)
        .lt("data_vencimento", filters.startDate);

      const receitasAnteriores = (transacoesAnteriores || [])
        .filter((t) => t.tipo === "receita")
        .reduce((acc, t) => acc + Number(t.valor), 0);

      const despesasAnteriores = (transacoesAnteriores || [])
        .filter((t) => t.tipo === "despesa")
        .reduce((acc, t) => acc + Number(t.valor), 0);

      const lucroAnterior = receitasAnteriores - despesasAnteriores;
      const variacaoLucro = lucroAnterior !== 0 
        ? ((lucro - lucroAnterior) / lucroAnterior) * 100 
        : 0;

      const margemLucro = totalReceitas !== 0 
        ? (lucro / totalReceitas) * 100 
        : 0;

      const inadimplencia = filteredData
        .filter((t) => t.status === "pendente" && new Date(t.data_vencimento) < new Date())
        .reduce((acc, t) => acc + Number(t.valor), 0);

      const variacaoReceita = receitasAnteriores !== 0 
        ? ((totalReceitas - receitasAnteriores) / receitasAnteriores) * 100 
        : 0;

      const variacaoDespesa = despesasAnteriores !== 0 
        ? ((totalDespesas - despesasAnteriores) / despesasAnteriores) * 100 
        : 0;

      const kpisData: KPIData = {
        receitaTotal: totalReceitas,
        receitaVariacao: variacaoReceita,
        despesaTotal: totalDespesas,
        despesaVariacao: variacaoDespesa,
        lucroLiquido: lucro,
        lucroVariacao: variacaoLucro,
        margemLucro,
        inadimplencia,
        saldoCaixa: lucro, // Simplificado - pode ser melhorado depois
      };

      return kpisData;
    },
    staleTime: 3 * 60 * 1000, // 3 min - KPIs financeiros mudam pouco
    gcTime: 10 * 60 * 1000, // 10 min - manter em cache
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
    staleTime: 5 * 60 * 1000, // 5 min - dados agregados mensais
    gcTime: 15 * 60 * 1000, // 15 min
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
    staleTime: 5 * 60 * 1000, // 5 min - composição de categorias
    gcTime: 15 * 60 * 1000, // 15 min
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
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 15 * 60 * 1000, // 15 min
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
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 15 * 60 * 1000, // 15 min
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
