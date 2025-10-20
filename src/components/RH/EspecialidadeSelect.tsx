import { useEspecialidades } from '@/hooks/useEspecialidades';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2, AlertCircle } from 'lucide-react';

interface EspecialidadeSelectProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  required?: boolean;
  showPermissionInfo?: boolean;
  error?: string;
}

export function EspecialidadeSelect({ 
  value, 
  onChange, 
  required = false,
  showPermissionInfo = true,
  error
}: EspecialidadeSelectProps) {
  const { data: especialidades = [], isLoading, error: fetchError } = useEspecialidades();
  
  const selectedEspecialidade = especialidades.find(e => e.id === value);

  // Show error state
  if (fetchError) {
    return (
      <div className="space-y-2">
        <Label htmlFor="especialidade_id">
          Especialidade/Cargo {required && <span className="text-destructive">*</span>}
        </Label>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar especialidades. Por favor, recarregue a página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="especialidade_id">
        Especialidade/Cargo {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        value={value ?? undefined}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando especialidades...</span>
            </div>
          ) : (
            <SelectValue placeholder="Selecione a especialidade" />
          )}
        </SelectTrigger>
        <SelectContent>
          {especialidades.map((especialidade) => (
            <SelectItem key={especialidade.id} value={especialidade.id}>
              <div className="flex items-center gap-2">
                <span>{especialidade.icone}</span>
                <span>{especialidade.nome}</span>
                {especialidade.nome === 'Não Definido' && (
                  <span className="text-xs text-muted-foreground">(padrão)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {selectedEspecialidade && showPermissionInfo && selectedEspecialidade.nome !== 'Não Definido' && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="text-xs text-blue-800 dark:text-blue-200">
              Ao salvar, as permissões de <Badge 
                variant="secondary" 
                className="inline-flex mx-1"
                style={{ backgroundColor: `${selectedEspecialidade.cor}20`, color: selectedEspecialidade.cor }}
              >
                {selectedEspecialidade.role_sistema.toUpperCase()}
              </Badge> serão aplicadas automaticamente no sistema.
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Define o papel no sistema e as permissões de acesso
      </p>
    </div>
  );
}
