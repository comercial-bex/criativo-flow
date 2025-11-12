import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, X, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlanejamentoCampanha } from '@/hooks/useDatasComemoratias';

interface CampanhaCardProps {
  campanha: PlanejamentoCampanha;
  onRemove: (id: string) => void;
}

export function CampanhaCard({ campanha, onRemove }: CampanhaCardProps) {
  const getEngajamentoBadge = (nivel: string) => {
    switch (nivel) {
      case 'alto':
        return <Badge className="bg-green-500 text-white">⭐ Alto Engajamento</Badge>;
      case 'medio':
        return <Badge variant="secondary">📊 Médio Engajamento</Badge>;
      case 'baixo':
        return <Badge variant="outline">📉 Baixo Engajamento</Badge>;
      default:
        return null;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'nacional':
        return <Badge variant="default">🇧🇷 Nacional</Badge>;
      case 'regional':
        return <Badge variant="secondary">📍 Regional</Badge>;
      case 'segmento':
        return <Badge variant="outline">🎯 Segmento</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{campanha.nome_campanha}</h4>
              {campanha.data_comemorativa && getTipoBadge(campanha.data_comemorativa.tipo)}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(campanha.data_inicio), 'dd MMM', { locale: ptBR })} - {format(new Date(campanha.data_fim), 'dd MMM', { locale: ptBR })}
              </span>
              
              {campanha.data_comemorativa && getEngajamentoBadge(campanha.data_comemorativa.potencial_engajamento)}
            </div>

            {campanha.data_comemorativa?.sugestao_campanha && (
              <p className="text-sm text-muted-foreground">
                💡 {campanha.data_comemorativa.sugestao_campanha}
              </p>
            )}

            {(campanha.periodo_pre_campanha > 0 || campanha.periodo_pos_campanha > 0) && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {campanha.periodo_pre_campanha > 0 && (
                  <span>📅 Pré: {campanha.periodo_pre_campanha} dias</span>
                )}
                {campanha.periodo_pos_campanha > 0 && (
                  <span>📅 Pós: {campanha.periodo_pos_campanha} dias</span>
                )}
              </div>
            )}

            {campanha.orcamento_sugerido && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Orçamento sugerido: R$ {campanha.orcamento_sugerido.toFixed(2)}
              </div>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRemove(campanha.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
