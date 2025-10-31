import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientMetas } from '@/hooks/useClientMetas';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ClienteMetasProgressProps {
  clienteId: string;
}

const tipoMetaLabel: Record<string, string> = {
  vendas: 'Vendas',
  alcance: 'Alcance',
  engajamento: 'Engajamento',
  trafego: 'Tráfego'
};

const tipoMetaIcon: Record<string, string> = {
  vendas: '💰',
  alcance: '📢',
  engajamento: '❤️',
  trafego: '🚀'
};

export function ClienteMetasProgress({ clienteId }: ClienteMetasProgressProps) {
  const { metas, loading } = useClientMetas(clienteId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metasAtivas = metas.filter(m => m.status === 'em_andamento');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Metas do Cliente
        </CardTitle>
        <CardDescription>
          Acompanhamento de objetivos e KPIs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metasAtivas.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma meta ativa encontrada</p>
            </div>
          ) : (
            metasAtivas.map((meta) => {
              const periodoInicio = new Date(meta.periodo_inicio);
              const periodoFim = new Date(meta.periodo_fim);
              const diasRestantes = Math.ceil((periodoFim.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const estaAtrasado = meta.progresso_percent < 50 && diasRestantes < 15;

              return (
                <div
                  key={meta.id}
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{tipoMetaIcon[meta.tipo_meta]}</span>
                        <h4 className="font-semibold text-sm">{meta.titulo}</h4>
                        <Badge variant={estaAtrasado ? 'destructive' : 'default'} className="text-xs">
                          {tipoMetaLabel[meta.tipo_meta]}
                        </Badge>
                      </div>
                      {meta.descricao && (
                        <p className="text-xs text-muted-foreground mb-2">{meta.descricao}</p>
                      )}
                    </div>
                    {estaAtrasado && (
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{meta.progresso_percent.toFixed(0)}%</span>
                    </div>
                    <Progress value={meta.progresso_percent} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">Atual: </span>
                      <span className="font-medium">
                        {meta.valor_atual.toLocaleString('pt-BR')} {meta.unidade}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Meta: </span>
                      <span className="font-medium">
                        {meta.valor_alvo.toLocaleString('pt-BR')} {meta.unidade}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">
                      {periodoInicio.toLocaleDateString('pt-BR')} - {periodoFim.toLocaleDateString('pt-BR')}
                    </span>
                    <span className={diasRestantes < 7 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Prazo expirado'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
