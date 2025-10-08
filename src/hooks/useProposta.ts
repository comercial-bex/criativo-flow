import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export function useProposta(propostaId?: string) {
  const queryClient = useQueryClient();

  const { data: proposta, isLoading } = useQuery({
    queryKey: ["proposta", propostaId],
    queryFn: async () => {
      if (!propostaId) return null;

      const { data, error } = await supabase
        .from("propostas")
        .select(`
          *,
          clientes (id, nome, email, telefone, cnpj_cpf, endereco),
          projetos (id, titulo),
          proposta_itens (*),
          orcamentos (id, numero, titulo)
        `)
        .eq("id", propostaId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!propostaId,
  });

  const criarNovaVersao = useMutation({
    mutationFn: async (propostaId: string) => {
      const { data: original, error: origError } = await supabase
        .from("propostas")
        .select(`
          *,
          proposta_itens (*)
        `)
        .eq("id", propostaId)
        .single();

      if (origError) throw origError;

      const { id, link_publico, created_at, updated_at, ...propostaData } = original;

      const { data: novaVersao, error: novaError } = await supabase
        .from("propostas")
        .insert({
          ...propostaData,
          numero: original.numero,
          versao: (original.versao || 1) + 1,
          assinatura_status: "pendente",
          data_envio: null,
          visualizado_em: null,
          assinatura_data: null,
        })
        .select()
        .single();

      if (novaError) throw novaError;

      // Copiar itens
      const itensData = original.proposta_itens.map((item: any) => {
        const { id, proposta_id, ...itemData } = item;
        return {
          ...itemData,
          proposta_id: novaVersao.id,
        };
      });

      const { error: itensError } = await supabase
        .from("proposta_itens")
        .insert(itensData);

      if (itensError) throw itensError;

      return novaVersao;
    },
    onSuccess: () => {
      smartToast.success("Nova versão da proposta criada");
      queryClient.invalidateQueries({ queryKey: ["propostas"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao criar nova versão", error.message);
    },
  });

  const enviarProposta = useMutation({
    mutationFn: async (propostaId: string) => {
      const linkPublico = crypto.randomUUID();

      const { error } = await supabase
        .from("propostas")
        .update({
          assinatura_status: "enviado",
          link_publico: linkPublico,
          data_envio: new Date().toISOString(),
        })
        .eq("id", propostaId);

      if (error) throw error;

      // Log de atividade
      const { data: proposta } = await supabase
        .from("propostas")
        .select("cliente_id")
        .eq("id", propostaId)
        .single();

      if (proposta) {
        await supabase.rpc("criar_log_atividade", {
          p_cliente_id: proposta.cliente_id,
          p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
          p_acao: "enviar",
          p_entidade_tipo: "proposta",
          p_entidade_id: propostaId,
          p_descricao: "Proposta enviada ao cliente",
          p_metadata: { link_publico: linkPublico },
        });
      }

      return `${window.location.origin}/public/proposta/${linkPublico}`;
    },
    onSuccess: (url) => {
      smartToast.success("Proposta enviada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["propostas"] });
      navigator.clipboard.writeText(url);
      smartToast.info("Link copiado para área de transferência");
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao enviar proposta", error.message);
    },
  });

  const aceitarProposta = useMutation({
    mutationFn: async (propostaId: string) => {
      const { error } = await supabase
        .from("propostas")
        .update({
          assinatura_status: "assinado",
          assinatura_data: new Date().toISOString(),
        })
        .eq("id", propostaId);

      if (error) throw error;

      // Log de atividade
      const { data: proposta } = await supabase
        .from("propostas")
        .select("cliente_id, numero")
        .eq("id", propostaId)
        .single();

      if (proposta) {
        await supabase.rpc("criar_log_atividade", {
          p_cliente_id: proposta.cliente_id,
          p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
          p_acao: "aceitar",
          p_entidade_tipo: "proposta",
          p_entidade_id: propostaId,
          p_descricao: `Proposta ${proposta.numero} aceita pelo cliente`,
          p_metadata: {},
        });
      }
    },
    onSuccess: () => {
      smartToast.success("Proposta aceita");
      queryClient.invalidateQueries({ queryKey: ["propostas"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao aceitar proposta", error.message);
    },
  });

  const recusarProposta = useMutation({
    mutationFn: async ({ propostaId, motivo }: { propostaId: string; motivo: string }) => {
      const { error } = await supabase
        .from("propostas")
        .update({
          assinatura_status: "recusado",
          observacoes_cliente: motivo,
        })
        .eq("id", propostaId);

      if (error) throw error;

      // Log de atividade
      const { data: proposta } = await supabase
        .from("propostas")
        .select("cliente_id")
        .eq("id", propostaId)
        .single();

      if (proposta) {
        await supabase.rpc("criar_log_atividade", {
          p_cliente_id: proposta.cliente_id,
          p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
          p_acao: "recusar",
          p_entidade_tipo: "proposta",
          p_entidade_id: propostaId,
          p_descricao: `Proposta recusada: ${motivo}`,
          p_metadata: { motivo },
        });
      }
    },
    onSuccess: () => {
      smartToast.success("Proposta recusada");
      queryClient.invalidateQueries({ queryKey: ["propostas"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao recusar proposta", error.message);
    },
  });

  const converterParaContrato = useMutation({
    mutationFn: async (propostaId: string) => {
      const { data: proposta, error: propError } = await supabase
        .from("propostas")
        .select(`
          *,
          proposta_itens (*)
        `)
        .eq("id", propostaId)
        .single();

      if (propError) throw propError;

      const { data: contrato, error: contratoError } = await supabase
        .from("contratos")
        .insert({
          proposta_id: propostaId,
          cliente_id: proposta.cliente_id,
          projeto_id: proposta.projeto_id,
          titulo: proposta.titulo,
          descricao: proposta.observacoes_cliente,
          tipo: "servico",
          status: "rascunho",
          valor_mensal: proposta.total,
          data_inicio: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (contratoError) throw contratoError;

      // Copiar itens
      const itensData = proposta.proposta_itens.map((item: any) => ({
        contrato_id: contrato.id,
        produto_id: item.produto_id,
        descricao: item.descricao,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        imposto_percent: item.imposto_percent || 0,
        subtotal_item: item.subtotal_item,
        ordem: item.ordem || 0,
      }));

      const { error: itensError } = await supabase
        .from("contrato_itens")
        .insert(itensData);

      if (itensError) throw itensError;

      return contrato;
    },
    onSuccess: () => {
      smartToast.success("Contrato criado a partir da proposta");
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao converter para contrato", error.message);
    },
  });

  return {
    proposta,
    loading: isLoading,
    criarNovaVersao: criarNovaVersao.mutate,
    enviarProposta: enviarProposta.mutate,
    aceitarProposta: aceitarProposta.mutate,
    recusarProposta: recusarProposta.mutate,
    converterParaContrato: converterParaContrato.mutate,
  };
}
