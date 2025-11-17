import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Sparkles, Loader2, Clock, Target, AlertTriangle } from 'lucide-react';
import { usePrevisaoPerformance } from '@/hooks/usePrevisaoPerformance';
import { useState } from 'react';
import { DialogWrapper } from './DialogWrapper';

interface PrevisaoPerformanceProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  clienteId: string;
}

export const PrevisaoPerformance = ({ isOpen, onClose, post, clienteId }: PrevisaoPerformanceProps) => {
  const { loading, previsao, preverPerformance } = usePrevisaoPerformance();
  const [gerando, setGerando] = useState(false);

  const handleGerarPrevisao = async () => {
    setGerando(true);
    const dataPost = new Date(post.data_postagem);
    await preverPerformance({
      clienteId,
      tipo_conteudo: post.tipo_conteudo || 'informar',
      formato_postagem: post.formato_postagem,
      dia_semana: dataPost.getDay(),
      hora: dataPost.getHours(),
      texto_estruturado: post.texto_estruturado
    });
    setGerando(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DialogWrapper
      open={isOpen}
      onOpenChange={onClose}
      title="Previsão de Performance - ML"
      description="Análise preditiva baseada em machine learning e histórico de posts"
      size="lg"
    >
      <div className="space-y-6">
        {!previsao ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <p className="text-muted-foreground mb-6">
              Gere uma previsão de performance para este post usando IA
            </p>
            <Button onClick={handleGerarPrevisao} disabled={gerando} className="gap-2">
              {gerando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando com ML...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar Previsão com IA
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score Geral */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Score de Performance</p>
                    <p className={`text-5xl font-bold ${getScoreColor(previsao.previsao_performance.score_geral)}`}>
                      {previsao.previsao_performance.score_geral}
                      <span className="text-2xl">/100</span>
                    </p>
                    <Badge className="mt-2" variant={previsao.previsao_performance.nivel_confianca === 'alto' ? 'default' : 'secondary'}>
                      Confiança: {previsao.previsao_performance.nivel_confianca}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Comparação com Mercado</p>
                    <div className="flex items-center gap-2">
                      {previsao.comparacao_mercado.acima_media ? (
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      )}
                      <span className="text-2xl font-bold">
                        Percentil {previsao.comparacao_mercado.percentil}
                      </span>
                    </div>
                  </div>
                </div>
                <Progress value={previsao.previsao_performance.score_geral} className="mt-4" />
              </CardContent>
            </Card>

            {/* Métricas Estimadas */}
            <div>
              <h4 className="font-semibold mb-3">📊 Métricas Estimadas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Impressões</p>
                    <p className="text-2xl font-bold text-primary">
                      {previsao.previsao_performance.impressoes_estimadas.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Alcance</p>
                    <p className="text-2xl font-bold text-primary">
                      {previsao.previsao_performance.alcance_estimado.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Engajamento</p>
                    <p className="text-2xl font-bold text-primary">
                      {previsao.previsao_performance.taxa_engajamento_estimada}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Curtidas</p>
                    <p className="text-2xl font-bold text-primary">
                      {previsao.previsao_performance.curtidas_estimadas}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Análise de Fatores */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="p-4">
                  <h5 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Pontos Fortes
                  </h5>
                  <ul className="space-y-2">
                    {previsao.analise_fatores.pontos_fortes.map((ponto, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{ponto}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="p-4">
                  <h5 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Pontos de Atenção
                  </h5>
                  <ul className="space-y-2">
                    {previsao.analise_fatores.pontos_atencao.map((ponto, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-yellow-600">⚠</span>
                        <span>{ponto}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Recomendações */}
            <Card>
              <CardContent className="p-4">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Recomendações Estratégicas
                </h5>
                <ul className="space-y-2">
                  {previsao.recomendacoes.map((rec, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Melhor Horário Alternativo */}
            {previsao.melhor_horario_alternativo && (
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardContent className="p-4">
                  <h5 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Sugestão de Horário Melhor
                  </h5>
                  <p className="text-sm mb-2">
                    <strong>
                      {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][previsao.melhor_horario_alternativo.dia_semana]} às {previsao.melhor_horario_alternativo.hora}:00h
                    </strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {previsao.melhor_horario_alternativo.motivo}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            {previsao.metadata && (
              <div className="text-xs text-muted-foreground border-t pt-3">
                <p>
                  {previsao.metadata.baseado_em_historico 
                    ? `✅ Análise baseada em ${previsao.metadata.total_posts_analisados} posts históricos`
                    : '📊 Análise baseada em benchmarks de mercado'}
                </p>
                {previsao.metadata.tem_dados_horario_especifico && (
                  <p className="mt-1">🎯 Dados específicos disponíveis para este horário</p>
                )}
              </div>
            )}

            <Button onClick={handleGerarPrevisao} variant="outline" className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              Gerar Nova Previsão
            </Button>
          </div>
        )}
      </div>
    </DialogWrapper>
  );
};
