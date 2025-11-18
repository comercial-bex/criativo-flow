import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailPreviewTab } from "@/components/Email/EmailPreviewTab";
import { EmailScheduler } from "@/components/Email/EmailScheduler";
import { EmailRecipientsInput } from "@/components/Email/EmailRecipientsInput";
import { generateContratoEmailHTML } from "@/utils/emailTemplates";

interface EnviarContratoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: any;
}

export function EnviarContratoDialog({
  open,
  onOpenChange,
  contrato,
}: EnviarContratoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [destinatarios, setDestinatarios] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [agendarPara, setAgendarPara] = useState<Date | null>(null);
  const [empresaData, setEmpresaData] = useState<any>(null);
  const [formData, setFormData] = useState({
    assunto: `Contrato de Prestação de Serviços - ${contrato?.titulo || ""}`,
    mensagem: `Prezado(a) ${contrato?.clientes?.nome || "Cliente"},\n\nSegue em anexo o contrato de prestação de serviços.\n\nPor favor, revise e proceda com a assinatura.\n\nFicamos à disposição para esclarecimentos.\n\nAtenciosamente,`,
  });

  useEffect(() => {
    if (open && contrato) {
      setDestinatarios([contrato?.clientes?.email].filter(Boolean));
      setFormData({
        assunto: `Contrato de Prestação de Serviços - ${contrato?.titulo || ""}`,
        mensagem: `Prezado(a) ${contrato?.clientes?.nome || "Cliente"},\n\nSegue em anexo o contrato de prestação de serviços.\n\nPor favor, revise e proceda com a assinatura.\n\nFicamos à disposição para esclarecimentos.\n\nAtenciosamente,`
      });
    }
  }, [open, contrato]);

  const handleEnviar = async () => {
    if (destinatarios.length === 0) {
      smartToast.error("Por favor, informe pelo menos um destinatário");
      return;
    }

    setLoading(true);
    try {
      if (agendarPara) {
        // Agendar email
        const { error } = await supabase.from('emails_agendados').insert({
          para: destinatarios,
          cc: cc.length > 0 ? cc : null,
          cco: bcc.length > 0 ? bcc : null,
          assunto: formData.assunto,
          corpo_html: generateContratoEmailHTML({
            contrato,
            mensagem: formData.mensagem,
            empresaData
          }),
          agendado_para: agendarPara.toISOString(),
          status: 'pendente',
          tipo_documento: 'contrato',
          documento_id: contrato.id
        });

        if (error) throw error;

        smartToast.success(`Contrato agendado para ${agendarPara.toLocaleString('pt-BR')}`);
      } else {
        // Enviar imediatamente
        const { error } = await supabase.functions.invoke("enviar-contrato-email", {
          body: {
            contrato,
            destinatarios,
            cc: cc.length > 0 ? cc : undefined,
            bcc: bcc.length > 0 ? bcc : undefined,
            assunto: formData.assunto,
            mensagem: formData.mensagem,
          },
        });

        if (error) throw error;

        smartToast.success("Contrato enviado por e-mail com sucesso!");

        // Log de atividade
        await supabase.rpc("criar_log_atividade", {
          p_cliente_id: contrato.cliente_id,
          p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
          p_acao: "enviar_email",
          p_entidade_tipo: "contrato",
          p_entidade_id: contrato.id,
          p_descricao: `Contrato enviado para ${destinatarios.join(', ')}`,
          p_metadata: { destinatarios },
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao enviar/agendar e-mail:", error);
      smartToast.error(agendarPara ? "Erro ao agendar e-mail" : "Erro ao enviar e-mail", error.message);
    } finally {
      setLoading(false);
    }
  };

  const htmlContent = generateContratoEmailHTML({
    contrato,
    mensagem: formData.mensagem,
    empresaData
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Enviar Contrato por E-mail
          </DialogTitle>
          <DialogDescription>
            O contrato será enviado em anexo como PDF
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
