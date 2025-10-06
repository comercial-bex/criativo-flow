import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LogoBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string;
  onTaskCreated?: () => void;
}

export const LogoBriefingModal = ({ open, onOpenChange, projetoId, onTaskCreated }: LogoBriefingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    nome_marca: '',
    valores: '',
    cores_sugeridas: '',
    estilos: '',
    referencias: '',
    observacoes: ''
  });

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.nome_marca) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos título e nome da marca",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('tarefas_projeto').insert({
        projeto_id: projetoId,
        titulo: `Logo: ${formData.titulo}`,
        descricao: JSON.stringify(formData),
        tipo_tarefa: 'logo',
        setor_responsavel: 'design',
        status: 'todo',
        prioridade: 'alta',
        briefing_obrigatorio: true
      });

      if (error) throw error;

      toast({
        title: "Logo criado!",
        description: "Tarefa enviada para o setor de Design"
      });

      onTaskCreated?.();
      onOpenChange(false);
      setFormData({
        titulo: '',
        nome_marca: '',
        valores: '',
        cores_sugeridas: '',
        estilos: '',
        referencias: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao criar logo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a solicitação de logo",
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
          <DialogTitle>🎨 Nova Logo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Logo Principal da Marca"
            />
          </div>

          <div>
            <Label htmlFor="marca">Nome da Marca *</Label>
            <Input
              id="marca"
              value={formData.nome_marca}
              onChange={(e) => setFormData({ ...formData, nome_marca: e.target.value })}
              placeholder="Nome completo da marca"
            />
          </div>

          <div>
            <Label htmlFor="valores">Valores da Marca</Label>
            <Textarea
              id="valores"
              value={formData.valores}
              onChange={(e) => setFormData({ ...formData, valores: e.target.value })}
              placeholder="Ex: Inovação, Confiabilidade, Sustentabilidade"
            />
          </div>

          <div>
            <Label htmlFor="cores">Cores Sugeridas</Label>
            <Input
              id="cores"
              value={formData.cores_sugeridas}
              onChange={(e) => setFormData({ ...formData, cores_sugeridas: e.target.value })}
              placeholder="Ex: Azul royal, Branco, Cinza"
            />
          </div>

          <div>
            <Label htmlFor="estilos">Estilos Desejados</Label>
            <Input
              id="estilos"
              value={formData.estilos}
              onChange={(e) => setFormData({ ...formData, estilos: e.target.value })}
              placeholder="Ex: Minimalista, Moderno, Corporativo"
            />
          </div>

          <div>
            <Label htmlFor="referencias">Referências</Label>
            <Textarea
              id="referencias"
              value={formData.referencias}
              onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
              placeholder="Links de logos que servem de inspiração"
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
