import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProdutividadeInsights } from "@/hooks/useProdutividadeInsights";
import { Brain, Clock, Zap, RefreshCw } from "lucide-react";

interface InsightsIAProps {
  setor: 'grs' | 'design' | 'audiovisual';
}

export function InsightsIA({ setor }: InsightsIAProps) {
  const { insights, loading, gerarNovaPrevisao } = useProdutividadeInsights(setor);

  const handleGerar = async () => {
    await gerarNovaPrevisao();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Insights Preditivos
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={handleGerar}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!insights ? (
          <div className="text-center py-8 space-y-3">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              Gere insights baseados nos seus dados de produtividade
            </p>
            <Button onClick={handleGerar} variant="outline">
              Gerar Análise com IA
            </Button>
          </div>
        ) : (
          <>
            {/* Horários Ideais */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Horários Ideais de Foco</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.horarios_ideais?.map((horario, idx) => (
                  <Badge key={idx} variant="secondary">
                    {horario}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Energia Média */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Energia Média</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-green-500"
                    style={{ width: `${insights.energia_media}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{insights.energia_media}%</span>
              </div>
            </div>

            {/* Recomendações */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Recomendação:</strong>
                <br />
                {insights.recomendacoes}
              </p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Atualizado em: {new Date(insights.data_analise).toLocaleString('pt-BR')}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
