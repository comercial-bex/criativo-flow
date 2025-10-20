import { useState } from 'react';
import { Pessoa } from '@/hooks/usePessoas';
import { StatusValidacao } from '@/hooks/useColaboradorValidation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, CheckCircle, Edit } from 'lucide-react';

interface AlertaDadosIncompletosProps {
  pessoa: Pessoa;
  validacao: StatusValidacao;
  onEditar?: () => void;
  onEditarInline?: () => void;
}

export function AlertaDadosIncompletos({ pessoa, validacao, onEditar, onEditarInline }: AlertaDadosIncompletosProps) {
  const [open, setOpen] = useState(false);

  const statusConfig = {
    completo: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200',
      text: 'text-green-700 dark:text-green-300',
      icon: <CheckCircle className="h-4 w-4" />,
      badgeVariant: 'default' as const,
      badgeClass: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400',
      label: 'Completo'
    },
    incompleto_parcial: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: <AlertTriangle className="h-4 w-4" />,
      badgeVariant: 'secondary' as const,
      badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400',
      label: 'Dados Incompletos'
    },
    incompleto_critico: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200',
      text: 'text-red-700 dark:text-red-300',
      icon: <AlertCircle className="h-4 w-4" />,
      badgeVariant: 'destructive' as const,
      badgeClass: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400',
      label: 'Dados Críticos Faltando'
    }
  };

  const config = statusConfig[validacao.nivel];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Badge 
            variant={config.badgeVariant} 
            className={`${config.badgeClass} cursor-pointer hover:opacity-80 transition-opacity`}
          >
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </Badge>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {config.icon}
              Status de Dados - {pessoa.nome}
            </DialogTitle>
            <DialogDescription>
              Checklist de campos necessários para o cadastro completo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {validacao.faltantes.essenciais.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>🚨 Dados Essenciais Faltando</AlertTitle>
                <AlertDescription>
                  <p className="text-sm mb-2">Estes dados bloqueiam a folha de pagamento:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validacao.faltantes.essenciais.map((campo) => (
                      <li key={campo} className="text-sm">❌ {campo}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validacao.faltantes.importantes.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ Dados Importantes Faltando
                </AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  <p className="text-sm mb-2">Recomendado preencher:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validacao.faltantes.importantes.map((campo) => (
                      <li key={campo} className="text-sm">⚠️ {campo}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validacao.faltantes.bancarios.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">
                  💳 Dados Bancários Faltando
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <p className="text-sm mb-2">Necessários para pagamento:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validacao.faltantes.bancarios.map((campo) => (
                      <li key={campo} className="text-sm">💳 {campo}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validacao.nivel === 'completo' && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">
                  ✅ Cadastro Completo
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Todos os dados necessários foram preenchidos!
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={() => {
                setOpen(false);
                if (onEditarInline) {
                  onEditarInline();
                } else if (onEditar) {
                  onEditar();
                }
              }}
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              Completar Dados
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
