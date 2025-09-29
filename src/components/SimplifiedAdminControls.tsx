import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CredentialsModal } from "@/components/CredentialsModal";
import { 
  Shield, 
  Key, 
  UserX, 
  Trash2, 
  Clock,
  Copy,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  User
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimplifiedAdminControlsProps {
  clienteId: string;
  clienteData: any;
}

interface ClienteAuthData {
  id?: string;
  email?: string;
  last_sign_in_at?: string;
  created_at?: string;
  status?: string;
}

export function SimplifiedAdminControls({ clienteId, clienteData }: SimplifiedAdminControlsProps) {
  const [authData, setAuthData] = useState<ClienteAuthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState(
    clienteData.email || 
    clienteData.nome?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '@cliente.com' || 
    ""
  );
  const [accountStatus, setAccountStatus] = useState(clienteData.status || "ativo");
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState({ email: "", senha: "" });
  const [step, setStep] = useState<'initial' | 'email' | 'password' | 'complete'>('initial');

  useEffect(() => {
    fetchAuthData();
  }, [clienteId]);

  const fetchAuthData = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('cliente_id', clienteId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setAuthData(profileData);
      if (profileData) {
        setStep('complete');
        setAccountStatus(profileData.status || 'aprovado');
      } else {
        setStep('initial');
      }
    } catch (error) {
      console.error('Error fetching auth data:', error);
    }
  };

  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';
    
    let password = '';
    // Garante pelo menos um de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Completa com 6 caracteres aleatórios
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 4; i < 10; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Embaralha a senha
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado para a área de transferência!`);
    } catch (error) {
      toast.error(`Erro ao copiar ${label.toLowerCase()}`);
    }
  };

  const handleCreateAccount = async () => {
    if (!newEmail.trim()) {
      toast.error("Email é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const generatedPassword = generateStrongPassword();
      setNewPassword(generatedPassword);
      
      console.log('🔧 SimplifiedControls: Criando conta para cliente:', {
        email: newEmail,
        nome: clienteData.nome,
        cliente_id: clienteId,
        role: 'cliente'
      });
      
      toast.info('Criando conta de acesso...', { duration: 2000 });
      
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: {
          email: newEmail,
          password: generatedPassword,
          nome: clienteData.nome,
          cliente_id: clienteId,
          role: 'cliente'
        }
      });

      console.log('🔧 SimplifiedControls: Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('🔧 SimplifiedControls: Erro na criação:', error);
        
        if (error.message?.includes('409') || error.message?.includes('já está vinculado')) {
          toast.error('Email já existe. Use a opção de reset de senha ou escolha outro email.');
        } else if (error.message?.includes('Database error')) {
          toast.error('Erro no banco de dados. Tente novamente em alguns segundos.');
        } else {
          toast.error('Erro ao criar conta: ' + (error.message || 'Erro desconhecido'));
        }
        return;
      }

      if (data?.success) {
        console.log('🔧 SimplifiedControls: Conta criada com sucesso via', data.method || 'auth API');
        
        setCreatedCredentials({
          email: data.email || newEmail,
          senha: data.password || generatedPassword
        });
        setShowCredentials(true);
        setStep('complete');
        
        toast.success('Conta criada com sucesso!', {
          description: 'As credenciais foram geradas automaticamente'
        });
        
        await fetchAuthData();
      } else {
        console.error('🔧 SimplifiedControls: Resposta inválida:', data);
        toast.error('Falha na criação da conta. Verifique os logs.');
      }
    } catch (error: any) {
      console.error('🔧 SimplifiedControls: Erro inesperado:', error);
      toast.error('Erro inesperado: ' + (error.message || 'Tente novamente'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!authData?.id) {
      toast.error('Usuário não encontrado');
      return;
    }

    if (!newPassword) {
      const generatedPassword = generateStrongPassword();
      setNewPassword(generatedPassword);
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { 
          action: 'reset-password', 
          user_id: authData.id, 
          new_password: newPassword 
        }
      });

      if (error) throw error;
      
      setCreatedCredentials({
        email: authData.email || newEmail,
        senha: newPassword
      });
      setShowCredentials(true);
      
      toast.success('Senha alterada com sucesso!');
      setNewPassword("");
    } catch (error: any) {
      toast.error('Erro ao alterar senha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!authData?.id) {
      toast.error('Usuário não encontrado');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', authData.id);

      if (error) throw error;
      
      setAccountStatus(status);
      setAuthData(prev => prev ? { ...prev, status } : null);
      toast.success('Status atualizado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndicator = () => {
    const steps = [
      { key: 'initial', label: 'Início', icon: User },
      { key: 'email', label: 'Email', icon: Mail },
      { key: 'password', label: 'Senha', icon: Key },
      { key: 'complete', label: 'Completo', icon: CheckCircle }
    ];

    return (
      <div className="flex items-center justify-between mb-6 p-3 bg-muted/30 rounded-lg">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon;
          const isActive = stepItem.key === step;
          const isCompleted = steps.findIndex(s => s.key === step) > index;
          
          return (
            <div key={stepItem.key} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                isActive ? 'border-primary bg-primary text-primary-foreground' :
                isCompleted ? 'border-success bg-success text-success-foreground' :
                'border-muted-foreground bg-background text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`ml-2 text-sm ${
                isActive ? 'text-primary font-medium' :
                isCompleted ? 'text-success' :
                'text-muted-foreground'
              }`}>
                {stepItem.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-3 ${
                  isCompleted ? 'bg-success' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Admin Badge */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-primary">PAINEL ADMINISTRATIVO</CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Fluxo Guiado de Acesso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-4 w-4 mr-2" />
            Gerenciamento de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {getStepIndicator()}
          
          {step === 'initial' && !authData && (
            <div className="space-y-4">
              <div className="text-center p-6 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Sem Conta de Acesso</h3>
                <p className="text-muted-foreground mb-4">
                  Este cliente ainda não possui credenciais para acessar o sistema
                </p>
                <Button onClick={() => setStep('email')} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Iniciar Criação de Conta
                </Button>
              </div>
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📧 Passo 1: Definir Email</h4>
                <p className="text-sm text-blue-700">Configure o email que será usado para login</p>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Email para acesso</Label>
                <div className="flex gap-2">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="flex-1"
                    disabled={loading}
                    type="email"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(newEmail, 'Email')}
                    disabled={!newEmail}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('initial')}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={() => setStep('password')}
                    disabled={!newEmail.trim()}
                    className="flex-1"
                  >
                    Próximo: Senha
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">🔑 Passo 2: Gerar Senha</h4>
                <p className="text-sm text-green-700">A senha será gerada automaticamente com alta segurança</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Senha será gerada automaticamente</Label>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Segura
                  </Badge>
                </div>
                
                <div className="p-3 bg-muted/30 rounded border text-sm text-muted-foreground">
                  ✓ 10 caracteres<br />
                  ✓ Letras maiúsculas e minúsculas<br />
                  ✓ Números e símbolos<br />
                  ✓ Copiada automaticamente
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('email')}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleCreateAccount}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Criar Conta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'complete' && authData && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-green-900">Conta Ativa</h4>
                    <p className="text-sm text-green-700">{authData.email}</p>
                  </div>
                </div>
              </div>

              {/* Informações da Conta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Criado em:</span>
                    <span className="ml-auto font-medium">
                      {authData.created_at ? new Date(authData.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Último acesso:</span>
                    <span className="ml-auto font-medium">
                      {authData.last_sign_in_at ? new Date(authData.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className={
                      accountStatus === 'aprovado' ? 'bg-success/10 text-success' :
                      accountStatus === 'suspenso' ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }>
                      {accountStatus === 'aprovado' ? 'Ativo' : 
                       accountStatus === 'suspenso' ? 'Suspenso' : 'Bloqueado'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Ações de Gerenciamento */}
              <div className="space-y-4">
                <Separator />
                <h4 className="font-medium">Ações de Gerenciamento</h4>
                
                {/* Reset de Senha */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Nova Senha (Reset)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nova senha será gerada..."
                        className="pr-20"
                      />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        {newPassword && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => copyToClipboard(newPassword, 'Senha')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const generated = generateStrongPassword();
                        setNewPassword(generated);
                        setShowPassword(true);
                      }}
                    >
                      Gerar
                    </Button>
                  </div>
                  <Button 
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                    Alterar Senha
                  </Button>
                </div>

                {/* Status da Conta */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Status da Conta</Label>
                  <Select value={accountStatus} onValueChange={handleUpdateStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aprovado">✓ Ativo (Pode acessar)</SelectItem>
                      <SelectItem value="suspenso">⏸ Suspenso (Acesso bloqueado)</SelectItem>
                      <SelectItem value="rejeitado">🚫 Bloqueado (Sem acesso)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Credenciais */}
      <CredentialsModal
        open={showCredentials}
        onOpenChange={setShowCredentials}
        email={createdCredentials.email}
        senha={createdCredentials.senha}
        nomeCliente={clienteData.nome}
      />
    </>
  );
}