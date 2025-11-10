import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";

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
  const [formData, setFormData] = useState({
    destinatario: orcamento?.contato_email || '',
    assunto: `Orçamento #${orcamento?.numero} - ${orcamento?.clientes?.nome || 'Cliente'}`,
    mensagem: `Prezado(a) ${orcamento?.clientes?.nome || 'Cliente'},\n\nSegue em anexo o orçamento solicitado.\n\nFicamos à disposição para quaisquer esclarecimentos.\n\nAtenciosamente,\nBEX Communication`
  });

  const handleSend = async () => {
    if (!formData.destinatario) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe o email do destinatário.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enviar-orcamento-email', {
        body: {
          orcamento,
          itens,
          destinatario: formData.destinatario,
          assunto: formData.assunto,
          mensagem: formData.mensagem
        }
      });

      if (error) throw error;

      toast({
        title: "Email enviado com sucesso!",
        description: `O orçamento foi enviado para ${formData.destinatario}`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
