import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket, Loader2, Instagram, Facebook, Linkedin, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

interface PublicacaoAutomaticaProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  clienteId: string;
}

export const PublicacaoAutomatica = ({ isOpen, onClose, post, clienteId }: PublicacaoAutomaticaProps) => {
  const [loading, setLoading] = useState(false);
  const [plataformas, setPlataformas] = useState<string[]>([]);

  const handleTogglePlataforma = (plataforma: string) => {
    setPlataformas(prev =>
      prev.includes(plataforma)
        ? prev.filter(p => p !== plataforma)
        : [...prev, plataforma]
    );
  };

  const handleAgendar = async () => {
    if (plataformas.length === 0) {
      toast.error('Selecione ao menos uma plataforma');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('publicacao_queue')
        .insert({
          post_id: post.id,
          cliente_id: clienteId,
          plataformas,
          data_agendamento: post.data_postagem,
          texto_publicacao: post.texto_estruturado || post.texto_ia,
          imagem_url: post.arquivo_visual_url,
          status: 'pendente'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`✅ Publicação agendada para ${plataformas.length} plataforma(s)!`);
      
      // Atualizar status do post
      await supabase
        .from('posts_planejamento')
        .update({ status_post: 'agendado' })
        .eq('id', post.id);

      onClose();
    } catch (error: any) {
      console.error('Erro ao agendar publicação:', error);
      toast.error('Erro ao agendar publicação automática');
    } finally {
      setLoading(false);
    }
  };

  const plataformasDisponiveis = [
    { id: 'instagram', nome: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'facebook', nome: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'linkedin', nome: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Publicação Automática Agendada
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecione as plataformas onde deseja publicar automaticamente
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview do Post */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">
                    {post.formato_postagem} - {post.tipo_conteudo}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {post.texto_estruturado?.substring(0, 150) || 'Sem texto definido'}...
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    📅 Agendado para: {new Date(post.data_postagem).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Plataformas */}
          <div>
            <h4 className="font-semibold mb-4">Selecione as Plataformas:</h4>
            <div className="space-y-3">
              {plataformasDisponiveis.map((plat) => {
                const Icon = plat.icon;
                const isSelected = plataformas.includes(plat.id);
                
                return (
                  <Card
                    key={plat.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleTogglePlataforma(plat.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleTogglePlataforma(plat.id)}
                        />
                        <Icon className={`h-6 w-6 ${plat.color}`} />
                        <Label className="flex-1 cursor-pointer font-medium">
                          {plat.nome}
                        </Label>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Como funciona:</strong> O post será publicado automaticamente nas plataformas selecionadas 
              no horário agendado. Você receberá uma notificação quando a publicação for concluída.
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleAgendar}
              disabled={loading || plataformas.length === 0}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Agendar Publicação ({plataformas.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
