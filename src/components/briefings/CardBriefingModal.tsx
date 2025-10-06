import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { smartToast } from '@/lib/smart-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDraft } from '@/hooks/useDraft';
import { useQueryClient } from '@tanstack/react-query';

interface CardBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string;
  onTaskCreated?: () => void;
  onNeedsCaptacao?: () => void;
}

export const CardBriefingModal = ({ open, onOpenChange, projetoId, onTaskCreated, onNeedsCaptacao }: CardBriefingModalProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [needsCaptacao, setNeedsCaptacao] = useState(false);
  
  const initialFormData = {
    titulo: '',
    objetivo: '',
    publico_alvo: '',
    mensagem_chave: '',
    dimensoes: '',
    cores: '',
    observacoes: ''
  };

  const { draft, setDraft, clearDraft } = useDraft(`card-briefing-${projetoId}`, initialFormData);
  const [formData, setFormData] = useState(draft);

  useEffect(() => {
    setDraft(formData);
  }, [formData, setDraft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.objetivo) {
      smartToast.error("Campos obrigatórios", "Preencha pelo menos título e objetivo");
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

      smartToast.success("Card criado!", "Tarefa enviada para o setor de Design");

      queryClient.invalidateQueries({ queryKey: ['tarefas', projetoId] });
      queryClient.invalidateQueries({ queryKey: ['briefings', projetoId] });

      onTaskCreated?.();
      
      if (needsCaptacao) {
        onNeedsCaptacao?.();
      }

      clearDraft();
      setFormData(initialFormData);
      setNeedsCaptacao(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar card:', error);
      smartToast.error("Erro", "Não foi possível criar o card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" forceMount>
        <DialogHeader>
          <DialogTitle>🖼️ Novo Card</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
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

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};