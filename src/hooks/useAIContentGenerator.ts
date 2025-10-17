import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ContentType = 'post' | 'legenda' | 'hashtags' | 'swot' | 'calendario';

export function useAIContentGenerator() {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | any>(null);

  const generateContent = async (prompt: string, type: ContentType = 'post') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { prompt, type }
      });

      if (error) throw error;

      if (data?.generatedText || data?.content) {
        const result = data.generatedText || data.content;
        setContent(result);
        toast.success('Conteúdo gerado com sucesso!');
        return result;
      }

      throw new Error('Nenhum conteúdo retornado');
    } catch (error: any) {
      console.error('Erro ao gerar conteúdo:', error);
      toast.error(error.message || 'Erro ao gerar conteúdo com IA');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearContent = () => {
    setContent(null);
  };

  return {
    generateContent,
    clearContent,
    content,
    loading
  };
}
