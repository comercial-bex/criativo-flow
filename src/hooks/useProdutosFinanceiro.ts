import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { Produto } from "./useProdutos";

export interface ProdutoFinanceiroVinculo {
  id: string;
  cliente_id: string;
  produto_id: string;
  produto_nome: string;
  valor_unitario: number;
  categoria: string | null;
  descricao_curta: string | null;
  origem: string;
  created_at: string;
  used_at: string | null;
  used_in_document_type: string | null;
  used_in_document_id: string | null;
}

export function useProdutosFinanceiro() {
  const queryClient = useQueryClient();

  // Buscar produtos ativos para autocomplete
  const { data: produtosDisponiveis = [], isLoading: loadingProdutos } = useQuery({
    queryKey: ["produtos-financeiro-disponiveis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      return data as Produto[];
    },
  });

  // Buscar vínculos temporários para um cliente
  const fetchTempDataByCliente = async (clienteId: string) => {
    const { data, error } = await supabase
      .from("admin_temp_data")
      .select("*")
      .eq("cliente_id", clienteId)
      .is("used_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ProdutoFinanceiroVinculo[];
  };

  // Criar vínculo temporário (quando salva transação com produto)
  const createTempDataMutation = useMutation({
    mutationFn: async (data: {
      cliente_id: string;
      produto_id: string;
      produto_nome: string;
      valor_unitario: number;
      categoria?: string;
      descricao_curta?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("admin_temp_data")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      smartToast.success("Produto vinculado ao cliente para uso administrativo");
      queryClient.invalidateQueries({ queryKey: ["admin-temp-data"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao vincular produto", error.message);
    },
  });

  // Marcar como usado (quando produto é usado em proposta/contrato)
  const markAsUsedMutation = useMutation({
    mutationFn: async ({
      tempDataId,
      documentType,
      documentId,
    }: {
      tempDataId: string;
      documentType: string;
      documentId: string;
    }) => {
      const { error } = await supabase
        .from("admin_temp_data")
        .update({
          used_at: new Date().toISOString(),
          used_in_document_type: documentType,
          used_in_document_id: documentId,
        })
        .eq("id", tempDataId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-temp-data"] });
    },
  });

  // Buscar histórico de uso de um produto
  const fetchHistoricoUso = async (produtoId: string) => {
    const { data, error } = await supabase
      .from("admin_temp_data")
      .select(`
        *,
        clientes!inner(id, nome),
        produtos!inner(id, nome, categoria)
      `)
      .eq("produto_id", produtoId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  return {
    produtosDisponiveis,
    loadingProdutos,
    fetchTempDataByCliente,
    createTempData: createTempDataMutation.mutate,
    markAsUsed: markAsUsedMutation.mutate,
    fetchHistoricoUso,
  };
}
