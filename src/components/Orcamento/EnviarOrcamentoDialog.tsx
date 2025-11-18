import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailPreviewTab } from "@/components/Email/EmailPreviewTab";
import { EmailScheduler } from "@/components/Email/EmailScheduler";
import { EmailRecipientsInput } from "@/components/Email/EmailRecipientsInput";
import { generateOrcamentoEmailHTML } from "@/utils/emailTemplates";
import { Button } from "@/components/ui/button";

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
          para: destinatarios,
          cc: cc.length > 0 ? cc : null,
          cco: bcc.length > 0 ? bcc : null,
          assunto: formData.assunto,
          corpo_html: generateOrcamentoEmailHTML({
            orcamento,
            itens,
            mensagem: formData.mensagem,
            empresaData
          }),
          agendado_para: agendarPara.toISOString(),
          status: 'pendente',
          tipo_documento: 'orcamento',
          documento_id: orcamento.id
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

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="destinatario">Email do Destinatário *</Label>
            <Input
              id="destinatario"
              type="email"
              placeholder="cliente@exemplo.com"
              value={formData.destinatario}
              onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
            />
          </div>

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
              rows={8}
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              className="resize-none"
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg border text-sm text-muted-foreground">
            <p className="font-semibold mb-1">ℹ️ O que será enviado:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>PDF do orçamento completo com todos os detalhes</li>
              <li>Dados bancários para pagamento</li>
              <li>Informações de validade</li>
            </ul>
          </div>
        </div>

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
