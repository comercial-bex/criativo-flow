import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para resolver nomes de recursos baseado em IDs
 * Usado pelos breadcrumbs para mostrar nomes reais ao invés de IDs
 */

interface ResolverResult {
  label: string;
  isLoading: boolean;
}

// Resolver para clientes
export function useClienteResolver(clienteId?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["cliente-breadcrumb", clienteId],
    queryFn: async () => {
      if (!clienteId) return null;
      
      const { data, error } = await supabase
        .from("clientes")
        .select("nome")
        .eq("id", clienteId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!clienteId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    label: data?.nome || clienteId || "",
    isLoading,
  };
}

// Resolver para projetos
export function useProjetoResolver(projetoId?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["projeto-breadcrumb", projetoId],
    queryFn: async () => {
      if (!projetoId) return null;
      
      const { data, error } = await supabase
        .from("projetos")
        .select("titulo")
        .eq("id", projetoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!projetoId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    label: data?.titulo || projetoId || "",
    isLoading,
  };
}

// Resolver para roteiros
export function useRoteiroResolver(roteiroId?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["roteiro-breadcrumb", roteiroId],
    queryFn: async () => {
      if (!roteiroId) return null;
      
      const { data, error } = await supabase
        .from("roteiros")
        .select("titulo")
        .eq("id", roteiroId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!roteiroId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    label: data?.titulo || roteiroId || "",
    isLoading,
  };
}

// Resolver para contratos
export function useContratoResolver(contratoId?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["contrato-breadcrumb", contratoId],
    queryFn: async () => {
      if (!contratoId) return null;
      
      const { data, error } = await supabase
        .from("contratos")
        .select("titulo, cliente_id, clientes(nome)")
        .eq("id", contratoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!contratoId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    label: data?.titulo || contratoId || "",
    isLoading,
  };
}

// Resolver para produtos
export function useProdutoResolver(produtoId?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["produto-breadcrumb", produtoId],
    queryFn: async () => {
      if (!produtoId) return null;
      
      const { data, error } = await supabase
        .from("produtos")
        .select("nome")
        .eq("id", produtoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!produtoId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    label: data?.nome || produtoId || "",
    isLoading,
  };
}

// Resolver para orçamentos
export function useOrcamentoResolver(orcamentoId?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["orcamento-breadcrumb", orcamentoId],
    queryFn: async () => {
      if (!orcamentoId) return null;
      
      const { data, error } = await supabase
        .from("orcamentos")
        .select("numero, titulo")
        .eq("id", orcamentoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orcamentoId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    label: data?.titulo || data?.numero || orcamentoId || "",
    isLoading,
  };
}

// Resolver para propostas
export function usePropostaResolver(propostaId?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["proposta-breadcrumb", propostaId],
    queryFn: async () => {
      if (!propostaId) return null;
      
      const { data, error } = await supabase
        .from("propostas")
        .select("numero, titulo")
        .eq("id", propostaId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!propostaId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    label: data?.titulo || data?.numero || propostaId || "",
    isLoading,
  };
}

// Resolver para colaboradores
export function useColaboradorResolver(colaboradorId?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["colaborador-breadcrumb", colaboradorId],
    queryFn: async () => {
      if (!colaboradorId) return null;
      
      const { data, error } = await (supabase
        .from("pessoas")
        .select("nome, email")
        .eq("profile_id", colaboradorId)
        .single() as any);

      if (error) throw error;
      return data as { nome?: string; email?: string } | null;
    },
    enabled: !!colaboradorId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    label: (data as any)?.nome || (data as any)?.email || colaboradorId || "",
    isLoading,
  };
}

// Resolver para tarefas
export function useTarefaResolver(tarefaId?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["tarefa-breadcrumb", tarefaId],
    queryFn: async () => {
      if (!tarefaId) return null;
      
      const { data, error } = await supabase
        .from("tarefa")
        .select("titulo")
        .eq("id", tarefaId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tarefaId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    label: data?.titulo || tarefaId || "",
    isLoading,
  };
}

// Resolver para planejamentos
export function usePlanejamentoResolver(planejamentoId?: string): ResolverResult {
  const { data, isLoading } = useQuery({
    queryKey: ["planejamento-breadcrumb", planejamentoId],
    queryFn: async () => {
      if (!planejamentoId) return null;
      
      const { data, error } = await supabase
        .from("planejamentos")
        .select("titulo")
        .eq("id", planejamentoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!planejamentoId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    label: data?.titulo || planejamentoId || "",
    isLoading,
  };
}
