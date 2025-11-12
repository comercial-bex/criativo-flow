import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DataComemorativa {
  id: string;
  nome: string;
  data_fixa: string | null;
  mes_referencia: number;
  tipo: 'nacional' | 'regional' | 'segmento';
  regiao: string | null;
  segmentos: string[];
  descricao: string | null;
  potencial_engajamento: 'alto' | 'medio' | 'baixo';
  sugestao_campanha: string | null;
  manual?: boolean;
  created_by?: string;
}

export interface PlanejamentoCampanha {
  id: string;
  planejamento_id: string;
  data_comemorativa_id: string;
  nome_campanha: string;
  data_inicio: string;
  data_fim: string;
  periodo_pre_campanha: number;
  periodo_pos_campanha: number;
  objetivos: string[];
  status: string;
  orcamento_sugerido: number | null;
  data_comemorativa?: DataComemorativa;
}

export function useDatasComemoratias(planejamentoId: string, mesReferencia?: string) {
  const [datas, setDatas] = useState<DataComemorativa[]>([]);
  const [campanhas, setCampanhas] = useState<PlanejamentoCampanha[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatas = async () => {
    try {
      let query = supabase
        .from('datas_comemorativas')
        .select('*')
        .order('mes_referencia', { ascending: true })
        .order('nome', { ascending: true });

      if (mesReferencia) {
        const mes = new Date(mesReferencia).getMonth() + 1;
        query = query.eq('mes_referencia', mes);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDatas((data || []) as DataComemorativa[]);
    } catch (error) {
      console.error('Erro ao carregar datas comemorativas:', error);
    }
  };

  const fetchCampanhas = async () => {
    try {
      const { data, error } = await supabase
        .from('planejamento_campanhas')
        .select(`
          *,
          data_comemorativa:datas_comemorativas(*)
        `)
        .eq('planejamento_id', planejamentoId);

      if (error) throw error;
      setCampanhas((data || []) as PlanejamentoCampanha[]);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatas();
    fetchCampanhas();
  }, [planejamentoId, mesReferencia]);

  const adicionarCampanha = async (campanha: Omit<PlanejamentoCampanha, 'id' | 'planejamento_id'>) => {
    try {
      const { data, error } = await supabase
        .from('planejamento_campanhas')
        .insert({
          ...campanha,
          planejamento_id: planejamentoId
        })
        .select(`
          *,
          data_comemorativa:datas_comemorativas(*)
        `)
        .single();

      if (error) throw error;
      setCampanhas([...campanhas, data as PlanejamentoCampanha]);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao adicionar campanha:', error);
      return { data: null, error };
    }
  };

  const removerCampanha = async (id: string) => {
    try {
      const { error } = await supabase
        .from('planejamento_campanhas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCampanhas(campanhas.filter(c => c.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Erro ao remover campanha:', error);
      return { error };
    }
  };

  const adicionarDataManual = async (data: Omit<DataComemorativa, 'id'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data: novaData, error } = await supabase
        .from('datas_comemorativas')
        .insert({
          ...data,
          manual: true,
          created_by: userData.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      setDatas([...datas, novaData as DataComemorativa]);
      return { data: novaData, error: null };
    } catch (error) {
      console.error('Erro ao adicionar data manual:', error);
      return { data: null, error };
    }
  };

  const editarDataManual = async (id: string, updates: Partial<DataComemorativa>) => {
    try {
      const { data: updatedData, error } = await supabase
        .from('datas_comemorativas')
        .update(updates)
        .eq('id', id)
        .eq('manual', true)
        .select()
        .single();

      if (error) throw error;
      setDatas(datas.map(d => d.id === id ? updatedData as DataComemorativa : d));
      return { data: updatedData, error: null };
    } catch (error) {
      console.error('Erro ao editar data manual:', error);
      return { data: null, error };
    }
  };

  const removerDataManual = async (id: string) => {
    try {
      const { error } = await supabase
        .from('datas_comemorativas')
        .delete()
        .eq('id', id)
        .eq('manual', true);

      if (error) throw error;
      setDatas(datas.filter(d => d.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Erro ao remover data manual:', error);
      return { error };
    }
  };

  return {
    datas,
    campanhas,
    loading,
    refetch: () => {
      fetchDatas();
      fetchCampanhas();
    },
    adicionarCampanha,
    removerCampanha,
    adicionarDataManual,
    editarDataManual,
    removerDataManual
  };
}
