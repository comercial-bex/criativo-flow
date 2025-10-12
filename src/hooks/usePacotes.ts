import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Pacote {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  tipo: 'social' | 'audiovisual' | 'premium' | 'avulso';
  ativo: boolean;
  preco_base: number;
  created_at: string;
  updated_at: string;
}

export interface PacoteItem {
  id: string;
  pacote_id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  skill: 'design' | 'filmmaker' | 'editor' | 'motion' | 'audio' | 'social';
  duracao_padrao_min: number;
  ordem: number;
  created_at: string;
}

export interface PacoteTaskTemplate {
  id: string;
  pacote_item_id: string;
  titulo: string;
  descricao: string;
  skill: 'design' | 'filmmaker' | 'editor' | 'motion' | 'audio' | 'social';
  prazo_offset_dias: number;
  depende_de: string[];
  anexos_obrigatorios: string[];
  checklist_items: string[];
  created_at: string;
}

export function usePacotes() {
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPacotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pacotes')
        .select('*')
        .eq('ativo', true)
        .order('tipo', { ascending: true });

      if (error) throw error;
      setPacotes((data || []) as Pacote[]);
    } catch (error) {
      console.error('Erro ao buscar pacotes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar pacotes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPacoteItens = async (pacoteId: string): Promise<PacoteItem[]> => {
    try {
      const { data, error } = await supabase
        .from('pacote_itens')
        .select('*')
        .eq('pacote_id', pacoteId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return (data || []) as PacoteItem[];
    } catch (error) {
      console.error('Erro ao buscar itens do pacote:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar itens do pacote',
        variant: 'destructive',
      });
      return [];
    }
  };

  const fetchTaskTemplates = async (pacoteItemId: string): Promise<PacoteTaskTemplate[]> => {
    try {
      const { data, error } = await supabase
        .from('pacote_task_templates')
        .select('*')
        .eq('pacote_item_id', pacoteItemId);

      if (error) throw error;
      return (data || []) as PacoteTaskTemplate[];
    } catch (error) {
      console.error('Erro ao buscar templates de tarefas:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPacotes();
  }, []);

  return {
    pacotes,
    loading,
    fetchPacotes,
    fetchPacoteItens,
    fetchTaskTemplates,
  };
}
