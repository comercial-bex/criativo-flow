import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScriptParams {
  clienteId: string;
  projetoId: string;
  titulo: string;
  duracao?: number;
  tom?: string;
  estilo?: string;
  tomCriativo?: string;
  persona?: string;
  objetivo?: string;
  plataforma?: string;
  publicoAlvo?: string;
  callToAction?: string;
  pontosChave?: string[];
  restricoes?: string;
  referenciasVisuais?: string[];
  agentesIds?: string[];
  frameworksIds?: string[];
}

export function useAIScriptGenerator() {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const generateScript = async (params: ScriptParams) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-roteiro-gpt4', {
        body: params
      });

      if (error) throw error;

      if (data?.roteiro) {
        setScript(data.roteiro);
        setMetadata(data.metadata);
        toast.success('Roteiro gerado com sucesso!');
        return { roteiro: data.roteiro, metadata: data.metadata };
      }

      throw new Error('Nenhum roteiro retornado');
    } catch (error: any) {
      console.error('Erro ao gerar roteiro:', error);
      toast.error(error.message || 'Erro ao gerar roteiro com IA');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearScript = () => {
    setScript(null);
    setMetadata(null);
  };

  return {
    generateScript,
    clearScript,
    script,
    metadata,
    loading
  };
}
