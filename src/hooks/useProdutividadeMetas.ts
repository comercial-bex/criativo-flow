import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Meta {
  id: string;
  user_id: string;
  setor: string;
  titulo: string;
  descricao: string;
  progresso: number;
  categoria: string | null;
  data_limite: string | null;
  qualidade_smart: number | null;
  avaliacao_ia: any;
  status: 'ativa' | 'concluida' | 'cancelada';
}

export function useProdutividadeMetas(setor: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMetas();
      const subscription = subscribeToChanges();
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [user, setor]);

  const fetchMetas = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('produtividade_metas')
      .select('*')
      .eq('user_id', user.id)
      .eq('setor', setor)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMetas(data as Meta[]);
    }
    setLoading(false);
  };

  const subscribeToChanges = () => {
    if (!user) return null;

    return supabase
      .channel('produtividade_metas_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtividade_metas',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchMetas()
      )
      .subscribe();
  };

  const criarMeta = async (meta: { titulo: string; descricao: string; categoria?: string; data_limite?: string }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('produtividade_metas')
      .insert([{
        titulo: meta.titulo,
        descricao: meta.descricao,
        categoria: meta.categoria || null,
        data_limite: meta.data_limite || null,
        user_id: user.id,
        setor
      }])
      .select()
      .single();

    if (!error && data) {
      // Avaliar com IA
      avaliarMetaSMART(data.id, data.titulo, data.descricao);
      
      toast({
        title: "Meta criada!",
        description: "Aguarde a avaliação SMART automática."
      });
      
      return data;
    }
    return null;
  };

  const avaliarMetaSMART = async (metaId: string, titulo: string, descricao: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('avaliar-meta-smart', {
        body: { titulo, descricao }
      });

      if (!error && data) {
        await supabase
          .from('produtividade_metas')
          .update({
            qualidade_smart: data.media,
            avaliacao_ia: data
          })
          .eq('id', metaId);
      }
    } catch (error) {
      console.error('Erro ao avaliar meta:', error);
    }
  };

  const atualizarProgresso = async (metaId: string, progresso: number) => {
    const { error } = await supabase
      .from('produtividade_metas')
      .update({ progresso })
      .eq('id', metaId);

    if (!error) {
      toast({
        title: "Progresso atualizado!",
        description: `${progresso}% concluído`
      });
    }
  };

  return {
    metas,
    loading,
    criarMeta,
    atualizarProgresso,
    refresh: fetchMetas
  };
}
