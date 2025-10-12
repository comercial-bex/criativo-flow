import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { smartToast } from '@/lib/smart-toast';

export interface ChecklistItem {
  id: string;
  user_id: string;
  setor: string;
  titulo: string;
  descricao: string | null;
  concluido: boolean | null;
  categoria: string | null;
  prioridade: number | null;
  ordem: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useProdutividadeChecklist(setor: 'grs' | 'design' | 'audiovisual') {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchItems();
      subscribeToChanges();
    }
  }, [user, setor]);

  const fetchItems = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('produtividade_checklist')
      .select('*')
      .eq('user_id', user.id)
      .eq('setor', setor)
      .order('ordem', { ascending: true });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const subscribeToChanges = () => {
    if (!user) return;

    const channel = supabase
      .channel('produtividade_checklist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtividade_checklist',
          filter: `user_id=eq.${user.id},setor=eq.${setor}`
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const criarItem = async (titulo: string) => {
    if (!user || !titulo.trim()) return;

    const { error } = await supabase
      .from('produtividade_checklist')
      .insert({
        user_id: user.id,
        setor,
        titulo: titulo.trim(),
        concluido: false,
        categoria: 'tarefa_rapida',
        ordem: items.length
      });

    if (error) {
      smartToast.error('Erro ao criar item', error.message);
    } else {
      smartToast.success('Item adicionado');
    }
  };

  const toggleItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const { error } = await supabase
      .from('produtividade_checklist')
      .update({ concluido: !item.concluido })
      .eq('id', itemId);

    if (error) {
      smartToast.error('Erro ao atualizar item', error.message);
    }
  };

  const removerItem = async (itemId: string) => {
    const { error } = await supabase
      .from('produtividade_checklist')
      .delete()
      .eq('id', itemId);

    if (error) {
      smartToast.error('Erro ao remover item', error.message);
    }
  };

  const itemsAtivos = items.filter(i => !i.concluido);
  const itemsConcluidos = items.filter(i => i.concluido);

  return {
    items,
    itemsAtivos,
    itemsConcluidos,
    loading,
    criarItem,
    toggleItem,
    removerItem,
    refresh: fetchItems
  };
}
