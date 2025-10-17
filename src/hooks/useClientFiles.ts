import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { MODULE_QUERY_CONFIG } from "@/lib/queryConfig";

export interface ClientFile {
  name: string;
  id: string;
  created_at: string;
  metadata: Record<string, any>;
}

export function useClientFiles(clienteId: string, projetoId?: string) {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["client-files", clienteId, projetoId],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("task-attachments")
        .list("", {
          limit: 50,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      // Filtrar por metadata
      const filtered = data.filter((file: any) => {
        const metadata = file.metadata || {};
        if (projetoId) {
          return metadata.cliente_id === clienteId && metadata.projeto_id === projetoId;
        }
        return metadata.cliente_id === clienteId;
      });

      return filtered.slice(0, 50) as any as ClientFile[];
    },
    enabled: !!clienteId,
    ...MODULE_QUERY_CONFIG.tarefas
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: any }) => {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("task-attachments")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          metadata,
        });

      if (error) throw error;
      return fileName;
    },
    onSuccess: () => {
      smartToast.success("Arquivo enviado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["client-files", clienteId, projetoId] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao enviar arquivo", error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage.from("task-attachments").remove([fileName]);

      if (error) throw error;
    },
    onSuccess: () => {
      smartToast.success("Arquivo deletado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["client-files", clienteId, projetoId] });
    },
    onError: (error: Error) => {
      smartToast.error("Erro ao deletar arquivo", error.message);
    },
  });

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from("task-attachments").getPublicUrl(fileName);
    return data.publicUrl;
  };

  return {
    files,
    loading: isLoading,
    uploadFile: uploadMutation.mutate,
    deleteFile: deleteMutation.mutate,
    getPublicUrl,
  };
}
