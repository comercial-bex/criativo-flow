import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StrategicPlan {
  id: string;
  cliente_id: string;
  titulo: string;
  periodo_inicio: string;
  periodo_fim: string;
  missao: string | null;
  visao: string | null;
  valores: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface PlanObjective {
  id: string;
  plano_id: string;
  objetivo: string;
  descricao: string | null;
  kpis: string[] | null;
  iniciativas: string[] | null;
  prazo_conclusao: string | null;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  ordem: number;
  responsavel_nome: string | null;
}

export function useStrategicPlans(clienteId?: string) {
  const [plans, setPlans] = useState<StrategicPlan[]>([]);
  const [objectives, setObjectives] = useState<PlanObjective[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    if (!clienteId) return;
    
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('vw_planos_publicos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('periodo_inicio', { ascending: false });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      if (plansData && plansData.length > 0) {
        const planIds = plansData.map(p => p.id);
        // @ts-ignore - Complex view type causes deep instantiation error
        const { data: objectivesData, error: objectivesError } = await supabase
          .from('vw_planos_publicos_itens')
          .select('*')
          .in('plano_id', planIds);

        if (objectivesError) throw objectivesError;
        setObjectives((objectivesData || []) as any as PlanObjective[]);
      }
    } catch (error) {
      console.error('Erro ao carregar planos estratégicos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [clienteId]);

  const createStrategicPlan = async (data: {
    cliente_id: string;
    titulo: string;
    periodo_inicio: string;
    periodo_fim: string;
    missao: string;
    visao: string;
    valores: string[];
    analise_swot?: any;
    origem_ia: boolean;
    dados_onboarding?: any;
  }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: newPlan, error } = await supabase
        .from('planos_estrategicos')
        .insert({
          ...data,
          created_by: user?.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchPlans(); // Recarregar lista
      return { data: newPlan, error: null };
    } catch (error) {
      console.error('Erro ao criar plano estratégico:', error);
      return { data: null, error };
    }
  };

  const generateWithAI = async (clienteId: string, model: 'gemini' | 'gpt4' = 'gemini') => {
    try {
      // Chamar edge function
      const { data, error } = await supabase.functions.invoke('generate-strategic-plan', {
        body: { 
          clienteId,
          model,
          periodo: {
            inicio: new Date().toISOString().slice(0, 10),
            fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          }
        }
      });

      if (error) throw error;
      return { data: data.plan, error: null };
    } catch (error) {
      console.error('Erro ao gerar plano com IA:', error);
      return { data: null, error };
    }
  };

  return {
    plans,
    objectives,
    loading,
    refetch: fetchPlans,
    createStrategicPlan,
    generateWithAI
  };
}
