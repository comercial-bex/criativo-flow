import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

export function useTextGenerator() {
  const [loading, setLoading] = useState(false);
  
  const gerarTextoEstruturado = async (post: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-texto-estruturado', {
        body: {
          tipo_criativo: post.formato_postagem,
          tipo_conteudo: post.tipo_conteudo,
          titulo: post.titulo,
          objetivo_postagem: post.objetivo_postagem,
          publico_alvo: post.persona_alvo
        }
      });
      
      if (error) throw error;
      return data.texto_estruturado;
    } catch (error) {
      console.error('Erro ao gerar texto:', error);
      toast.error('Erro ao gerar estrutura textual');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return { gerarTextoEstruturado, loading };
}
