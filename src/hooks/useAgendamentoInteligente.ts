import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

interface HorarioSugerido {
  hora: number;
  minuto: number;
  score: number;
  justificativa: string;
}

interface SugestaoAgendamento {
  horarios_sugeridos: HorarioSugerido[];
  recomendacoes: string[];
  melhor_horario_geral: string;
  metadata?: {
    baseado_em_analytics: boolean;
    total_posts_historicos: number;
    dia_semana: string;
  };
}

export function useAgendamentoInteligente() {
  const [loading, setLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState<SugestaoAgendamento | null>(null);

  const sugerirHorarios = async (params: {
    clienteId: string;
    tipo_conteudo: string;
    data_postagem: string;
    publico_alvo?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sugerir-horarios-postagem', {
        body: params
      });

      if (error) throw error;

      if (data.success) {
        setSugestoes(data);
        return data;
      } else {
        throw new Error(data.error || 'Erro ao gerar sugestões');
      }
    } catch (error: any) {
      console.error('Erro ao sugerir horários:', error);
      toast.error(error.message || 'Erro ao gerar sugestões de horários');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const aplicarHorario = (data: string, horario: HorarioSugerido) => {
    const dataCompleta = new Date(data);
    dataCompleta.setHours(horario.hora, horario.minuto, 0, 0);
    return dataCompleta.toISOString();
  };

  return {
    loading,
    sugestoes,
    sugerirHorarios,
    aplicarHorario
  };
}
