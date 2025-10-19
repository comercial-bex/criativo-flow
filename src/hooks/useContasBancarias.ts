import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface ContaBancaria {
  id: string;
  nome: string;
  tipo: 'caixa' | 'conta_corrente' | 'poupanca' | 'investimento';
  banco?: string;
  agencia?: string;
  conta?: string;
  saldo_inicial: number;
  saldo_atual: number;
  ativo: boolean;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export function useContasBancarias() {
  const queryClient = useQueryClient();

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ["contas-bancarias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_bancarias")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data as ContaBancaria[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (conta: Omit<ContaBancaria, "id" | "created_at" | "updated_at" | "saldo_atual">) => {
      const { data, error } = await supabase
        .from("contas_bancarias")
        .insert([{ ...conta, saldo_atual: conta.saldo_inicial }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Conta bancária cadastrada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao cadastrar conta", error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...conta }: Partial<ContaBancaria> & { id: string }) => {
      const { data, error } = await supabase
        .from("contas_bancarias")
        .update(conta)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Conta atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar conta", error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contas_bancarias")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Conta excluída com sucesso");
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao excluir conta", error.message);
    },
  });

  return {
    contas,
    isLoading,
    createConta: createMutation.mutate,
    updateConta: updateMutation.mutate,
    deleteConta: deleteMutation.mutate,
  };
}
