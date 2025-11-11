import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { Loader2, Mail } from "lucide-react";

interface EnviarPropostaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposta: any;
  itens: any[];
}

export function EnviarPropostaDialog({
  open,
  onOpenChange,
  proposta,
  itens,
}: EnviarPropostaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destinatario: proposta?.contato_email || proposta?.clientes?.email || "",
    assunto: `Proposta Comercial - ${proposta?.titulo || ""}`,
    mensagem: `Prezado(a) ${proposta?.contato_nome || proposta?.clientes?.nome || "Cliente"},\n\nSegue em anexo nossa proposta comercial.\n\nFicamos à disposição para esclarecimentos.\n\nAtenciosamente,`,
  });

  const handleEnviar = async () => {
    if (!formData.destinatario) {
      smartToast.error("Por favor, informe o e-mail do destinatário");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("enviar-proposta-email", {
        body: {
          proposta,
          itens,
          destinatario: formData.destinatario,
          assunto: formData.assunto,
          mensagem: formData.mensagem,
        },
      });

      if (error) throw error;

      smartToast.success("Proposta enviada por e-mail com sucesso!");
      onOpenChange(false);

      // Log de atividade
      await supabase.rpc("criar_log_atividade", {
        p_cliente_id: proposta.cliente_id,
        p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
        p_acao: "enviar_email",
        p_entidade_tipo: "proposta",
        p_entidade_id: proposta.id,
        p_descricao: `Proposta enviada para ${formData.destinatario}`,
        p_metadata: { destinatario: formData.destinatario },
      });
    } catch (error: any) {
      console.error("Erro ao enviar e-mail:", error);
      smartToast.error("Erro ao enviar e-mail", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Enviar Proposta por E-mail
          </DialogTitle>
          <DialogDescription>
            A proposta será enviada em anexo como PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="destinatario">E-mail do Destinatário *</Label>
            <Input
              id="destinatario"
              type="email"
              value={formData.destinatario}
              onChange={(e) =>
                setFormData({ ...formData, destinatario: e.target.value })
              }
              placeholder="cliente@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto</Label>
            <Input
              id="assunto"
              value={formData.assunto}
              onChange={(e) =>
                setFormData({ ...formData, assunto: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={formData.mensagem}
              onChange={(e) =>
                setFormData({ ...formData, mensagem: e.target.value })
              }
              rows={6}
              placeholder="Digite sua mensagem..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEnviar} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
