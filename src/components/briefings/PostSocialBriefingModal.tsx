import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PostSocialBriefingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string;
  onTaskCreated?: () => void;
}

export const PostSocialBriefingModal = ({ open, onOpenChange, projetoId, onTaskCreated }: PostSocialBriefingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    plataforma: 'instagram',
    formato: 'feed',
    legenda: '',
    hashtags: '',
    cta: '',
    observacoes: ''
  });

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.legenda) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos título e legenda",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('tarefas_projeto').insert({
        projeto_id: projetoId,
        titulo: `Post Social: ${formData.titulo}`,
        descricao: JSON.stringify(formData),
        tipo_tarefa: 'post_social',
        setor_responsavel: 'grs',
        status: 'todo',
        prioridade: 'media',
        briefing_obrigatorio: true
      });

      if (error) throw error;

      toast({
        title: "Post Social criado!",
        description: "Tarefa enviada para o setor de GRS"
      });

      onTaskCreated?.();
      onOpenChange(false);
      setFormData({
        titulo: '',
        plataforma: 'instagram',
        formato: 'feed',
        legenda: '',
        hashtags: '',
        cta: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao criar post social:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o post",
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
          <DialogTitle>📱 Novo Post Social</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Post Lançamento Produto"
            />
          </div>

          <div>
            <Label htmlFor="plataforma">Plataforma</Label>
            <Select value={formData.plataforma} onValueChange={(value) => setFormData({ ...formData, plataforma: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="formato">Formato</Label>
            <Select value={formData.formato} onValueChange={(value) => setFormData({ ...formData, formato: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">Feed</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="reels">Reels</SelectItem>
                <SelectItem value="carrossel">Carrossel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="legenda">Legenda *</Label>
            <Textarea
              id="legenda"
              value={formData.legenda}
              onChange={(e) => setFormData({ ...formData, legenda: e.target.value })}
              placeholder="Texto da legenda do post"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="Ex: #marketing #digital #tendencias"
            />
          </div>

          <div>
            <Label htmlFor="cta">Call-to-Action (CTA)</Label>
            <Input
              id="cta"
              value={formData.cta}
              onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
              placeholder="Ex: Saiba mais, Compre agora, Acesse o link"
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
            {loading ? 'Criando...' : 'Criar Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
