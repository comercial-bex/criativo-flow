import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

interface PrevisaoPerformance {
  previsao_performance: {
    score_geral: number;
    nivel_confianca: string;
    impressoes_estimadas: number;
    alcance_estimado: number;
    taxa_engajamento_estimada: number;
    curtidas_estimadas: number;
    comentarios_estimados: number;
    compartilhamentos_estimados: number;
  };
  analise_fatores: {
    pontos_fortes: string[];
    pontos_atencao: string[];
    nivel_competitividade: string;
  };
  recomendacoes: string[];
  melhor_horario_alternativo?: {
    dia_semana: number;
    hora: number;
    motivo: string;
  };
  comparacao_mercado: {
    acima_media: boolean;
    percentil: number;
  };
  metadata?: {
    baseado_em_historico: boolean;
    total_posts_analisados: number;
    tem_dados_horario_especifico: boolean;
  };
}

export function usePrevisaoPerformance() {
  const [loading, setLoading] = useState(false);
  const [previsao, setPrevisao] = useState<PrevisaoPerformance | null>(null);

  const preverPerformance = async (params: {
    clienteId: string;
    tipo_conteudo: string;
    formato_postagem?: string;
    dia_semana: number;
    hora: number;
    texto_estruturado?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('prever-performance-post', {
        body: params
      });

      if (error) throw error;

      if (data.success) {
        setPrevisao(data);
        return data;
      } else {
        throw new Error(data.error || 'Erro ao prever performance');
      }
    } catch (error: any) {
      console.error('Erro ao prever performance:', error);
      toast.error(error.message || 'Erro ao gerar previsão de performance');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    previsao,
    preverPerformance
  };
}
