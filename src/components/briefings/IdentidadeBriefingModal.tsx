import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IdentidadeBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string;
  onTaskCreated?: () => void;
}

export const IdentidadeBriefingModal = ({ open, onOpenChange, projetoId, onTaskCreated }: IdentidadeBriefingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    objetivo: '',
    prazo: '',
    aplicacoes: '',
    observacoes: '',
    incluir_logo: true,
    incluir_paleta: true,
    incluir_tipografia: true,
    incluir_manual: true
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
        titulo: `Identidade Visual: ${formData.titulo}`,
        descricao: JSON.stringify(formData),
        tipo_tarefa: 'identidade',
        setor_responsavel: 'design',
        status: 'todo',
        prioridade: 'alta',
        briefing_obrigatorio: true
      });

      if (error) throw error;

      toast({
        title: "Identidade Visual criada!",
        description: "Tarefa enviada para o setor de Design"
      });

      onTaskCreated?.();
      onOpenChange(false);
      setFormData({
        titulo: '',
        objetivo: '',
        prazo: '',
        aplicacoes: '',
        observacoes: '',
        incluir_logo: true,
        incluir_paleta: true,
        incluir_tipografia: true,
        incluir_manual: true
      });
    } catch (error) {
      console.error('Erro ao criar identidade visual:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a solicitação",
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
          <DialogTitle>🎯 Nova Identidade Visual</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Identidade Visual Completa"
            />
          </div>

          <div>
            <Label htmlFor="objetivo">Objetivo *</Label>
            <Textarea
              id="objetivo"
              value={formData.objetivo}
              onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
              placeholder="Descreva o propósito e contexto da identidade visual"
            />
          </div>

          <div>
            <Label>Escopo do Projeto</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="logo"
                  checked={formData.incluir_logo}
                  onCheckedChange={(checked) => setFormData({ ...formData, incluir_logo: checked as boolean })}
                />
                <Label htmlFor="logo" className="cursor-pointer">Logo / Logotipo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="paleta"
                  checked={formData.incluir_paleta}
                  onCheckedChange={(checked) => setFormData({ ...formData, incluir_paleta: checked as boolean })}
                />
                <Label htmlFor="paleta" className="cursor-pointer">Paleta de Cores</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tipo"
                  checked={formData.incluir_tipografia}
                  onCheckedChange={(checked) => setFormData({ ...formData, incluir_tipografia: checked as boolean })}
                />
                <Label htmlFor="tipo" className="cursor-pointer">Tipografia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manual"
                  checked={formData.incluir_manual}
                  onCheckedChange={(checked) => setFormData({ ...formData, incluir_manual: checked as boolean })}
                />
                <Label htmlFor="manual" className="cursor-pointer">Manual de Identidade</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="prazo">Prazo Desejado</Label>
            <Input
              id="prazo"
              type="date"
              value={formData.prazo}
              onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="aplicacoes">Aplicações Necessárias</Label>
            <Textarea
              id="aplicacoes"
              value={formData.aplicacoes}
              onChange={(e) => setFormData({ ...formData, aplicacoes: e.target.value })}
              placeholder="Ex: Cartão de visita, Papel timbrado, Redes sociais, Site"
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
            {loading ? 'Criando...' : 'Criar Solicitação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
