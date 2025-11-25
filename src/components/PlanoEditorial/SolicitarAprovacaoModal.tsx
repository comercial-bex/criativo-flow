import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast-compat";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SolicitarAprovacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: any;
  clienteId: string;
  projetoId?: string;
  onSuccess?: () => void;
}

export function SolicitarAprovacaoModal({
  open,
  onOpenChange,
  post,
  clienteId,
  projetoId,
  onSuccess
}: SolicitarAprovacaoModalProps) {
  const [loading, setLoading] = useState(false);
  const [mensagemAdicional, setMensagemAdicional] = useState("");

  const handleSolicitar = async () => {
    setLoading(true);
    try {
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // ✅ FASE 1 P2: Preparar dados da aprovação com post_id
      const aprovacaoData = {
        cliente_id: clienteId,
        projeto_id: projetoId || null,
        post_id: post.id && !post.id.startsWith('temp-') ? post.id : null, // ✅ NOVO: Relacionamento direto
        tarefa_id: post.tarefa_vinculada_id || null,
        tipo: post.formato_postagem || 'post',
        titulo: post.titulo || `Post de ${format(new Date(post.data_postagem), 'dd/MM/yyyy', { locale: ptBR })}`,
        descricao: mensagemAdicional || post.contexto_estrategico || null,
        anexo_url: post.arquivo_visual_url || null,
        legenda: post.texto_estruturado || null,
        objetivo_postagem: post.tipo_conteudo || post.objetivo_postagem || 'informar',
        formato_postagem: post.formato_postagem || 'post',
        hashtags: post.hashtags || null,
        rede_social: post.rede_social || 'instagram',
        status: 'pendente',
        solicitado_por: user.id,
        trace_id: post.id, // Manter trace_id para retrocompatibilidade
      };

      // Inserir aprovação
      const { data: aprovacao, error: aprovacaoError } = await supabase
        .from('aprovacoes_cliente')
        .insert(aprovacaoData)
        .select()
        .single();

      if (aprovacaoError) throw aprovacaoError;

      // Atualizar status do post
      if (post.id && !post.id.startsWith('temp-')) {
        const { error: updateError } = await supabase
          .from('posts_planejamento')
          .update({ status_aprovacao_cliente: 'pendente' })
          .eq('id', post.id);

        if (updateError) throw updateError;
      }

      toast.success("Aprovação solicitada com sucesso!", {
        description: "O cliente receberá uma notificação para revisar o conteúdo."
      });

      onOpenChange(false);
      setMensagemAdicional("");
      
      // ✅ FASE 4: Disparar evento global para sincronizar
      window.dispatchEvent(new CustomEvent('posts-updated'));
      console.log('✅ Aprovação solicitada e evento disparado');
      
      toast.success('✅ Solicitação enviada com sucesso!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao solicitar aprovação:", error);
      toast.error("Erro ao solicitar aprovação", {
        description: "Tente novamente ou contate o suporte."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Solicitar Aprovação do Cliente
          </DialogTitle>
          <DialogDescription>
            Envie este post para aprovação do cliente. Ele receberá uma notificação e poderá aprovar ou solicitar alterações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações do Post */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm">
                  {post.titulo || format(new Date(post.data_postagem), "dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {post.formato_criativo || 'Post'} • {post.tipo_conteudo || 'Informar'}
                </p>
              </div>
              {post.arquivo_visual_url && (
                <div className="w-16 h-16 rounded overflow-hidden border">
                  <img 
                    src={post.arquivo_visual_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            {post.texto_estruturado && (
              <div className="text-xs text-muted-foreground line-clamp-2 mt-2 pt-2 border-t">
                {post.texto_estruturado}
              </div>
            )}
          </div>

          {/* Mensagem Adicional */}
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem para o cliente (opcional)</Label>
            <Textarea
              id="mensagem"
              placeholder="Ex: Olá! Segue o conteúdo para sua aprovação. Fique à vontade para solicitar ajustes."
              value={mensagemAdicional}
              onChange={(e) => setMensagemAdicional(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Esta mensagem será enviada junto com a solicitação de aprovação.
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">Antes de enviar, verifique:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>O arquivo visual está correto e bem formatado</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>A legenda está completa e revisada</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>As hashtags estão adequadas</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSolicitar} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar para Aprovação
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
