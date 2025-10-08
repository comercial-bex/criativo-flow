import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

export function useOrcamento(orcamentoId?: string) {
  const queryClient = useQueryClient();

  const { data: orcamento, isLoading } = useQuery({
    queryKey: ["orcamento", orcamentoId],
    queryFn: async () => {
      if (!orcamentoId) return null;

      const { data, error } = await supabase
        .from("orcamentos")
        .select(`
          *,
          clientes (id, nome, email, telefone, cnpj_cpf, endereco),
          projetos (id, titulo),
          orcamento_itens (*)
        `)
        .eq("id", orcamentoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orcamentoId,
  });

  const prefillFromClient = async (clienteId: string) => {
    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("id, nome, email, telefone, cnpj_cpf, endereco")
      .eq("id", clienteId)
      .single();

    if (error) throw error;

    return {
      cliente_id: cliente.id,
      contato_nome: cliente.nome,
      contato_email: cliente.email || "",
      contato_tel: cliente.telefone || "",
      condicoes_pagamento: "50% na assinatura, 50% na entrega",
    };
  };

  const converterParaProposta = useMutation({
    mutationFn: async (orcamentoId: string) => {
      const { data: orcamento, error: orcError } = await supabase
        .from("orcamentos")
        .select(`
          *,
          orcamento_itens (*)
        `)
        .eq("id", orcamentoId)
        .single();

      if (orcError) throw orcError;

      const { data: proposta, error: propError } = await supabase
        .from("propostas")
        .insert({
          titulo: orcamento.titulo,
          orcamento_id: orcamentoId,
          cliente_id: orcamento.cliente_id,
          projeto_id: orcamento.projeto_id,
          contato_nome: orcamento.contato_nome,
          contato_email: orcamento.contato_email,
          contato_tel: orcamento.contato_tel,
          condicoes_pagamento: orcamento.condicoes_pagamento,
          subtotal: orcamento.subtotal,
          impostos: orcamento.impostos,
          outros: orcamento.outros,
          total: orcamento.valor_total,
          responsavel_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (propError) throw propError;

      // Copiar itens
      const itensData = orcamento.orcamento_itens.map((item: any) => ({
        proposta_id: proposta.id,
        produto_id: item.produto_id,
        descricao: item.produto_servico,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        desconto_percent: item.desconto_percentual || 0,
        imposto_percent: item.imposto_percent || 0,
        subtotal_item: item.valor_total,
        ordem: item.ordem || 0,
      }));

      const { error: itensError } = await supabase
        .from("proposta_itens")
        .insert(itensData);

      if (itensError) throw itensError;

      return proposta;
    },
    onSuccess: () => {
      smartToast.success("Proposta criada com sucesso a partir do orçamento");
      queryClient.invalidateQueries({ queryKey: ["propostas"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao converter para proposta", error.message);
    },
  });

  const duplicarOrcamento = useMutation({
    mutationFn: async (orcamentoId: string) => {
      const { data: original, error: origError } = await supabase
        .from("orcamentos")
        .select(`
          *,
          orcamento_itens (*)
        `)
        .eq("id", orcamentoId)
        .single();

      if (origError) throw origError;

      const { id, numero, created_at, updated_at, ...orcamentoData } = original;

      const { data: novo, error: novoError } = await supabase
        .from("orcamentos")
        .insert({
          ...orcamentoData,
          titulo: `${original.titulo} (Cópia)`,
          status: "rascunho",
        })
        .select()
        .single();

      if (novoError) throw novoError;

      // Copiar itens
      const itensData = original.orcamento_itens.map((item: any) => {
        const { id, orcamento_id, ...itemData } = item;
        return {
          ...itemData,
          orcamento_id: novo.id,
        };
      });

      const { error: itensError } = await supabase
        .from("orcamento_itens")
        .insert(itensData);

      if (itensError) throw itensError;

      return novo;
    },
    onSuccess: () => {
      smartToast.success("Orçamento duplicado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao duplicar orçamento", error.message);
    },
  });

  return {
    orcamento,
    loading: isLoading,
    prefillFromClient,
    converterParaProposta: converterParaProposta.mutate,
    duplicarOrcamento: duplicarOrcamento.mutate,
  };
}
