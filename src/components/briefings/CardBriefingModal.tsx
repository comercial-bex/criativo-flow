import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CardBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string;
  onTaskCreated?: () => void;
  onNeedsCaptacao?: () => void;
}

export const CardBriefingModal = ({ open, onOpenChange, projetoId, onTaskCreated, onNeedsCaptacao }: CardBriefingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [needsCaptacao, setNeedsCaptacao] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    objetivo: '',
    publico_alvo: '',
    mensagem_chave: '',
    dimensoes: '',
    cores: '',
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
        needsCaptacao
      };

      const { error } = await supabase.from('tarefas_projeto').insert({
        projeto_id: projetoId,
        titulo: `Card: ${formData.titulo}`,
        descricao: JSON.stringify(briefingData),
        tipo_tarefa: 'card',
        setor_responsavel: 'design',
        status: 'todo',
        prioridade: 'alta',
        briefing_obrigatorio: true
      });

      if (error) throw error;

      toast({
        title: "Card criado!",
        description: "Tarefa enviada para o setor de Design"
      });

      onTaskCreated?.();
      
      if (needsCaptacao) {
        onNeedsCaptacao?.();
      }

      onOpenChange(false);
      setFormData({
        titulo: '',
        objetivo: '',
        publico_alvo: '',
        mensagem_chave: '',
        dimensoes: '',
        cores: '',
        observacoes: ''
      });
      setNeedsCaptacao(false);
    } catch (error) {
      console.error('Erro ao criar card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o card",
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
          <DialogTitle>🖼️ Novo Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Promoção Black Friday"
            />
          </div>

          <div>
            <Label htmlFor="objetivo">Objetivo *</Label>
            <Textarea
              id="objetivo"
              value={formData.objetivo}
              onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
              placeholder="Qual o propósito deste card?"
            />
          </div>

          <div>
            <Label htmlFor="publico">Público-Alvo</Label>
            <Input
              id="publico"
              value={formData.publico_alvo}
              onChange={(e) => setFormData({ ...formData, publico_alvo: e.target.value })}
              placeholder="Ex: Jovens 18-25 anos"
            />
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem-Chave</Label>
            <Textarea
              id="mensagem"
              value={formData.mensagem_chave}
              onChange={(e) => setFormData({ ...formData, mensagem_chave: e.target.value })}
              placeholder="Principal mensagem a ser comunicada"
            />
          </div>

          <div>
            <Label htmlFor="dimensoes">Dimensões</Label>
            <Input
              id="dimensoes"
              value={formData.dimensoes}
              onChange={(e) => setFormData({ ...formData, dimensoes: e.target.value })}
              placeholder="Ex: 1080x1080 (Instagram Feed)"
            />
          </div>

          <div>
            <Label htmlFor="cores">Cores Sugeridas</Label>
            <Input
              id="cores"
              value={formData.cores}
              onChange={(e) => setFormData({ ...formData, cores: e.target.value })}
              placeholder="Ex: Azul, Branco, Dourado"
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="captacao"
              checked={needsCaptacao}
              onCheckedChange={(checked) => setNeedsCaptacao(checked as boolean)}
            />
            <Label htmlFor="captacao" className="cursor-pointer">
              Precisa de captação de imagens/vídeos
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
