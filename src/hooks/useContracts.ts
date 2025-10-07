import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface Contract {
  id: string;
  cliente_id: string;
  titulo: string;
  descricao: string | null;
  tipo: "servico" | "confidencialidade" | "termo_uso";
  status: "rascunho" | "enviado" | "assinado" | "cancelado";
  valor_mensal: number | null;
  data_inicio: string | null;
  data_fim: string | null;
  arquivo_url: string | null;
  arquivo_assinado_url: string | null;
  assinado_em: string | null;
  created_at: string;
  updated_at: string;
}

export function useContracts(clienteId: string) {
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Contract[];
    },
    enabled: !!clienteId,
  });

  const createMutation = useMutation({
    mutationFn: async (contract: Partial<Contract>) => {
      const { data, error } = await supabase
        .from("contratos")
        .insert([contract] as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      smartToast.success("Contrato criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["contracts", clienteId] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao criar contrato", error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, arquivo_assinado_url }: { id: string; status: string; arquivo_assinado_url?: string }) => {
      const updates: any = { status };
      if (status === "assinado") {
        updates.assinado_em = new Date().toISOString();
        if (arquivo_assinado_url) {
          updates.arquivo_assinado_url = arquivo_assinado_url;
        }
      }

      const { error } = await supabase
        .from("contratos")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Status atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["contracts", clienteId] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar status", error.message);
    },
  });

  const uploadContractFile = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("contracts")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage.from("contracts").getPublicUrl(fileName);
    return data.publicUrl;
  };

  return {
    contracts,
    loading: isLoading,
    createContract: createMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    uploadContractFile,
  };
}
