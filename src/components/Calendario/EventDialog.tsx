import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventMutations } from '@/hooks/useEventMutations';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento?: any;
  isCreating?: boolean;
}

export const EventDialog = ({ open, onOpenChange, evento, isCreating = false }: EventDialogProps) => {
  const { updateEvento, deleteEvento, isUpdating, isDeleting } = useEventMutations();
  
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'reuniao',
    data_inicio: '',
    data_fim: '',
    local: '',
  });

  useEffect(() => {
    if (evento && !isCreating) {
      setFormData({
        titulo: evento.titulo || '',
        tipo: evento.tipo || 'reuniao',
        data_inicio: evento.data_inicio ? new Date(evento.data_inicio).toISOString().slice(0, 16) : '',
        data_fim: evento.data_fim ? new Date(evento.data_fim).toISOString().slice(0, 16) : '',
        local: evento.local || '',
      });
    } else {
      setFormData({
        titulo: '',
        tipo: 'reuniao',
        data_inicio: '',
        data_fim: '',
        local: '',
      });
    }
  }, [evento, isCreating]);

  const handleSave = () => {
    if (!evento?.id) return;

    updateEvento({
      id: evento.id,
      updates: {
        titulo: formData.titulo,
        tipo: formData.tipo,
        data_inicio: new Date(formData.data_inicio).toISOString(),
        data_fim: new Date(formData.data_fim).toISOString(),
        local: formData.local || null,
      }
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!evento?.id) return;
    
    if (confirm('Tem certeza que deseja deletar este evento?')) {
      deleteEvento(evento.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreating ? "Criar Evento" : "Detalhes do Evento"}</DialogTitle>
          <DialogDescription>
            {isCreating ? "Adicione um novo evento ao calendário" : "Visualize e edite os detalhes do evento"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Título do evento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="criacao_avulso">Criação Avulso</SelectItem>
                <SelectItem value="criacao_lote">Criação Lote</SelectItem>
                <SelectItem value="edicao_curta">Edição Curta</SelectItem>
                <SelectItem value="edicao_longa">Edição Longa</SelectItem>
                <SelectItem value="captacao_interna">Captação Interna</SelectItem>
                <SelectItem value="captacao_externa">Captação Externa</SelectItem>
                <SelectItem value="planejamento">Planejamento</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
                <SelectItem value="deslocamento">Deslocamento</SelectItem>
                <SelectItem value="preparacao">Preparação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data/Hora Início</Label>
              <Input
                id="data_inicio"
                type="datetime-local"
                value={formData.data_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_fim">Data/Hora Fim</Label>
              <Input
                id="data_fim"
                type="datetime-local"
                value={formData.data_fim}
                onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              value={formData.local}
              onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
              placeholder="Local do evento"
            />
          </div>
        </div>

        <DialogFooter>
          {!isCreating && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUpdating || isCreating}
          >
            {isUpdating ? 'Salvando...' : isCreating ? 'Criar' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
