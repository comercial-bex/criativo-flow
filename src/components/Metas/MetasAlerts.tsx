import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MetaComHistorico } from '@/hooks/useMetasVisualizacao';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MetasAlertsProps {
  metas: MetaComHistorico[];
}

export function MetasAlerts({ metas }: MetasAlertsProps) {
  // Ordenar por criticidade: atrasadas primeiro, depois em risco
  const metasOrdenadas = [...metas].sort((a, b) => {
    if (a.status_calculado === 'atrasada' && b.status_calculado !== 'atrasada') return -1;
    if (a.status_calculado !== 'atrasada' && b.status_calculado === 'atrasada') return 1;
    
    // Se ambas são do mesmo status, ordenar por progresso (menor primeiro)
    return a.progresso_percent - b.progresso_percent;
  });

  // Limitar a 5 alertas
  const alertasExibir = metasOrdenadas.slice(0, 5);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        Atenção Necessária ({metas.length})
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {alertasExibir.map(meta => {
          const isAtrasada = meta.status_calculado === 'atrasada';
          const icon = isAtrasada ? Clock : TrendingDown;
          const IconComponent = icon;

          const prazoVencido = new Date(meta.periodo_fim) < new Date();
          const diasAtraso = prazoVencido 
            ? Math.ceil((new Date().getTime() - new Date(meta.periodo_fim).getTime()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <Alert
              key={meta.id}
              variant={isAtrasada ? 'destructive' : 'default'}
              className={!isAtrasada ? 'border-warning/50 bg-warning/5' : ''}
            >
              <IconComponent className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2 flex-wrap">
                <span>{meta.titulo}</span>
                <Badge 
                  variant="outline" 
                  className={isAtrasada ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-warning/10 text-warning border-warning/20'}
                >
                  {isAtrasada ? 'Atrasada' : 'Em Risco'}
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso: {meta.progresso_percent.toFixed(1)}%</span>
                  <span>Meta: {meta.valor_atual}/{meta.valor_alvo} {meta.unidade}</span>
                </div>
                {diasAtraso && (
                  <p className="text-sm font-medium">
                    ⚠️ {diasAtraso} dia{diasAtraso > 1 ? 's' : ''} de atraso
                  </p>
                )}
                {!prazoVencido && (
                  <p className="text-sm">
                    {meta.tempo_decorrido_percent > meta.progresso_percent && (
                      <>
                        📊 Progresso abaixo do esperado ({(meta.tempo_decorrido_percent - meta.progresso_percent).toFixed(0)}% de diferença)
                      </>
                    )}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          );
        })}
      </div>

      {metas.length > 5 && (
        <p className="text-sm text-muted-foreground text-center">
          + {metas.length - 5} meta{metas.length - 5 > 1 ? 's' : ''} adiciona{metas.length - 5 > 1 ? 'is' : 'l'} necessita{metas.length - 5 > 1 ? 'm' : ''} atenção
        </p>
      )}
    </div>
  );
}
