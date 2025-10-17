import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { MODULE_QUERY_CONFIG } from "@/lib/queryConfig";

export interface Transaction {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: "receita" | "despesa";
  valor: number;
  status: "pendente" | "pago" | "atrasado" | "cancelado";
  data_vencimento: string;
  data_pagamento: string | null;
  cliente_id: string | null;
  categoria_id: string | null;
  created_at: string;
}

export function useClientFinances(clienteId: string) {
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["client-finances", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transacoes_financeiras")
        .select("*", { count: 'exact' })
        .eq("cliente_id", clienteId)
        .order("data_vencimento", { ascending: false })
        .range(0, 49);

      if (error) throw error;
      return (data || []) as Transaction[];
    },
    enabled: !!clienteId,
    ...MODULE_QUERY_CONFIG.lancamentos
  });

  const receitas = (transactions || []).filter((t) => t.tipo === "receita");
  const despesas = (transactions || []).filter((t) => t.tipo === "despesa");

  const registerPaymentMutation = useMutation({
    mutationFn: async ({ id, data_pagamento }: { id: string; data_pagamento: string }) => {
      const { error } = await supabase
        .from("transacoes_financeiras")
        .update({ 
          status: "pago",
          data_pagamento,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Pagamento registrado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["client-finances", clienteId] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao registrar pagamento", error.message);
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: Partial<Transaction>) => {
      const { error } = await supabase
        .from("transacoes_financeiras")
        .insert([{ ...transaction, cliente_id: clienteId }] as any);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Transação criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["client-finances", clienteId] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao criar transação", error.message);
    },
  });

  // Cálculos de resumo
  const totalReceitas = receitas.reduce((acc, t) => acc + Number(t.valor), 0);
  const totalDespesas = despesas.reduce((acc, t) => acc + Number(t.valor), 0);
  const saldo = totalReceitas - totalDespesas;
  const pendente = (transactions || [])
    .filter((t) => t.status === "pendente")
    .reduce((acc, t) => acc + Number(t.valor), 0);

  return {
    transactions,
    receitas,
    despesas,
    loading: isLoading,
    registerPayment: registerPaymentMutation.mutate,
    createTransaction: createTransactionMutation.mutate,
    summary: {
      totalReceitas,
      totalDespesas,
      saldo,
      pendente,
    },
  };
}
