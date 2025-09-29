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
  Eye,
  Settings,
  AlertTriangle
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

interface AdminClienteControlsProps {
  clienteId: string;
  clienteData: any;
}

interface ClienteAuthData {
  auth_user_id?: string;
  email?: string;
  last_sign_in_at?: string;
  created_at?: string;
}

export function AdminClienteControls({ clienteId, clienteData }: AdminClienteControlsProps) {
  const [authData, setAuthData] = useState<ClienteAuthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState(clienteData.email || clienteData.nome?.toLowerCase().replace(/\s+/g, '') + '@cliente.com' || "");
  const [accountStatus, setAccountStatus] = useState(clienteData.status || "ativo");
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState({ email: "", senha: "" });

  useEffect(() => {
    fetchAuthData();
  }, [clienteId]);

  const fetchAuthData = async () => {
    try {
      // Buscar dados do perfil vinculado ao cliente
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
    } catch (error) {
      console.error('Error fetching auth data:', error);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handleResetPassword = async () => {
    if (!authData?.auth_user_id || !newPassword) {
      toast.error('Usuário não encontrado ou senha não informada');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { 
          action: 'reset-password', 
          user_id: authData.auth_user_id, 
          new_password: newPassword 
        }
      });

      if (error) throw error;
      
      toast.success('Senha alterada com sucesso');
      setNewPassword("");
    } catch (error: any) {
      toast.error('Erro ao alterar senha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async () => {
    if (!authData?.auth_user_id) {
      toast.error('Usuário não encontrado');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'force-logout', user_id: authData.auth_user_id }
      });

      if (error) throw error;
      
      toast.success('Cliente desconectado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao desconectar cliente: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!authData?.auth_user_id) {
      toast.error('Usuário não encontrado');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'update-status', user_id: authData.auth_user_id, status }
      });

      if (error) throw error;
      
      setAccountStatus(status);
      toast.success('Status atualizado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!newEmail.trim()) {
      toast.error("Email é obrigatório");
      return;
    }

    setLoading(true);
    try {
      // Generate strong password
      const tempPassword = Math.random().toString(36).slice(-8) + 
                          Math.random().toString(36).slice(-8).toUpperCase() + 
                          Math.floor(Math.random() * 100);
      
      console.log('🔧 AdminControls: Criando conta para cliente:', {
        email: newEmail,
        nome: clienteData.nome,
        cliente_id: clienteId,
        role: 'cliente'
      });
      
      toast.info('Criando conta de acesso...', { duration: 2000 });
      
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: {
          email: newEmail,
          password: tempPassword,
          nome: clienteData.nome,
          cliente_id: clienteId,
          role: 'cliente'
        }
      });

      console.log('🔧 AdminControls: Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('🔧 AdminControls: Erro na criação:', error);
        
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
        console.log('🔧 AdminControls: Conta criada com sucesso via', data.method || 'auth API');
        
        // Set credentials for modal
        setCreatedCredentials({
          email: data.email || newEmail,
          senha: data.password || tempPassword
        });
        setShowCredentials(true);
        
        if (data.message?.includes('já vinculado') || data.message?.includes('backup SQL')) {
          toast.success(data.message || 'Conta criada via backup!');
        } else {
          toast.success('Conta criada com sucesso!');
        }
        
        // Update email field if needed
        if (data.email && data.email !== newEmail) {
          setNewEmail(data.email);
        }
        
        await fetchAuthData(); // Recarregar dados
      } else {
        console.error('🔧 AdminControls: Resposta inválida:', data);
        toast.error('Falha na criação da conta. Verifique os logs.');
      }
    } catch (error: any) {
      console.error('🔧 AdminControls: Erro inesperado:', error);
      toast.error('Erro inesperado: ' + (error.message || 'Tente novamente'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!authData?.auth_user_id) {
      toast.error('Usuário não encontrado');
      return;
    }

    if (!confirm('ATENÇÃO: Esta ação irá excluir permanentemente a conta de acesso do cliente. Deseja continuar?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'delete-user', user_id: authData.auth_user_id }
      });

      if (error) throw error;
      
      toast.success('Conta de acesso excluída com sucesso');
      setAuthData(null);
    } catch (error: any) {
      toast.error('Erro ao excluir conta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Admin Badge */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-orange-600 mr-2" />
            <CardTitle className="text-orange-800">CONTROLES ADMINISTRATIVOS</CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Credenciais de Acesso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-4 w-4 mr-2" />
            Credenciais de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {authData ? (
            <>
              <div className="space-y-2">
                <Label>Email de Login</Label>
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
                <p className="text-xs text-gray-500">
                  Email atual: {authData.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Nova Senha</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite nova senha..."
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateRandomPassword}
                  >
                    Gerar
                  </Button>
                </div>
                <Button 
                  onClick={handleResetPassword} 
                  disabled={!newPassword || loading}
                  size="sm"
                  className="w-full"
                >
                  Alterar Senha
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Status da Conta</Label>
                <Select value={accountStatus} onValueChange={handleUpdateStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aprovado">Ativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                    <SelectItem value="rejeitado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                Este cliente não possui conta de acesso
              </p>
              
              <div className="space-y-3 mt-3">
                <div className="text-left">
                  <Label className="text-xs">Email para a conta:</Label>
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="mt-1"
                    disabled={loading}
                  />
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={handleCreateAccount}
                  disabled={loading || !newEmail.trim()}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {loading ? 'Criando...' : 'Criar Conta de Acesso'}
                </Button>
                
                {!newEmail.trim() && (
                  <p className="text-xs text-amber-600">
                    Digite o email para criar a conta
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auditoria e Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Auditoria e Controle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {authData && (
            <>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Criado em:</span>
                  <span>{authData.created_at ? new Date(authData.created_at).toLocaleString('pt-BR') : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Último acesso:</span>
                  <span>{authData.last_sign_in_at ? new Date(authData.last_sign_in_at).toLocaleString('pt-BR') : 'Nunca'}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleForceLogout}
                  disabled={loading}
                  className="w-full"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Desconectar Cliente
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Conta de Acesso
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center text-red-600">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Excluir Conta de Acesso
                      </DialogTitle>
                      <DialogDescription>
                        Esta ação irá excluir permanentemente a conta de acesso do cliente.
                        O cliente não conseguirá mais fazer login no sistema.
                        <br /><br />
                        <strong>Esta ação não pode ser desfeita.</strong>
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancelar</Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={loading}
                      >
                        Confirmar Exclusão
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Histórico de Alterações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b">
              <span>Cliente criado</span>
              <span className="text-gray-500">
                {clienteData.created_at ? new Date(clienteData.created_at).toLocaleString('pt-BR') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Última atualização</span>
              <span className="text-gray-500">
                {clienteData.updated_at ? new Date(clienteData.updated_at).toLocaleString('pt-BR') : 'N/A'}
              </span>
            </div>
          </div>
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