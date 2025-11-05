import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MetaComHistorico, StatusMeta } from '@/hooks/useMetasVisualizacao';
import { TrendingUp, TrendingDown, Minus, Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetaCardProps {
  meta: MetaComHistorico;
}

const statusConfig: Record<StatusMeta, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  em_dia: { label: 'Em Dia', variant: 'default' },
  em_risco: { label: 'Em Risco', variant: 'secondary' },
  atrasada: { label: 'Atrasada', variant: 'destructive' },
  concluida: { label: 'Concluída', variant: 'outline' },
};

const tipoMetaLabels = {
  vendas: 'Vendas',
  alcance: 'Alcance',
  engajamento: 'Engajamento',
  trafego: 'Tráfego',
};

export function MetaCard({ meta }: MetaCardProps) {
  const statusInfo = statusConfig[meta.status_calculado];
  
  const prazoFormatado = format(new Date(meta.periodo_fim), "dd 'de' MMM, yyyy", { locale: ptBR });
  const diasRestantes = Math.ceil((new Date(meta.periodo_fim).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const variacaoIcon = meta.variacao_semanal && meta.variacao_semanal > 0 
    ? <TrendingUp className="h-4 w-4 text-success" />
    : meta.variacao_semanal && meta.variacao_semanal < 0
    ? <TrendingDown className="h-4 w-4 text-destructive" />
    : <Minus className="h-4 w-4 text-muted-foreground" />;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {tipoMetaLabels[meta.tipo_meta as keyof typeof tipoMetaLabels]}
              </Badge>
              <Badge variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
            </div>
            <CardTitle className="text-lg">{meta.titulo}</CardTitle>
          </div>
          <Target className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
        {meta.descricao && (
          <p className="text-sm text-muted-foreground mt-2">{meta.descricao}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progresso</span>
            <span className="text-muted-foreground">
              {meta.valor_atual} / {meta.valor_alvo} {meta.unidade}
            </span>
          </div>
          <Progress value={meta.progresso_percent} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{meta.progresso_percent.toFixed(1)}% concluído</span>
            {meta.variacao_semanal !== null && (
              <div className="flex items-center gap-1">
                {variacaoIcon}
                <span>
                  {meta.variacao_semanal > 0 ? '+' : ''}
                  {meta.variacao_semanal.toFixed(1)}% esta semana
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tempo Decorrido */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Tempo Decorrido</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{meta.tempo_decorrido_percent.toFixed(0)}%</span>
            </div>
          </div>
          <Progress value={meta.tempo_decorrido_percent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {diasRestantes > 0 
              ? `${diasRestantes} dias restantes` 
              : diasRestantes === 0 
              ? 'Vence hoje!'
              : `${Math.abs(diasRestantes)} dias atrasada`
            } • Prazo: {prazoFormatado}
          </p>
        </div>

        {/* Histórico disponível */}
        {meta.historico && meta.historico.length > 1 && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              {meta.historico.length} registros de progresso
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
