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
        const { data: objectivesData, error: objectivesError } = await supabase
          .from('vw_planos_publicos_itens')
          .select('*')
          .in('plano_id', planIds);

        if (objectivesError) throw objectivesError;
        setObjectives((objectivesData || []) as PlanObjective[]);
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

  return {
    plans,
    objectives,
    loading,
    refetch: fetchPlans
  };
}
