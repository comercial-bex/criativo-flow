import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailPreviewTab } from "@/components/Email/EmailPreviewTab";
import { EmailScheduler } from "@/components/Email/EmailScheduler";
import { EmailRecipientsInput } from "@/components/Email/EmailRecipientsInput";
import { generateOrcamentoEmailHTML } from "@/utils/emailTemplates";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EnviarOrcamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orcamento: any;
  itens: any[];
}

export const EnviarOrcamentoDialog = ({
  open,
  onOpenChange,
  orcamento,
  itens
}: EnviarOrcamentoDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [destinatarios, setDestinatarios] = useState<string[]>([orcamento?.contato_email].filter(Boolean));
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [agendarPara, setAgendarPara] = useState<Date | null>(null);
  const [empresaData, setEmpresaData] = useState<any>(null);
  const [formData, setFormData] = useState({
    assunto: `Orçamento #${orcamento?.numero} - ${orcamento?.clientes?.nome || 'Cliente'}`,
    mensagem: `Prezado(a) ${orcamento?.clientes?.nome || 'Cliente'},\n\nSegue em anexo o orçamento solicitado.\n\nFicamos à disposição para quaisquer esclarecimentos.\n\nAtenciosamente,\nBEX Communication`
  });

  useEffect(() => {
    if (open && orcamento) {
      setDestinatarios([orcamento?.contato_email].filter(Boolean));
      setFormData({
        assunto: `Orçamento #${orcamento?.numero} - ${orcamento?.clientes?.nome || 'Cliente'}`,
        mensagem: `Prezado(a) ${orcamento?.clientes?.nome || 'Cliente'},\n\nSegue em anexo o orçamento solicitado.\n\nFicamos à disposição para quaisquer esclarecimentos.\n\nAtenciosamente,\nBEX Communication`
      });
    }
  }, [open, orcamento]);

  const handleSend = async () => {
    if (destinatarios.length === 0) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe pelo menos um destinatário.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (agendarPara) {
        // Agendar email
        const { error } = await supabase.from('emails_agendados').insert({
          destinatarios: destinatarios,
          assunto: formData.assunto,
          mensagem: formData.mensagem,
          template_html: generateOrcamentoEmailHTML({
            orcamento,
            itens,
            mensagem: formData.mensagem,
            empresaData
          }),
          agendar_para: agendarPara.toISOString(),
          status: 'pendente',
          tipo: 'orcamento',
          entidade_id: orcamento.id
        });

        if (error) throw error;

        toast({
          title: "Email agendado!",
          description: `O orçamento será enviado em ${agendarPara.toLocaleString('pt-BR')}`,
        });
      } else {
        // Enviar imediatamente
        const { error } = await supabase.functions.invoke('enviar-orcamento-email', {
          body: {
            orcamento,
            itens,
            destinatarios,
            cc: cc.length > 0 ? cc : undefined,
            bcc: bcc.length > 0 ? bcc : undefined,
            assunto: formData.assunto,
            mensagem: formData.mensagem
          }
        });

        if (error) throw error;

        toast({
          title: "Email enviado com sucesso!",
          description: `O orçamento foi enviado para ${destinatarios.join(', ')}`,
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao enviar/agendar email:', error);
      toast({
        title: agendarPara ? "Erro ao agendar email" : "Erro ao enviar email",
        description: error.message || "Não foi possível processar o email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const htmlContent = generateOrcamentoEmailHTML({
    orcamento,
    itens,
    mensagem: formData.mensagem,
    empresaData
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-bex" />
            Enviar Orçamento por Email
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para enviar o orçamento em PDF por email.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">Compor</TabsTrigger>
            <TabsTrigger value="preview">Pré-visualizar</TabsTrigger>
            <TabsTrigger value="schedule">Agendar</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            <EmailRecipientsInput
              to={destinatarios}
              cc={cc}
              bcc={bcc}
              onToChange={setDestinatarios}
              onCcChange={setCc}
              onBccChange={setBcc}
              maxRecipients={50}
            />

            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto</Label>
              <Input
                id="assunto"
                value={formData.assunto}
                onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea
                id="mensagem"
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                rows={8}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <EmailPreviewTab
              to={destinatarios}
              cc={cc}
              bcc={bcc}
              subject={formData.assunto}
              htmlContent={htmlContent}
              attachmentName={`Orcamento_${orcamento?.numero}.pdf`}
              scheduledDate={agendarPara}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <EmailScheduler
              onScheduleChange={setAgendarPara}
              initialDate={agendarPara || undefined}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSend}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Enviando...' : 'Enviar Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
