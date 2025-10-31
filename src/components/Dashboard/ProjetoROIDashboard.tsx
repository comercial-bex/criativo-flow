import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinanceiroProjetoMetrics } from '@/hooks/useFinanceiroProjetoMetrics';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface ProjetoROIDashboardProps {
  projetoId?: string;
  limit?: number;
}

export function ProjetoROIDashboard({ projetoId, limit = 10 }: ProjetoROIDashboardProps) {
  const { data: projetos, isLoading } = useFinanceiroProjetoMetrics(projetoId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const projetosExibir = projetos?.slice(0, limit) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          ROI por Projeto
        </CardTitle>
        <CardDescription>
          Análise de retorno sobre investimento e margem de lucro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projetosExibir.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum projeto com dados financeiros encontrado
            </p>
          ) : (
            projetosExibir.map((projeto) => (
              <div
                key={projeto.projeto_id}
                className="flex items-start justify-between p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-all"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{projeto.projeto_nome}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{projeto.cliente_nome}</p>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground">Receita:</span>
                      <span className="font-medium">
                        R$ {projeto.total_receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Custo:</span>
                      <span className="font-medium">
                        R$ {projeto.total_custos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant={projeto.roi_percentual >= 20 ? 'default' : 'secondary'} className="gap-1">
                    {projeto.roi_percentual >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    ROI {projeto.roi_percentual.toFixed(1)}%
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Margem: <span className="font-medium">{projeto.margem_liquida.toFixed(2)}</span>
                  </div>
                  <div className="text-xs">
                    Transações: <span className="font-medium">{projeto.total_transacoes}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
