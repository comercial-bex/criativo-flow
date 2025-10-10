import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHistoricoSalarial } from '@/hooks/useHistoricoSalarial';
import { formatCurrency } from '@/lib/utils';
import { Calendar, TrendingUp, TrendingDown, UserPlus, UserX, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineColaboradorProps {
  colaboradorId: string;
}

export function TimelineColaborador({ colaboradorId }: TimelineColaboradorProps) {
  const { historico, isLoading } = useHistoricoSalarial(colaboradorId);

  const getIconByType = (tipo: string) => {
    const icons: Record<string, any> = {
      admissao: UserPlus,
      promocao: TrendingUp,
      aumento: TrendingUp,
      reducao: TrendingDown,
      desligamento: UserX,
    };
    return icons[tipo] || Briefcase;
  };

  const getColorByType = (tipo: string) => {
    const colors: Record<string, string> = {
      admissao: 'bg-success/10 text-success border-success/20',
      promocao: 'bg-primary/10 text-primary border-primary/20',
      aumento: 'bg-success/10 text-success border-success/20',
      reducao: 'bg-warning/10 text-warning border-warning/20',
      desligamento: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return colors[tipo] || 'bg-muted';
  };

  const getLabelByType = (tipo: string) => {
    const labels: Record<string, string> = {
      admissao: 'Admissão',
      promocao: 'Promoção',
      aumento: 'Aumento',
      reducao: 'Redução',
      desligamento: 'Desligamento',
    };
    return labels[tipo] || tipo;
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Linha do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (historico.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Linha do Tempo
          </CardTitle>
          <CardDescription>Histórico de eventos do colaborador</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Nenhum evento registrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Linha do Tempo
        </CardTitle>
        <CardDescription>Histórico de eventos do colaborador</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historico.map((evento, index) => {
            const Icon = getIconByType(evento.tipo_alteracao);
            return (
              <motion.div
                key={evento.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex gap-4 relative"
              >
                {index !== historico.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                )}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <Badge className={getColorByType(evento.tipo_alteracao)}>
                        {getLabelByType(evento.tipo_alteracao)}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(evento.data_vigencia).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {evento.salario_anterior && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatCurrency(evento.salario_anterior)}
                        </p>
                      )}
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(evento.salario_novo)}
                      </p>
                    </div>
                  </div>
                  {evento.motivo && (
                    <p className="text-sm text-foreground/80 mb-1">
                      <strong>Motivo:</strong> {evento.motivo}
                    </p>
                  )}
                  {evento.justificativa && (
                    <p className="text-sm text-muted-foreground">
                      {evento.justificativa}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
