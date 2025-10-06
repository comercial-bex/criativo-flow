import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CarrosselBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string;
  onTaskCreated?: () => void;
  onNeedsCaptacao?: () => void;
}

export const CarrosselBriefingModal = ({ open, onOpenChange, projetoId, onTaskCreated, onNeedsCaptacao }: CarrosselBriefingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [needsCaptacao, setNeedsCaptacao] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    objetivo: '',
    num_slides: '5',
    publico_alvo: '',
    mensagem_chave: '',
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
        titulo: `Carrossel: ${formData.titulo}`,
        descricao: JSON.stringify(briefingData),
        tipo_tarefa: 'carrossel',
        setor_responsavel: 'design',
        status: 'todo',
        prioridade: 'alta',
        briefing_obrigatorio: true
      });

      if (error) throw error;

      toast({
        title: "Carrossel criado!",
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
        num_slides: '5',
        publico_alvo: '',
        mensagem_chave: '',
        cores: '',
        observacoes: ''
      });
      setNeedsCaptacao(false);
    } catch (error) {
      console.error('Erro ao criar carrossel:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o carrossel",
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
          <DialogTitle>📚 Novo Carrossel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: 5 Dicas para Empreendedores"
            />
          </div>

          <div>
            <Label htmlFor="objetivo">Objetivo *</Label>
            <Textarea
              id="objetivo"
              value={formData.objetivo}
              onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
              placeholder="Qual o propósito deste carrossel?"
            />
          </div>

          <div>
            <Label htmlFor="slides">Número de Slides</Label>
            <Select value={formData.num_slides} onValueChange={(value) => setFormData({ ...formData, num_slides: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={String(num)}>{num} slides</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="publico">Público-Alvo</Label>
            <Input
              id="publico"
              value={formData.publico_alvo}
              onChange={(e) => setFormData({ ...formData, publico_alvo: e.target.value })}
              placeholder="Ex: Empreendedores iniciantes"
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
            <Label htmlFor="cores">Cores Sugeridas</Label>
            <Input
              id="cores"
              value={formData.cores}
              onChange={(e) => setFormData({ ...formData, cores: e.target.value })}
              placeholder="Ex: Verde, Branco, Preto"
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
            {loading ? 'Criando...' : 'Criar Carrossel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
