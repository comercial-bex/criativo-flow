import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Conflito } from '@/hooks/useConflictDetection';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConflictAlertProps {
  conflitos: Conflito[];
  className?: string;
}

export const ConflictAlert = ({ conflitos, className }: ConflictAlertProps) => {
  if (conflitos.length === 0) return null;

  const conflitosAlta = conflitos.filter(c => c.severidade === 'alta');
  const conflitosMedia = conflitos.filter(c => c.severidade === 'media');

  return (
    <div className={cn('space-y-3', className)}>
      {conflitosAlta.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">
            {conflitosAlta.length} Conflito{conflitosAlta.length > 1 ? 's' : ''} Crítico{conflitosAlta.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            {conflitosAlta.map((conflito, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {conflito.responsavel}
                  </p>
                  <p className="text-xs mt-1">{conflito.mensagem}</p>
                  {conflito.tipo === 'sobreposicao' && (
                    <div className="mt-2 space-y-1">
                      {conflito.eventos.map(evento => (
                        <div key={evento.id} className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{evento.titulo}</span>
                          <span className="text-muted-foreground">
                            {format(parseISO(evento.data_inicio), 'HH:mm', { locale: ptBR })} - 
                            {format(parseISO(evento.data_fim), 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Badge variant="destructive" className="text-xs">
                  {conflito.tipo === 'sobreposicao' ? 'Sobreposição' : 'Sobrecarga'}
                </Badge>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {conflitosMedia.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="font-bold text-yellow-900 dark:text-yellow-200">
            {conflitosMedia.length} Alerta{conflitosMedia.length > 1 ? 's' : ''} de Sobrecarga
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2 text-yellow-800 dark:text-yellow-300">
            {conflitosMedia.slice(0, 3).map((conflito, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">{conflito.responsavel}</span>
                </div>
                <span className="text-xs">{conflito.mensagem}</span>
              </div>
            ))}
            {conflitosMedia.length > 3 && (
              <p className="text-xs italic">
                + {conflitosMedia.length - 3} outro{conflitosMedia.length - 3 > 1 ? 's' : ''} alerta{conflitosMedia.length - 3 > 1 ? 's' : ''}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
