import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { smartToast } from '@/lib/smart-toast';

export interface Reflexao {
  id: string;
  user_id: string;
  setor: 'grs' | 'design' | 'audiovisual';
  texto: string;
  humor: 'feliz' | 'neutro' | 'triste' | null;
  data: string;
  resumo_ia: string | null;
  created_at: string;
}

export function useProdutividadeReflexao(setor: 'grs' | 'design' | 'audiovisual') {
  const { user } = useAuth();
  const [reflexoes, setReflexoes] = useState<Reflexao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReflexoes();
      subscribeToChanges();
    }
  }, [user, setor]);

  const fetchReflexoes = async (ultimos_dias = 7) => {
    if (!user) return;

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - ultimos_dias);

    const { data, error } = await (supabase
      .from('produtividade_reflexao' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('setor', setor)
      .gte('data', dataLimite.toISOString().split('T')[0])
      .order('data', { ascending: false }) as any);

    if (!error && data) {
      setReflexoes(data as Reflexao[]);
    }
    setLoading(false);
  };

  const subscribeToChanges = () => {
    if (!user) return;

    const channel = supabase
      .channel('produtividade_reflexao_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtividade_reflexao',
          filter: `user_id=eq.${user.id},setor=eq.${setor}`
        },
        () => {
          fetchReflexoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const salvarReflexao = async (texto: string, humor: 'feliz' | 'neutro' | 'triste') => {
    if (!user || !texto.trim()) {
      smartToast.error('Preencha a reflexão');
      return;
    }

    setSaving(true);
    const hoje = new Date().toISOString().split('T')[0];

    // Verificar se já existe reflexão para hoje
    const { data: existente } = await (supabase
      .from('produtividade_reflexao' as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('setor', setor)
      .eq('data', hoje)
      .maybeSingle() as any);

    let error;

    if (existente) {
      // Atualizar reflexão existente
      const result = await (supabase
        .from('produtividade_reflexao' as any)
        .update({ texto: texto.trim(), humor })
        .eq('id', (existente as any).id) as any);
      error = result.error;
    } else {
      // Criar nova reflexão
      const result = await (supabase
        .from('produtividade_reflexao' as any)
        .insert({
          user_id: user.id,
          setor,
          texto: texto.trim(),
          humor,
          data: hoje
        }) as any);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      smartToast.error('Erro ao salvar reflexão', error.message);
    } else {
      smartToast.success('Reflexão salva com sucesso');
      fetchReflexoes();
    }
  };

  const gerarInsightIA = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('gerar-insights-diarios', {
        body: { userId: user.id, setor, tipo: 'diario' }
      });

      if (!error && data) {
        smartToast.success('Insight gerado com sucesso');
        fetchReflexoes();
        return data.insight;
      } else {
        throw error || new Error('Erro ao gerar insight');
      }
    } catch (error) {
      console.error('Erro ao gerar insight:', error);
      smartToast.error('Erro ao gerar insight');
      return null;
    }
  };

  const reflexaoHoje = reflexoes.find(r => r.data === new Date().toISOString().split('T')[0]);

  return {
    reflexoes,
    reflexaoHoje,
    loading,
    saving,
    salvarReflexao,
    gerarInsightIA,
    refresh: fetchReflexoes
  };
}
