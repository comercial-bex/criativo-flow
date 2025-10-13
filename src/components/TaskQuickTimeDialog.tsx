import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock } from 'lucide-react';

interface TaskQuickTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (hours: number, observation: string) => Promise<void>;
}

export function TaskQuickTimeDialog({ 
  open, 
  onOpenChange, 
  onSave 
}: TaskQuickTimeDialogProps) {
  const [hours, setHours] = useState<number>(0);
  const [observation, setObservation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (hours <= 0) return;

    setIsSaving(true);
    try {
      await onSave(hours, observation);
      setHours(0);
      setObservation('');
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" height="auto">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registrar Tempo Rápido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quick-hours">Horas Trabalhadas</Label>
            <Input
              id="quick-hours"
              type="number"
              min="0"
              step="0.5"
              value={hours || ''}
              onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 2.5"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-obs">Observação (opcional)</Label>
            <Textarea
              id="quick-obs"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="O que foi realizado?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={hours <= 0 || isSaving}
            className="bg-bex hover:bg-bex-light text-black"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
