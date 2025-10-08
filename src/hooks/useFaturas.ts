import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface Fatura {
  id: string;
  cliente_id: string | null;
  projeto_id: string | null;
  contrato_id: string | null;
  proposta_id: string | null;
  numero: string | null;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  pago_em: string | null;
  comprovante_url: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export function useFaturas(contratoId?: string) {
  const queryClient = useQueryClient();

  const { data: faturas = [], isLoading } = useQuery({
    queryKey: ["faturas", contratoId],
    queryFn: async () => {
      let query = supabase
        .from("faturas")
        .select("*")
        .order("vencimento", { ascending: true });

      if (contratoId) {
        query = query.eq("contrato_id", contratoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Fatura[];
    },
    enabled: true,
  });

  const marcarPagoMutation = useMutation({
    mutationFn: async ({ id, comprovante_url }: { id: string; comprovante_url?: string }) => {
      const updates: any = {
        status: "pago",
        pago_em: new Date().toISOString(),
      };
      
      if (comprovante_url) {
        updates.comprovante_url = comprovante_url;
      }

      const { error } = await supabase
        .from("faturas")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Fatura marcada como paga");
      queryClient.invalidateQueries({ queryKey: ["faturas"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao marcar fatura como paga", error.message);
    },
  });

  const uploadComprovante = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("contracts")
      .upload(`comprovantes/${fileName}`, file);

    if (error) throw error;

    const { data } = supabase.storage.from("contracts").getPublicUrl(`comprovantes/${fileName}`);
    return data.publicUrl;
  };

  return {
    faturas,
    loading: isLoading,
    marcarPago: marcarPagoMutation.mutate,
    uploadComprovante,
  };
}
