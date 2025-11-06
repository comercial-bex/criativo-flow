import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

/**
 * 🎯 HOOK UNIFICADO DE PRODUTOS
 * Centraliza TODOS os produtos: serviços, produtos, assinaturas e pacotes
 */

export type ProdutoTipo = "servico" | "produto" | "plano_assinatura" | "pacote_servico";

export interface ProdutoCatalogo {
  id: string;
  sku: string;
  nome: string;
  categoria: string | null;
  tipo: ProdutoTipo;
  unidade: string;
  preco_padrao: number;
  custo: number | null;
  imposto_percent: number;
  descricao: string | null;
  observacoes: string | null;
  lead_time_dias: number | null;
  ativo: boolean;
  
  // Campos para Planos de Assinatura
  periodo?: string | null;
  posts_mensais?: number | null;
  reels_suporte?: boolean;
  anuncios_facebook?: boolean;
  anuncios_google?: boolean;
  recursos?: string[] | null;
  
  // Campos para Pacotes de Serviço
  slug?: string | null;
  preco_base?: number | null;
  duracao_dias?: number | null;
  requer_briefing?: boolean;
  
  // Campos Gerais
  metadados?: any;
  ordem_exibicao?: number;
  
  created_at: string;
  updated_at: string;
}

interface UseProdutosCatalogoOptions {
  tipo?: ProdutoTipo | ProdutoTipo[];
  ativo?: boolean;
  categoria?: string;
}

export function useProdutosCatalogo(options: UseProdutosCatalogoOptions = {}) {
  const queryClient = useQueryClient();

  // Query principal com filtros
  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ["produtos-catalogo", options],
    queryFn: async () => {
      let query = supabase
        .from("produtos")
        .select("*")
        .order("ordem_exibicao", { ascending: true })
        .order("nome");

      // Filtro por tipo
      if (options.tipo) {
        if (Array.isArray(options.tipo)) {
          query = query.in("tipo", options.tipo);
        } else {
          query = query.eq("tipo", options.tipo);
        }
      }

      // Filtro por ativo
      if (options.ativo !== undefined) {
        query = query.eq("ativo", options.ativo);
      }

      // Filtro por categoria
      if (options.categoria) {
        query = query.eq("categoria", options.categoria);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ProdutoCatalogo[];
    },
  });

  // Mutation para criar produto
  const createMutation = useMutation({
    mutationFn: async (produto: Partial<ProdutoCatalogo>) => {
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
      queryClient.invalidateQueries({ queryKey: ["produtos-catalogo"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao criar produto", error.message);
    },
  });

  // Mutation para atualizar produto
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...produto }: Partial<ProdutoCatalogo> & { id: string }) => {
      const { error } = await supabase
        .from("produtos")
        .update(produto)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Produto atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["produtos-catalogo"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao atualizar produto", error.message);
    },
  });

  // Mutation para inativar produto
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
      queryClient.invalidateQueries({ queryKey: ["produtos-catalogo"] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao inativar produto", error.message);
    },
  });

  // Buscar produto por ID
  const buscarPorId = async (id: string): Promise<ProdutoCatalogo | null> => {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as ProdutoCatalogo) || null;
  };

  // Buscar por SKU
  const buscarPorSKU = async (sku: string): Promise<ProdutoCatalogo | null> => {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("sku", sku)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data as ProdutoCatalogo) || null;
  };

  // Buscar por nome (autocomplete)
  const buscarPorNome = async (nome: string): Promise<ProdutoCatalogo[]> => {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .ilike("nome", `%${nome}%`)
      .eq("ativo", true)
      .limit(10);

    if (error) throw error;
    return (data || []) as ProdutoCatalogo[];
  };

  // Helpers específicos por tipo
  const helpers = {
    // Apenas planos de assinatura ativos
    getPlanos: () => produtos.filter(p => p.tipo === 'plano_assinatura' && p.ativo),
    
    // Apenas pacotes de serviço ativos
    getPacotes: () => produtos.filter(p => p.tipo === 'pacote_servico' && p.ativo),
    
    // Produtos e serviços (para financeiro/orçamentos)
    getProdutosServicos: () => produtos.filter(p => 
      (p.tipo === 'produto' || p.tipo === 'servico') && p.ativo
    ),
    
    // Todos ativos
    getAtivos: () => produtos.filter(p => p.ativo),
  };

  return {
    produtos,
    loading: isLoading,
    createProduto: createMutation.mutate,
    updateProduto: updateMutation.mutate,
    inativarProduto: inativarMutation.mutate,
    buscarPorId,
    buscarPorSKU,
    buscarPorNome,
    ...helpers,
  };
}
