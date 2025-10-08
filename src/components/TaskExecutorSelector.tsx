// BEX 3.0 - Seletor de Executor para Tarefas

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useEspecialistas } from '@/hooks/useEspecialistas';
import { Clapperboard, Palette } from 'lucide-react';

interface TaskExecutorSelectorProps {
  executorArea?: string | null;
  executorId?: string | null;
  prazoExecutor?: string | null;
  onExecutorAreaChange: (area: string) => void;
  onExecutorIdChange: (id: string) => void;
  onPrazoChange: (prazo: string) => void;
  disabled?: boolean;
}

export function TaskExecutorSelector({
  executorArea,
  executorId,
  prazoExecutor,
  onExecutorAreaChange,
  onExecutorIdChange,
  onPrazoChange,
  disabled = false
}: TaskExecutorSelectorProps) {
  const { data: especialistas, isLoading } = useEspecialistas();

  const handleAreaChange = (area: string) => {
    onExecutorAreaChange(area);
    onExecutorIdChange(''); // Reset executor ao mudar área
  };

  const filteredEspecialistas = especialistas?.filter(e => {
    if (!executorArea) return false;
    if (executorArea === 'Audiovisual') {
      return ['audiovisual', 'filmmaker'].includes(e.especialidade);
    }
    return e.especialidade === 'design';
  });

  return (
    <div className="space-y-3">
      <div>
        <Label>Área do Executor</Label>
        <Select
          value={executorArea || ''}
          onValueChange={handleAreaChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Audiovisual">
              <div className="flex items-center gap-2">
                <Clapperboard className="h-4 w-4" />
                Audiovisual
              </div>
            </SelectItem>
            <SelectItem value="Criativo">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Criativo
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {executorArea && (
        <>
          <div>
            <Label>Especialista Executor</Label>
            <Select
              value={executorId || ''}
              onValueChange={onExecutorIdChange}
              disabled={disabled || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o especialista" />
              </SelectTrigger>
              <SelectContent>
                {filteredEspecialistas?.map(e => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome} ({e.especialidade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Prazo do Executor</Label>
            <Input
              type="datetime-local"
              value={prazoExecutor ? new Date(prazoExecutor).toISOString().slice(0, 16) : ''}
              onChange={(e) => onPrazoChange(e.target.value)}
              disabled={disabled}
            />
          </div>
        </>
      )}
    </div>
  );
}
