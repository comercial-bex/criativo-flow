import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClienteMeta } from './useClientMetas';

export interface MetaComHistorico extends ClienteMeta {
  historico: HistoricoMeta[];
  status_calculado: StatusMeta;
  variacao_semanal: number | null;
  tempo_decorrido_percent: number;
}

export interface HistoricoMeta {
  id: string;
  valor_registrado: number;
  progresso_percent: number;
  data_registro: string;
  observacao: string | null;
}

export type StatusMeta = 'em_dia' | 'em_risco' | 'atrasada' | 'concluida';

export interface MetasStats {
  total: number;
  em_dia: number;
  em_risco: number;
  atrasadas: number;
  concluidas: number;
  progresso_medio: number;
}

interface UseMetasVisualizacaoFilters {
  clienteId?: string;
  tipoMeta?: 'vendas' | 'alcance' | 'engajamento' | 'trafego';
  periodo?: {
    inicio: Date;
    fim: Date;
  };
}

export function useMetasVisualizacao(filters: UseMetasVisualizacaoFilters = {}) {
  return useQuery({
    queryKey: ['metas-visualizacao', filters],
    queryFn: async () => {
      // Buscar metas
      let query = supabase
        .from('cliente_metas')
        .select('*')
        .order('periodo_fim', { ascending: true });

      if (filters.clienteId) {
        query = query.eq('cliente_id', filters.clienteId);
      }

      if (filters.tipoMeta) {
        query = query.eq('tipo_meta', filters.tipoMeta);
      }

      if (filters.periodo) {
        query = query
          .gte('periodo_inicio', filters.periodo.inicio.toISOString())
          .lte('periodo_fim', filters.periodo.fim.toISOString());
      }

      const { data: metas, error: metasError } = await query;

      if (metasError) {
        console.error('Erro ao buscar metas:', metasError);
        throw metasError;
      }

      if (!metas || metas.length === 0) {
        return {
          metas: [],
          stats: {
            total: 0,
            em_dia: 0,
            em_risco: 0,
            atrasadas: 0,
            concluidas: 0,
            progresso_medio: 0,
          },
        };
      }

      // Buscar histórico para todas as metas
      const metasIds = metas.map(m => m.id);
      const { data: historicos, error: histError } = await supabase
        .from('cliente_metas_historico')
        .select('*')
        .in('meta_id', metasIds)
        .order('data_registro', { ascending: true });

      if (histError) {
        console.error('Erro ao buscar históricos:', histError);
      }

      // Processar cada meta
      const metasComHistorico: MetaComHistorico[] = (metas as any[]).map(meta => {
        const historicoMeta = (historicos || []).filter((h: any) => h.meta_id === meta.id) as HistoricoMeta[];
        
        const status_calculado = calcularStatusMeta(
          meta.progresso_percent,
          meta.periodo_inicio,
          meta.periodo_fim,
          meta.status
        );

        const variacao_semanal = calcularVariacaoSemanal(historicoMeta);
        const tempo_decorrido_percent = calcularTempoDecorrido(meta.periodo_inicio, meta.periodo_fim);

        return {
          ...meta,
          historico: historicoMeta,
          status_calculado,
          variacao_semanal,
          tempo_decorrido_percent,
        };
      });

      // Calcular estatísticas
      const stats: MetasStats = {
        total: metasComHistorico.length,
        em_dia: metasComHistorico.filter(m => m.status_calculado === 'em_dia').length,
        em_risco: metasComHistorico.filter(m => m.status_calculado === 'em_risco').length,
        atrasadas: metasComHistorico.filter(m => m.status_calculado === 'atrasada').length,
        concluidas: metasComHistorico.filter(m => m.status_calculado === 'concluida').length,
        progresso_medio: metasComHistorico.reduce((acc, m) => acc + m.progresso_percent, 0) / metasComHistorico.length || 0,
      };

      return {
        metas: metasComHistorico,
        stats,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  });
}

// Funções auxiliares
function calcularStatusMeta(
  progresso: number,
  dataInicio: string,
  dataFim: string,
  status: string
): StatusMeta {
  if (status === 'concluida') return 'concluida';

  const agora = new Date();
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  // Meta vencida
  if (agora > fim && status !== 'concluida') {
    return 'atrasada';
  }

  // Calcular tempo decorrido em percentual
  const tempoTotal = fim.getTime() - inicio.getTime();
  const tempoDecorrido = agora.getTime() - inicio.getTime();
  const tempoPercent = (tempoDecorrido / tempoTotal) * 100;

  // Comparar progresso real vs esperado
  const progressoEsperado = Math.min(tempoPercent, 100);

  if (progresso >= progressoEsperado * 0.8) {
    return 'em_dia'; // Progresso >= 80% do esperado
  } else if (progresso >= progressoEsperado * 0.5) {
    return 'em_risco'; // Progresso entre 50-80% do esperado
  } else {
    return 'atrasada'; // Progresso < 50% do esperado
  }
}

function calcularVariacaoSemanal(historico: HistoricoMeta[]): number | null {
  if (historico.length < 2) return null;

  const agora = new Date();
  const umaSemanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

  const registrosRecentes = historico.filter(h => 
    new Date(h.data_registro) >= umaSemanaAtras
  );

  if (registrosRecentes.length < 2) return null;

  const primeiro = registrosRecentes[0];
  const ultimo = registrosRecentes[registrosRecentes.length - 1];

  return ultimo.progresso_percent - primeiro.progresso_percent;
}

function calcularTempoDecorrido(dataInicio: string, dataFim: string): number {
  const agora = new Date();
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  const tempoTotal = fim.getTime() - inicio.getTime();
  const tempoDecorrido = agora.getTime() - inicio.getTime();

  return Math.min(Math.max((tempoDecorrido / tempoTotal) * 100, 0), 100);
}
