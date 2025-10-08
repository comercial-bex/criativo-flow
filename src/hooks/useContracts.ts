import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export interface Contract {
  id: string;
  cliente_id: string;
  titulo: string;
  descricao: string | null;
  tipo: "servico" | "confidencialidade" | "termo_uso";
  status: "rascunho" | "enviado" | "assinado" | "cancelado" | "vigente";
  valor_mensal: number | null;
  valor_avulso: number | null;
  valor_recorrente: number | null;
  data_inicio: string | null;
  data_fim: string | null;
  arquivo_url: string | null;
  arquivo_assinado_url: string | null;
  assinado_em: string | null;
  created_at: string;
  updated_at: string;
  clientes?: {
    id: string;
    nome: string;
  };
  projetos?: {
    id: string;
    titulo: string;
  };
}

export function useContracts(clienteId?: string) {
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts", clienteId],
    queryFn: async () => {
      let query = supabase
        .from("contratos")
        .select(`
          *,
          clientes (id, nome)
        `)
        .order("created_at", { ascending: false });

      if (clienteId) {
        query = query.eq("cliente_id", clienteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Contract[];
    },
    enabled: true,
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
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
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
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
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

  const renderizarTemplate = (templateHtml: string, dados: Record<string, any>) => {
    let html = templateHtml;
    
    Object.entries(dados).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, String(value || ''));
    });
    
    return html;
  };

  const gerarFaturas = useMutation({
    mutationFn: async (contratoId: string) => {
      const { data: contrato, error } = await supabase
        .from("contratos")
        .select("*")
        .eq("id", contratoId)
        .single();

      if (error) throw error;

      const faturas: any[] = [];

      if (contrato.valor_recorrente) {
        // Gerar faturas mensais
        const dataInicio = new Date(contrato.data_inicio);
        const dataFim = contrato.data_fim ? new Date(contrato.data_fim) : new Date(dataInicio.getFullYear() + 1, dataInicio.getMonth(), dataInicio.getDate());
        
        let currentDate = new Date(dataInicio);
        let i = 1;

        while (currentDate <= dataFim) {
          faturas.push({
            contrato_id: contratoId,
            cliente_id: contrato.cliente_id,
            descricao: `Mensalidade ${i} - ${contrato.titulo}`,
            valor: contrato.valor_recorrente,
            vencimento: currentDate.toISOString().split('T')[0],
            status: "pendente",
          });

          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
          i++;
        }
      } else if (contrato.valor_avulso) {
        // Gerar fatura única
        faturas.push({
          contrato_id: contratoId,
          cliente_id: contrato.cliente_id,
          descricao: `Pagamento único - ${contrato.titulo}`,
          valor: contrato.valor_avulso,
          vencimento: contrato.data_inicio,
          status: "pendente",
        });
      }

      if (faturas.length > 0) {
        const { error: fatError } = await supabase
          .from("faturas")
          .insert(faturas);

        if (fatError) throw fatError;

        // Log de atividade
        await supabase.rpc("criar_log_atividade", {
          p_cliente_id: contrato.cliente_id,
          p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
          p_acao: "gerar_faturas",
          p_entidade_tipo: "contrato",
          p_entidade_id: contratoId,
          p_descricao: `${faturas.length} fatura(s) criada(s) automaticamente`,
          p_metadata: { quantidade: faturas.length },
        });
      }

      return faturas.length;
    },
    onSuccess: (quantidade) => {
      smartToast.success(`${quantidade} fatura(s) gerada(s) com sucesso`);
      queryClient.invalidateQueries({ queryKey: ["faturas"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao gerar faturas", error.message);
    },
  });

  return {
    contracts,
    loading: isLoading,
    createContract: createMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    uploadContractFile,
    renderizarTemplate,
    gerarFaturas: gerarFaturas.mutate,
  };
}
