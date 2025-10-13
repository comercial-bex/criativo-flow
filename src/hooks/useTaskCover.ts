import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useTaskCover(tarefaId: string, capaAnexoId?: string | null) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!capaAnexoId) {
      setCoverUrl(null);
      return;
    }

    const fetchCoverUrl = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('anexo')
        .select('arquivo_url')
        .eq('id', capaAnexoId)
        .single();
      
      if (!error && data) {
        setCoverUrl(data.arquivo_url);
      } else {
        setCoverUrl(null);
      }
      setIsLoading(false);
    };

    fetchCoverUrl();
  }, [capaAnexoId]);

  const updateCoverAnexo = async (newAnexoId: string | null) => {
    const { error } = await supabase
      .from('tarefa')
      .update({ capa_anexo_id: newAnexoId })
      .eq('id', tarefaId);

    if (!error) {
      if (newAnexoId) {
        const { data } = await supabase
          .from('anexo')
          .select('arquivo_url')
          .eq('id', newAnexoId)
          .single();
        
        if (data) {
          setCoverUrl(data.arquivo_url);
        }
      } else {
        setCoverUrl(null);
      }
      
      toast({
        title: "Capa atualizada",
        description: newAnexoId ? "Imagem de capa definida com sucesso!" : "Capa removida com sucesso!",
      });
    } else {
      toast({
        title: "Erro ao atualizar capa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { coverUrl, isLoading, updateCoverAnexo };
}
