import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppNotifierProps {
  clienteNome: string;
  clienteTelefone?: string;
  mensagem: string;
  trigger?: React.ReactNode;
}

export function WhatsAppNotifier({ clienteNome, clienteTelefone, mensagem, trigger }: WhatsAppNotifierProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Format phone number for WhatsApp (remove spaces, dashes, parentheses)
  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const formattedPhone = formatPhone(clienteTelefone);
  const encodedMessage = encodeURIComponent(mensagem);
  const whatsappUrl = formattedPhone 
    ? `https://wa.me/55${formattedPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copiado!",
        description: "Mensagem copiada para área de transferência",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a mensagem",
        variant: "destructive",
      });
    }
  };

  const openWhatsApp = () => {
    try {
      window.open(whatsappUrl, '_blank');
      toast({
        title: "WhatsApp aberto",
        description: `Mensagem pronta para ${clienteNome}`,
      });
    } catch (error) {
      // Fallback: copy message if browser blocks
      copyToClipboard(mensagem);
      toast({
        title: "Mensagem copiada",
        description: "Cole no WhatsApp manualmente",
      });
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
      <MessageCircle className="h-4 w-4 mr-2" />
      📱 Enviar pelo WhatsApp
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent size="sm" height="auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Notificar via WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-2">Cliente:</p>
            <p className="font-semibold">{clienteNome}</p>
            {clienteTelefone && (
              <>
                <p className="text-sm font-medium text-muted-foreground mb-1 mt-2">Telefone:</p>
                <p className="text-sm">{clienteTelefone}</p>
              </>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-2">Mensagem que será enviada:</p>
            <p className="text-sm text-green-700 whitespace-pre-wrap">{mensagem}</p>
          </div>

          {!clienteTelefone && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ Telefone não cadastrado. O WhatsApp abrirá sem destinatário específico.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={openWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir WhatsApp
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => copyToClipboard(mensagem)}
              className="px-3"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Clique em "Abrir WhatsApp" para enviar a mensagem diretamente pelo aplicativo
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}