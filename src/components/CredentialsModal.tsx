import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface CredentialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  senha: string;
  nomeCliente: string;
}

export function CredentialsModal({ open, onOpenChange, email, senha, nomeCliente }: CredentialsModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { startTutorial, hasSeenTutorial } = useTutorial('credentials-modal');

  // Start tutorial when modal opens if not seen before
  useEffect(() => {
    if (open && !hasSeenTutorial) {
      const timer = setTimeout(() => startTutorial(), 500);
      return () => clearTimeout(timer);
    }
  }, [open, hasSeenTutorial, startTutorial]);

  const copyCredentials = () => {
    const credentials = `Credenciais de Acesso - ${nomeCliente}\n\nEmail: ${email}\nSenha: ${senha}\n\nAcesse: ${window.location.origin}/auth`;
    navigator.clipboard.writeText(credentials);
    toast.success('Credenciais copiadas!');
  };

  const shareWhatsApp = () => {
    const message = `Olá! Suas credenciais de acesso ao sistema estão prontas:\n\n📧 *Email:* ${email}\n🔐 *Senha:* ${senha}\n\n🌐 *Link de acesso:* ${window.location.origin}/auth\n\nGuarde essas informações em local seguro!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    if (window.navigator.userAgent.includes('Mobile')) {
      window.open(whatsappUrl, '_blank');
    } else {
      navigator.clipboard.writeText(message);
      toast.success('Mensagem copiada! Cole no WhatsApp.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" height="auto" data-tour="credentials-modal-container">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming flex items-center justify-between text-center">
            <span data-tour="credentials-title">✅ Conta criada com sucesso!</span>
            <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} variant="default" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Credenciais de acesso para <strong>{nomeCliente}</strong>
          </div>

          <div className="space-y-3">
            <div className="space-y-2" data-tour="credentials-email">
              <Label htmlFor="email-display">Email de Login</Label>
              <div className="relative">
                <Input
                  id="email-display"
                  value={email}
                  readOnly
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(email);
                    toast.success('Email copiado!');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2" data-tour="credentials-password">
              <Label htmlFor="password-display">Senha Temporária</Label>
              <div className="relative">
                <Input
                  id="password-display"
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  readOnly
                  className="pr-20"
                />
                <div className="absolute right-1 top-1 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      navigator.clipboard.writeText(senha);
                      toast.success('Senha copiada!');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              📋 <strong>Próximos passos:</strong>
            </p>
            <ol className="text-sm text-blue-700 mt-1 ml-4 list-decimal space-y-1">
              <li>Copie ou envie as credenciais ao cliente</li>
              <li>Aprove o usuário em <strong>/especialistas</strong></li>
              <li>Cliente poderá acessar o painel</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Importante:</strong> Essas credenciais serão exibidas apenas uma vez.
            </p>
          </div>

          <div className="flex gap-2 pt-2" data-tour="credentials-actions">
            <Button onClick={copyCredentials} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Tudo
            </Button>
            <Button onClick={shareWhatsApp} variant="outline" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          <div className="text-center pt-2">
            <Button
              variant="link"
              onClick={() => {
                window.open('/especialistas', '_blank');
                onOpenChange(false);
              }}
              className="text-sm text-blue-600"
            >
              🚀 Ir para Aprovações (/especialistas)
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-sm"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
