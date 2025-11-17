import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HorarioInteligente {
  dia_semana: number;
  hora: number;
  taxa_engajamento_media: number;
  score_performance: number;
}

export function useAgendamentoInteligente(tipoConteudo?: string) {
  return useQuery({
    queryKey: ['agendamento-inteligente', tipoConteudo],
    queryFn: async () => {
      let query = supabase
        .from('post_performance_metrics' as any)
        .select('dia_semana, hora_publicacao, taxa_engajamento, score_performance');

      if (tipoConteudo) {
        query = query.eq('tipo_conteudo', tipoConteudo) as any;
      }

      const { data, error } = await query;
      if (error) throw error;

      const grouped = ((data || []) as any[]).reduce((acc: any, item: any) => {
        const key = `${item.dia_semana}-${item.hora_publicacao}`;
        if (!acc[key]) {
          acc[key] = {
            dia_semana: item.dia_semana,
            hora: item.hora_publicacao,
            total: 0,
            somaEngajamento: 0,
            somaScore: 0
          };
        }
        acc[key].total += 1;
        acc[key].somaEngajamento += item.taxa_engajamento || 0;
        acc[key].somaScore += item.score_performance || 0;
        return acc;
      }, {});

      const horarios: HorarioInteligente[] = Object.values(grouped)
        .map((g: any) => ({
          dia_semana: g.dia_semana,
          hora: g.hora,
          taxa_engajamento_media: g.somaEngajamento / g.total,
          score_performance: g.somaScore / g.total
        }))
        .sort((a, b) => b.score_performance - a.score_performance);

      return horarios.slice(0, 10);
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - dados mudam pouco
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: true
  });
}
