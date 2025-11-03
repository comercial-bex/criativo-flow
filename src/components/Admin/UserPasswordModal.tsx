import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Eye, EyeOff, Copy, ShieldCheck } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';

interface UserPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  mode?: 'generate' | 'custom';
}

// Gerador de senha forte (mesma lógica do backend)
function generateStrongPassword(length = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';
  
  const allChars = lowercase + uppercase + numbers + special;
  
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function UserPasswordModal({ 
  open, 
  onOpenChange, 
  userId, 
  userName, 
  mode = 'generate' 
}: UserPasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [customPassword, setCustomPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const handleGenerateAndApply = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'reset-password',
          user_id: userId,
          // Não envia new_password, deixa backend gerar
        }
      });
      
      if (error) throw error;
      
      setGeneratedPassword(data.new_password);
      
      toast({
        title: '✅ Senha gerada com sucesso',
        description: 'Copie a senha antes de fechar o modal',
      });
    } catch (error: any) {
      toast({
        title: '❌ Erro ao gerar senha',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetCustomPassword = async () => {
    if (customPassword.length < 8) {
      toast({
        title: '⚠️ Senha muito curta',
        description: 'Mínimo 8 caracteres',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'reset-password',
          user_id: userId,
          new_password: customPassword,
        }
      });
      
      if (error) throw error;
      
      toast({
        title: '✅ Senha alterada',
        description: 'Usuário poderá fazer login com a nova senha',
      });
      
      onOpenChange(false);
      setCustomPassword('');
    } catch (error: any) {
      toast({
        title: '❌ Erro ao definir senha',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPassword = () => {
    const preview = generateStrongPassword(16);
    setGeneratedPassword(preview);
  };
  
  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast({ 
        title: '📋 Copiado!',
        description: 'Senha copiada para área de transferência'
      });
    }
  };

  const handleClose = () => {
    setGeneratedPassword(null);
    setCustomPassword('');
    setShowPassword(false);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-bex" />
            Gerenciar Senha
          </DialogTitle>
          <DialogDescription>
            Usuário: <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={mode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Gerar Automática</TabsTrigger>
            <TabsTrigger value="custom">Senha Customizada</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4">
            {!generatedPassword ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gere uma senha forte automaticamente (16 caracteres com letras, números e símbolos)
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePreviewPassword} 
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar Exemplo
                  </Button>
                  <Button 
                    onClick={handleGenerateAndApply} 
                    disabled={loading}
                    className="flex-1"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Gerar e Aplicar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="border-bex/30 bg-bex/5">
                  <ShieldCheck className="h-4 w-4 text-bex" />
                  <AlertTitle>Senha Gerada</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Copie esta senha antes de fechar - ela não será mostrada novamente
                    </p>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={generatedPassword} 
                        type={showPassword ? 'text' : 'password'}
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        onClick={handleCopyPassword}
                        className="bg-bex hover:bg-bex-dark"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="outline" 
                  onClick={() => setGeneratedPassword(null)}
                  className="w-full"
                >
                  Gerar Nova Senha
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nova Senha</Label>
                <div className="flex gap-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Digite a senha..."
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {customPassword && (
                <PasswordStrengthIndicator password={customPassword} />
              )}
              
              <Button 
                onClick={handleSetCustomPassword} 
                disabled={loading || customPassword.length < 8}
                className="w-full bg-bex hover:bg-bex-dark"
              >
                {loading ? 'Definindo...' : 'Definir Senha'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
