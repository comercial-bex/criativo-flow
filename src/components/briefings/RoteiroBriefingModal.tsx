import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RoteiroBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string;
  onTaskCreated?: () => void;
}

export const RoteiroBriefingModal = ({ open, onOpenChange, projetoId, onTaskCreated }: RoteiroBriefingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    objetivo: '',
    formato: 'video',
    duracao: '',
    tom_voz: '',
    referencias: '',
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
      const { error } = await supabase.from('tarefas_projeto').insert({
        projeto_id: projetoId,
        titulo: `Roteiro: ${formData.titulo}`,
        descricao: JSON.stringify(formData),
        tipo_tarefa: 'roteiro',
        setor_responsavel: 'grs',
        status: 'todo',
        prioridade: 'media',
        briefing_obrigatorio: true
      });

      if (error) throw error;

      toast({
        title: "Roteiro criado!",
        description: "Tarefa enviada para o setor de GRS"
      });

      onTaskCreated?.();
      onOpenChange(false);
      setFormData({
        titulo: '',
        objetivo: '',
        formato: 'video',
        duracao: '',
        tom_voz: '',
        referencias: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao criar roteiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o roteiro",
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
          <DialogTitle>📝 Novo Roteiro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Roteiro Podcast Episódio 5"
            />
          </div>

          <div>
            <Label htmlFor="objetivo">Objetivo *</Label>
            <Textarea
              id="objetivo"
              value={formData.objetivo}
              onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
              placeholder="Qual o propósito deste roteiro?"
            />
          </div>

          <div>
            <Label htmlFor="formato">Formato</Label>
            <Select value={formData.formato} onValueChange={(value) => setFormData({ ...formData, formato: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="audio">Áudio/Podcast</SelectItem>
                <SelectItem value="texto">Texto/Blog</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duracao">Duração/Extensão</Label>
            <Input
              id="duracao"
              value={formData.duracao}
              onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
              placeholder="Ex: 15 minutos, 500 palavras"
            />
          </div>

          <div>
            <Label htmlFor="tom">Tom de Voz</Label>
            <Input
              id="tom"
              value={formData.tom_voz}
              onChange={(e) => setFormData({ ...formData, tom_voz: e.target.value })}
              placeholder="Ex: Informal, Técnico, Motivacional"
            />
          </div>

          <div>
            <Label htmlFor="referencias">Referências</Label>
            <Textarea
              id="referencias"
              value={formData.referencias}
              onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
              placeholder="Links, exemplos ou inspirações"
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Roteiro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
