import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

interface BriefingContext {
  cliente?: {
    nome: string;
  };
  onboarding?: {
    segmento_atuacao?: string;
    publico_alvo?: string[];
    tom_voz?: string[];
    valores_principais?: string;
  };
  planejamento?: {
    titulo: string;
    objetivo_principal?: string;
    mes_referencia: string;
  };
}

interface BriefingOutput {
  titulo: string;
  descricao: string;
  objetivo_postagem: string;
  publico_alvo: string;
  contexto_estrategico: string;
  formato_postagem: string;
  call_to_action: string;
}

export function useAIBriefingGenerator() {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<BriefingOutput | null>(null);

  const generateBriefing = async (prompt: string, contexto: BriefingContext) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-task-briefing', {
        body: { prompt, contexto }
      });

      if (error) throw error;

      if (data?.briefing) {
        setBriefing(data.briefing);
        toast.success('Briefing gerado com sucesso!');
        return data.briefing;
      }

      throw new Error('Nenhum briefing retornado');
    } catch (error: any) {
      console.error('Erro ao gerar briefing:', error);
      toast.error(error.message || 'Erro ao gerar briefing com IA');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearBriefing = () => {
    setBriefing(null);
  };

  return {
    generateBriefing,
    clearBriefing,
    briefing,
    loading
  };
}
