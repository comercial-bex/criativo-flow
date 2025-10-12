import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Roteiro = Database["public"]["Tables"]["roteiros"]["Row"];
type RoteiroInsert = Database["public"]["Tables"]["roteiros"]["Insert"];
type RoteiroUpdate = Database["public"]["Tables"]["roteiros"]["Update"];

interface UseRoteirosFilters {
  clienteId?: string;
  projetoId?: string;
  tarefaId?: string;
  status?: string;
}

export function useRoteiros(filters?: UseRoteirosFilters) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roteiros = [], isLoading } = useQuery({
    queryKey: ["roteiros", filters],
    queryFn: async () => {
      let query = supabase
        .from("roteiros")
        .select(`
          *,
          clientes(id, nome),
          projetos(id, titulo),
          tarefa(id, titulo)
        `)
        .order("updated_at", { ascending: false });

      if (filters?.clienteId) {
        query = query.eq("cliente_id", filters.clienteId);
      }
      if (filters?.projetoId) {
        query = query.eq("projeto_id", filters.projetoId);
      }
      if (filters?.tarefaId) {
        query = query.eq("tarefa_id", filters.tarefaId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Roteiro[];
    },
  });

  const createRoteiro = useMutation({
    mutationFn: async (data: RoteiroInsert) => {
      const { data: roteiro, error } = await supabase
        .from("roteiros")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return roteiro;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roteiros"] });
      toast({
        title: "✅ Roteiro criado",
        description: "Roteiro criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erro ao criar roteiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRoteiro = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RoteiroUpdate }) => {
      const { data: roteiro, error } = await supabase
        .from("roteiros")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return roteiro;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roteiros"] });
      toast({
        title: "✅ Roteiro atualizado",
        description: "Alterações salvas com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erro ao atualizar roteiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const duplicateRoteiro = useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchError } = await supabase
        .from("roteiros")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { id: _, created_at, updated_at, versao, ...roteiroData } = original;

      const { data: duplicado, error: insertError } = await supabase
        .from("roteiros")
        .insert({
          ...roteiroData,
          titulo: `${original.titulo} (Cópia)`,
          status: "rascunho",
          versao: 1,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return duplicado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roteiros"] });
      toast({
        title: "✅ Roteiro duplicado",
        description: "Cópia criada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erro ao duplicar roteiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateWithAI = useMutation({
    mutationFn: async (briefing: any) => {
      const { data, error } = await supabase.functions.invoke(
        "generate-roteiro-audiovisual",
        { body: briefing }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "🤖 Roteiro gerado com IA",
        description: "Roteiro criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erro ao gerar roteiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    roteiros,
    isLoading,
    createRoteiro: createRoteiro.mutateAsync,
    updateRoteiro: updateRoteiro.mutateAsync,
    duplicateRoteiro: duplicateRoteiro.mutateAsync,
    generateWithAI: generateWithAI.mutateAsync,
  };
}
