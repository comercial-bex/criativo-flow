import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VTBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string;
  onTaskCreated?: () => void;
  onNeedsCaptacao?: () => void;
}

export const VTBriefingModal = ({ open, onOpenChange, projetoId, onTaskCreated, onNeedsCaptacao }: VTBriefingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    objetivo: '',
    duracao: '',
    roteiro_conceito: '',
    locacoes: '',
    elenco: '',
    observacoes: ''
  });

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.objetivo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos título e objetivo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const briefingData = {
        ...formData,
        needsCaptacao: true
      };

      const { error } = await supabase.from('tarefas_projeto').insert({
        projeto_id: projetoId,
        titulo: `VT: ${formData.titulo}`,
        descricao: JSON.stringify(briefingData),
        tipo_tarefa: 'vt',
        setor_responsavel: 'audiovisual',
        status: 'todo',
        prioridade: 'alta',
        briefing_obrigatorio: true
      });

      if (error) throw error;

      toast({
        title: "VT criado!",
        description: "Tarefa enviada para o setor Audiovisual. Abrindo agendamento de captação..."
      });

      onTaskCreated?.();
      onOpenChange(false);
      
      // VT sempre precisa de captação
      setTimeout(() => {
        onNeedsCaptacao?.();
      }, 500);

      setFormData({
        titulo: '',
        objetivo: '',
        duracao: '',
        roteiro_conceito: '',
        locacoes: '',
        elenco: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao criar VT:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o VT",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🎬 Novo VT (Vídeo)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Vídeo Institucional 2025"
            />
          </div>

          <div>
            <Label htmlFor="objetivo">Objetivo *</Label>
            <Textarea
              id="objetivo"
              value={formData.objetivo}
              onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
              placeholder="Qual o propósito deste vídeo?"
            />
          </div>

          <div>
            <Label htmlFor="duracao">Duração Estimada</Label>
            <Input
              id="duracao"
              value={formData.duracao}
              onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
              placeholder="Ex: 30 segundos, 1 minuto"
            />
          </div>

          <div>
            <Label htmlFor="roteiro">Roteiro/Conceito</Label>
            <Textarea
              id="roteiro"
              value={formData.roteiro_conceito}
              onChange={(e) => setFormData({ ...formData, roteiro_conceito: e.target.value })}
              placeholder="Descreva a ideia principal do vídeo"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="locacoes">Locações Necessárias</Label>
            <Textarea
              id="locacoes"
              value={formData.locacoes}
              onChange={(e) => setFormData({ ...formData, locacoes: e.target.value })}
              placeholder="Ex: Escritório, Externa (parque), Estúdio"
            />
          </div>

          <div>
            <Label htmlFor="elenco">Elenco/Participantes</Label>
            <Textarea
              id="elenco"
              value={formData.elenco}
              onChange={(e) => setFormData({ ...formData, elenco: e.target.value })}
              placeholder="Ex: CEO, 2 atores, narrador"
            />
          </div>

          <div>
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais"
            />
          </div>

          <div className="bg-primary/10 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              🎥 VTs sempre requerem captação audiovisual. O modal de agendamento será aberto automaticamente.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Criando...' : 'Criar VT'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
