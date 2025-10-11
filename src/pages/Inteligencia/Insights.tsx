import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface Insight {
  id: string;
  tipo: 'oportunidade' | 'alerta' | 'sucesso' | 'tendencia';
  titulo: string;
  descricao: string;
  impacto: 'alto' | 'medio' | 'baixo';
  categoria: string;
  dataGeracao: Date;
}

export default function Insights() {
  const insights: Insight[] = [
    {
      id: '1',
      tipo: 'oportunidade',
      titulo: 'Potencial de Upsell Identificado',
      descricao:
        '3 clientes com padrão de consumo similar aos que contrataram planos premium',
      impacto: 'alto',
      categoria: 'Comercial',
      dataGeracao: new Date(),
    },
    {
      id: '2',
      tipo: 'alerta',
      titulo: 'Risco de Churn Detectado',
      descricao:
        '2 clientes sem engajamento nos últimos 30 dias - ação recomendada',
      impacto: 'alto',
      categoria: 'Retenção',
      dataGeracao: new Date(),
    },
    {
      id: '3',
      tipo: 'tendencia',
      titulo: 'Aumento de Demanda por Vídeo',
      descricao:
        'Crescimento de 45% nas solicitações de conteúdo audiovisual',
      impacto: 'medio',
      categoria: 'Produção',
      dataGeracao: new Date(),
    },
    {
      id: '4',
      tipo: 'sucesso',
      titulo: 'Meta de Produtividade Atingida',
      descricao: 'Equipe de design superou a meta mensal em 15%',
      impacto: 'medio',
      categoria: 'Performance',
      dataGeracao: new Date(),
    },
  ];

  const getInsightIcon = (tipo: Insight['tipo']) => {
    switch (tipo) {
      case 'oportunidade':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'alerta':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'tendencia':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'sucesso':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getImpactoBadge = (impacto: Insight['impacto']) => {
    const variants = {
      alto: 'destructive',
      medio: 'default',
      baixo: 'secondary',
    } as const;

    return (
      <Badge variant={variants[impacto]}>
        Impacto {impacto.charAt(0).toUpperCase() + impacto.slice(1)}
      </Badge>
    );
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Insights Inteligentes</h1>
          <p className="text-muted-foreground">
            Recomendações e descobertas baseadas em dados
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.tipo)}
                    <div>
                      <CardTitle className="text-lg">{insight.titulo}</CardTitle>
                      <CardDescription className="mt-1">
                        {insight.categoria}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{insight.descricao}</p>
                <div className="flex items-center justify-between">
                  {getImpactoBadge(insight.impacto)}
                  <span className="text-xs text-muted-foreground">
                    Gerado hoje
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {insights.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum insight disponível no momento
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveLayout>
  );
}
