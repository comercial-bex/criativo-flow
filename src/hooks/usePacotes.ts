import { useProdutosCatalogo, type ProdutoCatalogo } from './useProdutosCatalogo';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';

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
  const { produtos, loading, ...rest } = useProdutosCatalogo({ 
    tipo: 'pacote_servico',
    ativo: true 
  });

  // Converter produtos para formato Pacote para compatibilidade
  const pacotes: Pacote[] = produtos.map(p => ({
    id: p.id,
    nome: p.nome,
    slug: p.slug || '',
    descricao: p.descricao || '',
    tipo: (p.categoria === 'Mídias Sociais' ? 'social' : 
           p.categoria === 'Audiovisual' ? 'audiovisual' :
           p.categoria === 'Premium' ? 'premium' : 'avulso') as Pacote['tipo'],
    ativo: p.ativo,
    preco_base: p.preco_base || p.preco_padrao,
    created_at: p.created_at,
    updated_at: p.updated_at
  }));

  const fetchPacotes = async () => {
    // Compatibilidade - agora usa useProdutosCatalogo
    return pacotes;
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
      smartToast.error('Erro ao carregar itens do pacote');
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

  return {
    pacotes,
    loading,
    fetchPacotes,
    fetchPacoteItens,
    fetchTaskTemplates,
  };
}
