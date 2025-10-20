import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface Fornecedor {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  nome?: string; // Campo computado
  cpf_cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  site?: string;
  observacoes?: string;
  ativo: boolean;
  categoria?: string;
  condicao_pagamento?: string;
  created_at?: string;
  updated_at?: string;
}

export function useFornecedores() {
  const queryClient = useQueryClient();

  const { data: fornecedores = [], isLoading, error: fetchError } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .order("razao_social");

      if (error) {
        // Log detalhado para debug
        console.error("❌ Erro ao buscar fornecedores:", error);
        if (error.code === 'PGRST301' || error.message.includes('permission')) {
          smartToast.error("Sem permissão", "Você não tem permissão para acessar fornecedores");
        }
        throw error;
      }
      
      // Adicionar campo "nome" computado para compatibilidade
      return (data || []).map(f => ({
        ...f,
        nome: f.nome_fantasia || f.razao_social,
      })) as Fornecedor[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (fornecedor: Omit<Fornecedor, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("fornecedores")
        .insert([fornecedor])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Fornecedor cadastrado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao cadastrar fornecedor", error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...fornecedor }: Partial<Fornecedor> & { id: string }) => {
      const { data, error } = await supabase
        .from("fornecedores")
        .update(fornecedor)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Fornecedor atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar fornecedor", error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fornecedores")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Fornecedor excluído com sucesso");
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao excluir fornecedor", error.message);
    },
  });

  return {
    fornecedores,
    isLoading,
    createFornecedor: createMutation.mutate,
    updateFornecedor: updateMutation.mutate,
    deleteFornecedor: deleteMutation.mutate,
  };
}
