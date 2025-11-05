import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompetitorMetricSnapshot {
  id: string;
  concorrente_id: string;
  data_coleta: string;
  seguidores_instagram: number | null;
  seguidores_facebook: number | null;
  seguidores_tiktok: number | null;
  seguidores_youtube: number | null;
  seguidores_linkedin: number | null;
  engajamento_percent: number | null;
  frequencia_posts_semana: number | null;
  media_likes: number | null;
  media_comments: number | null;
  snapshot_completo: any;
}

export interface CompetitorTrend {
  plataforma: string;
  variacao_semanal: number | null;
  variacao_mensal: number | null;
  tendencia: 'crescendo' | 'estavel' | 'decrescendo';
  dados_grafico: {
    data: string;
    valor: number;
  }[];
}

export interface CompetitorEvolutionData {
  concorrente_id: string;
  nome_concorrente: string;
  snapshots: CompetitorMetricSnapshot[];
  trends: CompetitorTrend[];
  insights: string[];
  resumo: {
    melhor_plataforma: string;
    maior_crescimento: string;
    engajamento_atual: number | null;
  };
}

interface UseCompetitorEvolutionParams {
  concorrenteId: string;
  periodo?: {
    inicio: Date;
    fim: Date;
  };
}

export function useCompetitorEvolution({ concorrenteId, periodo }: UseCompetitorEvolutionParams) {
  return useQuery({
    queryKey: ['competitor-evolution', concorrenteId, periodo],
    queryFn: async () => {
      // Buscar dados do concorrente
      const { data: concorrente, error: concorrenteError } = await supabase
        .from('concorrentes_analise')
        .select('id, nome, analise_ia')
        .eq('id', concorrenteId)
        .single();

      if (concorrenteError) {
        console.error('Erro ao buscar concorrente:', concorrenteError);
        throw concorrenteError;
      }

      // Buscar histórico de métricas
      // @ts-ignore - Tabela criada na migração, types serão atualizados
      let queryHistorico = supabase
        // @ts-ignore
        .from('concorrentes_metricas_historico')
        .select('*')
        .eq('concorrente_id', concorrenteId)
        .order('data_coleta', { ascending: true });

      if (periodo) {
        queryHistorico = queryHistorico
          .gte('data_coleta', periodo.inicio.toISOString())
          .lte('data_coleta', periodo.fim.toISOString());
      } else {
        // Padrão: últimos 3 meses
        const tresMesesAtras = new Date();
        tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
        queryHistorico = queryHistorico.gte('data_coleta', tresMesesAtras.toISOString());
      }

      const { data: snapshots, error: snapshotsError } = await queryHistorico;

      if (snapshotsError) {
        console.error('Erro ao buscar histórico:', snapshotsError);
        throw snapshotsError;
      }

      if (!snapshots || snapshots.length === 0) {
        return {
          concorrente_id: concorrenteId,
          nome_concorrente: (concorrente as any).nome || 'Concorrente',
          snapshots: [],
          trends: [],
          insights: ['Sem dados históricos disponíveis'],
          resumo: {
            melhor_plataforma: 'N/A',
            maior_crescimento: 'N/A',
            engajamento_atual: null,
          },
        };
      }

      // Calcular trends por plataforma
      const plataformas = ['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin'];
      const trends: CompetitorTrend[] = [];

      for (const plataforma of plataformas) {
        const campo = `seguidores_${plataforma}`;
        const dadosPlataforma = (snapshots as any[])
          .filter((s: any) => s[campo] !== null)
          .map((s: any) => ({
            data: s.data_coleta,
            valor: s[campo] as number,
          }));

        if (dadosPlataforma.length < 2) continue;

        const variacao_semanal = calcularVariacao(dadosPlataforma, 7);
        const variacao_mensal = calcularVariacao(dadosPlataforma, 30);
        const tendencia = detectarTendencia(dadosPlataforma);

        trends.push({
          plataforma,
          variacao_semanal,
          variacao_mensal,
          tendencia,
          dados_grafico: dadosPlataforma,
        });
      }

      // Gerar insights
      const insights = gerarInsights(trends, (concorrente as any).nome || 'Concorrente', snapshots as any);

      // Calcular resumo
      const ultimoSnapshot: any = snapshots[snapshots.length - 1];
      const melhorPlataforma = encontrarMelhorPlataforma(trends);
      const maiorCrescimento = encontrarMaiorCrescimento(trends);

      const resumo = {
        melhor_plataforma: melhorPlataforma || 'N/A',
        maior_crescimento: maiorCrescimento || 'N/A',
        engajamento_atual: ultimoSnapshot?.engajamento_percent || null,
      };

      return {
        concorrente_id: concorrenteId,
        nome_concorrente: (concorrente as any).nome || 'Concorrente',
        snapshots: snapshots as any,
        trends,
        insights,
        resumo,
      } as CompetitorEvolutionData;
    },
    enabled: !!concorrenteId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Funções auxiliares
function calcularVariacao(dados: { data: string; valor: number }[], dias: number): number | null {
  if (dados.length < 2) return null;

  const agora = new Date();
  const dataLimite = new Date(agora.getTime() - dias * 24 * 60 * 60 * 1000);

  const dadosRecentes = dados.filter(d => new Date(d.data) >= dataLimite);
  if (dadosRecentes.length < 2) return null;

  const primeiro = dadosRecentes[0].valor;
  const ultimo = dadosRecentes[dadosRecentes.length - 1].valor;

  return ((ultimo - primeiro) / primeiro) * 100;
}

function detectarTendencia(dados: { data: string; valor: number }[]): 'crescendo' | 'estavel' | 'decrescendo' {
  if (dados.length < 3) return 'estavel';

  const ultimos3 = dados.slice(-3);
  const crescimentos = ultimos3.slice(1).map((d, i) => d.valor - ultimos3[i].valor);

  const mediaGrowth = crescimentos.reduce((a, b) => a + b, 0) / crescimentos.length;

  if (mediaGrowth > 0) return 'crescendo';
  if (mediaGrowth < 0) return 'decrescendo';
  return 'estavel';
}

function gerarInsights(trends: CompetitorTrend[], nome: string, snapshots: CompetitorMetricSnapshot[]): string[] {
  const insights: string[] = [];

  // Insight de crescimento
  const trendsCrescendo = trends.filter(t => t.tendencia === 'crescendo');
  if (trendsCrescendo.length > 0) {
    const plataformas = trendsCrescendo.map(t => t.plataforma).join(', ');
    insights.push(`${nome} está crescendo em: ${plataformas}`);
  }

  // Insight de maior crescimento mensal
  const maiorCrescimento = trends.reduce((max, t) => 
    (t.variacao_mensal || 0) > (max.variacao_mensal || 0) ? t : max
  , trends[0]);

  if (maiorCrescimento?.variacao_mensal && maiorCrescimento.variacao_mensal > 5) {
    insights.push(
      `Crescimento de ${maiorCrescimento.variacao_mensal.toFixed(1)}% no ${maiorCrescimento.plataforma} este mês`
    );
  }

  // Insight de engajamento
  const ultimoSnapshot = snapshots[snapshots.length - 1];
  if (ultimoSnapshot?.engajamento_percent) {
    const nivel = ultimoSnapshot.engajamento_percent > 3 ? 'alto' : 
                  ultimoSnapshot.engajamento_percent > 1 ? 'médio' : 'baixo';
    insights.push(`Taxa de engajamento ${nivel}: ${ultimoSnapshot.engajamento_percent.toFixed(2)}%`);
  }

  // Insight de frequência
  if (ultimoSnapshot?.frequencia_posts_semana) {
    insights.push(`Publica ${ultimoSnapshot.frequencia_posts_semana} vezes por semana`);
  }

  return insights.length > 0 ? insights : ['Dados insuficientes para gerar insights'];
}

function encontrarMelhorPlataforma(trends: CompetitorTrend[]): string | null {
  if (trends.length === 0) return null;

  const melhor = trends.reduce((max, t) => {
    const ultimoValor = t.dados_grafico[t.dados_grafico.length - 1]?.valor || 0;
    const maxValor = max.dados_grafico[max.dados_grafico.length - 1]?.valor || 0;
    return ultimoValor > maxValor ? t : max;
  }, trends[0]);

  return melhor.plataforma;
}

function encontrarMaiorCrescimento(trends: CompetitorTrend[]): string | null {
  if (trends.length === 0) return null;

  const melhor = trends.reduce((max, t) => 
    (t.variacao_mensal || 0) > (max.variacao_mensal || 0) ? t : max
  , trends[0]);

  if (!melhor.variacao_mensal) return null;

  return `${melhor.plataforma} (+${melhor.variacao_mensal.toFixed(1)}%)`;
}
