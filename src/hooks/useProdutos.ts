import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface Produto {
  id: string;
  sku: string;
  nome: string;
  categoria: string | null;
  tipo: "servico" | "produto";
  unidade: string;
  preco_padrao: number;
  custo: number | null;
  imposto_percent: number;
  descricao: string | null;
  observacoes: string | null;
  lead_time_dias: number | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProdutoComponente {
  id: string;
  produto_pai_id: string;
  produto_filho_id: string;
  quantidade: number;
}

export function useProdutos() {
  const queryClient = useQueryClient();

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data as Produto[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (produto: Partial<Produto>) => {
      const { data, error } = await supabase
        .from("produtos")
        .insert([produto] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Produto criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao criar produto", error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...produto }: Partial<Produto> & { id: string }) => {
      const { error } = await supabase
        .from("produtos")
        .update(produto)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Produto atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar produto", error.message);
    },
  });

  const inativarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("produtos")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Produto inativado");
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao inativar produto", error.message);
    },
  });

  const buscarPorSKU = async (sku: string) => {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("sku", sku)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  };

  const buscarPorNome = async (nome: string) => {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .ilike("nome", `%${nome}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  };

  return {
    produtos,
    loading: isLoading,
    createProduto: createMutation.mutate,
    updateProduto: updateMutation.mutate,
    inativarProduto: inativarMutation.mutate,
    buscarPorSKU,
    buscarPorNome,
  };
}
