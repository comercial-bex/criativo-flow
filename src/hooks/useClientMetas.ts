import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClienteMeta {
  id: string;
  cliente_id: string;
  tipo_meta: 'vendas' | 'alcance' | 'engajamento' | 'trafego';
  titulo: string;
  descricao: string | null;
  valor_alvo: number;
  valor_atual: number;
  unidade: string;
  periodo_inicio: string;
  periodo_fim: string;
  status: 'em_andamento' | 'concluida' | 'cancelada';
  progresso_percent: number;
}

export function useClientMetas(clienteId?: string) {
  const [metas, setMetas] = useState<ClienteMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetas = async () => {
    if (!clienteId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('cliente_metas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('periodo_fim', { ascending: true });

      if (error) throw error;
      setMetas((data || []) as ClienteMeta[]);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetas();
  }, [clienteId]);

  return { metas, loading, refetch: fetchMetas };
}
