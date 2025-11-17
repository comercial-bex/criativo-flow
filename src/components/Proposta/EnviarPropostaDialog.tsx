import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { Loader2, Mail, Send } from "lucide-react";
import { EmailPreviewTab } from "@/components/Email/EmailPreviewTab";
import { EmailScheduler } from "@/components/Email/EmailScheduler";
import { EmailRecipientsInput } from "@/components/Email/EmailRecipientsInput";
import { gerarEmailTemplate } from "@/utils/emailTemplates";

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
  const [toEmails, setToEmails] = useState<string[]>([]);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [empresa, setEmpresa] = useState<any>(null);
  const [htmlPreview, setHtmlPreview] = useState("");

  useEffect(() => {
    if (open && proposta) {
      const email = proposta?.contato_email || proposta?.clientes?.email || "";
      setToEmails(email ? [email] : []);
      setCcEmails([]);
      setBccEmails([]);
      setAssunto(`Proposta Comercial - ${proposta?.titulo || ""}`);
      setMensagem(`Prezado(a) ${proposta?.contato_nome || proposta?.clientes?.nome || "Cliente"},\n\nSegue em anexo nossa proposta comercial.\n\nFicamos à disposição para esclarecimentos.\n\nAtenciosamente,`);
      fetchEmpresa();
    }
  }, [open, proposta]);

  useEffect(() => {
    if (mensagem && empresa) {
      const html = gerarEmailTemplate('proposta', {
        destinatario: toEmails[0] || '',
        assunto,
        mensagem,
        empresa,
        dados: { ...proposta, itens }
      });
      setHtmlPreview(html);
    }
  }, [mensagem, empresa, proposta, itens, toEmails, assunto]);

  const fetchEmpresa = async () => {
    try {
      const { data } = await supabase
        .from('configuracoes_empresa')
        .select('*')
        .limit(1)
        .single();
      if (data) setEmpresa(data);
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
    }
  };

  const handleEnviar = async () => {
    if (toEmails.length === 0) {
      smartToast.error("Por favor, informe pelo menos um destinatário");
      return;
    }

    setLoading(true);
    try {
      const destinatarios = [
        ...toEmails.map(email => ({ email, tipo: 'to' })),
        ...ccEmails.map(email => ({ email, tipo: 'cc' })),
        ...bccEmails.map(email => ({ email, tipo: 'bcc' }))
      ];

      if (scheduledDate) {
        const { error } = await supabase.from('emails_agendados').insert({
          tipo: 'proposta',
          entidade_id: proposta.id,
          destinatarios,
          assunto,
          mensagem,
          template_html: htmlPreview,
          agendar_para: scheduledDate.toISOString(),
          criado_por: (await supabase.auth.getUser()).data.user?.id
        });

        if (error) throw error;
        smartToast.success("Email agendado com sucesso!");
      } else {
        const { error } = await supabase.functions.invoke("enviar-proposta-email", {
          body: {
            proposta: { ...proposta, itens },
            destinatario: toEmails[0],
            cc: ccEmails,
            bcc: bccEmails,
            assunto,
            mensagem,
          },
        });

        if (error) throw error;
        smartToast.success("Proposta enviada por e-mail com sucesso!");
      }

      // Log de atividade
      await supabase.rpc("criar_log_atividade", {
        p_cliente_id: proposta.cliente_id,
        p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
        p_acao: "enviar_email",
        p_entidade_tipo: "proposta",
        p_entidade_id: proposta.id,
        p_descricao: `Proposta enviada para ${toEmails.join(', ')}`,
        p_metadata: { destinatarios: toEmails },
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao enviar e-mail:", error);
      smartToast.error("Erro ao enviar e-mail", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Enviar Proposta por E-mail
          </DialogTitle>
          <DialogDescription>
            A proposta será enviada em anexo como PDF
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="compose" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">✉️ Compor</TabsTrigger>
            <TabsTrigger value="preview">👁️ Preview</TabsTrigger>
            <TabsTrigger value="schedule">⏰ Agendar</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4 max-h-[60vh] overflow-y-auto">
            <EmailRecipientsInput
              to={toEmails}
              onToChange={setToEmails}
              cc={ccEmails}
              onCcChange={setCcEmails}
              bcc={bccEmails}
              onBccChange={setBccEmails}
            />

            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input value={assunto} onChange={(e) => setAssunto(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={6}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="max-h-[60vh] overflow-y-auto">
            <EmailPreviewTab
              to={toEmails}
              cc={ccEmails}
              bcc={bccEmails}
              subject={assunto}
              htmlContent={htmlPreview}
              attachmentName={`proposta-${proposta?.id}.pdf`}
              scheduledDate={scheduledDate || undefined}
            />
          </TabsContent>

          <TabsContent value="schedule" className="max-h-[60vh] overflow-y-auto">
            <EmailScheduler
              onScheduleChange={setScheduledDate}
              initialDate={scheduledDate || undefined}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEnviar} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {scheduledDate ? 'Agendando...' : 'Enviando...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {scheduledDate ? 'Agendar Envio' : 'Enviar Agora'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
