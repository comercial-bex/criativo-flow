import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

interface VariacaoAB {
  id: string;
  variacao_letra: string;
  texto_estruturado: string;
  abordagem: string;
  framework_usado: string;
  destaque?: string;
  impressoes: number;
  engajamentos: number;
  conversoes: number;
  taxa_conversao: number;
  is_vencedora: boolean;
  is_ativa: boolean;
}

export function useABTesting() {
  const [loading, setLoading] = useState(false);
  const [variacoes, setVariacoes] = useState<VariacaoAB[]>([]);

  const gerarVariacoes = async (params: {
    post_id: string;
    texto_original: string;
    tipo_conteudo: string;
    objetivo?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerar-variacoes-ab', {
        body: params
      });

      if (error) throw error;

      if (data.success) {
        setVariacoes(data.variacoes);
        toast.success(`✅ ${data.variacoes.length} variações criadas para teste A/B`);
        return data;
      } else {
        throw new Error(data.error || 'Erro ao gerar variações');
      }
    } catch (error: any) {
      console.error('Erro ao gerar variações A/B:', error);
      toast.error(error.message || 'Erro ao gerar variações A/B');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const buscarVariacoes = async (post_id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_ab_variations')
        .select('*')
        .eq('post_id', post_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVariacoes(data || []);
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar variações:', error);
      toast.error('Erro ao buscar variações');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const marcarVencedora = async (variacao_id: string, post_id: string) => {
    try {
      // Desmarcar outras como vencedoras
      await supabase
        .from('post_ab_variations')
        .update({ is_vencedora: false })
        .eq('post_id', post_id);

      // Marcar esta como vencedora
      const { error } = await supabase
        .from('post_ab_variations')
        .update({ is_vencedora: true })
        .eq('id', variacao_id);

      if (error) throw error;

      toast.success('✅ Variação marcada como vencedora!');
      await buscarVariacoes(post_id);
    } catch (error: any) {
      console.error('Erro ao marcar vencedora:', error);
      toast.error('Erro ao marcar variação como vencedora');
    }
  };

  const atualizarMetricas = async (variacao_id: string, metricas: {
    impressoes?: number;
    engajamentos?: number;
    conversoes?: number;
  }) => {
    try {
      const taxa_conversao = metricas.impressoes && metricas.conversoes
        ? (metricas.conversoes / metricas.impressoes) * 100
        : 0;

      const { error } = await supabase
        .from('post_ab_variations')
        .update({
          ...metricas,
          taxa_conversao,
          updated_at: new Date().toISOString()
        })
        .eq('id', variacao_id);

      if (error) throw error;

      toast.success('📊 Métricas atualizadas!');
    } catch (error: any) {
      console.error('Erro ao atualizar métricas:', error);
      toast.error('Erro ao atualizar métricas');
    }
  };

  return {
    loading,
    variacoes,
    gerarVariacoes,
    buscarVariacoes,
    marcarVencedora,
    atualizarMetricas
  };
}
