import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface InsightFoco {
  id: string;
  horarios_ideais: string[];
  energia_media: number;
  recomendacoes: string;
  data_analise: string;
}

export function useProdutividadeInsights(setor: string) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightFoco | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user, setor]);

  const fetchInsights = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('produtividade_insights_foco')
      .select('*')
      .eq('user_id', user.id)
      .eq('setor', setor)
      .order('data_analise', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setInsights(data as InsightFoco);
    }
    setLoading(false);
  };

  const gerarNovaPrevisao = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('prever-horarios-foco', {
        body: { userId: user.id, setor }
      });

      if (!error && data) {
        setInsights(data);
        return data;
      }
    } catch (error) {
      console.error('Erro ao gerar previsão:', error);
    }
    return null;
  };

  return {
    insights,
    loading,
    gerarNovaPrevisao,
    refresh: fetchInsights
  };
}
