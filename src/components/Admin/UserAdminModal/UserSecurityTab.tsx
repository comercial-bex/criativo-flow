import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { CheckCircle, Clock, XCircle, Ban, RefreshCw, LogOut, Trash2 } from 'lucide-react';
import { AdminUser } from './index';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminUserManagement } from '@/hooks/useAdminUserManagement';

interface UserSecurityTabProps {
  user: AdminUser;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  onUpdate: () => void;
  onClose: () => void;
}

export function UserSecurityTab({
  user,
  selectedStatus,
  setSelectedStatus,
  onUpdate,
  onClose,
}: UserSecurityTabProps) {
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [forceLogoutOpen, setForceLogoutOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { deleteUser } = useAdminUserManagement();

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const newPassword = Math.random().toString(36).slice(-8);
      
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'reset-password',
          user_id: user.id,
          new_password: newPassword
        }
      });

      if (error) throw error;

      toast({
        title: '🔑 Senha resetada com sucesso',
        description: `Nova senha: ${newPassword}`,
        duration: 10000,
      });

      setResetPasswordOpen(false);
    } catch (error: any) {
      toast({
        title: '❌ Erro ao resetar senha',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'force-logout',
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: '🚪 Usuário desconectado',
        description: `${user.nome} foi desconectado de todas as sessões`,
      });

      setForceLogoutOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: '❌ Erro ao desconectar usuário',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    const result = await deleteUser(user.id);
    
    if (result.success) {
      setDeleteUserOpen(false);
      onClose();
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Status do Usuário</CardTitle>
          <CardDescription>
            Gerencie o status de acesso do usuário ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
            <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4">
              <RadioGroupItem value="aprovado" id="aprovado" />
              <Label htmlFor="aprovado" className="flex items-center gap-2 cursor-pointer flex-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Aprovado</p>
                  <p className="text-sm text-muted-foreground">Acesso completo ao sistema</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4">
              <RadioGroupItem value="pendente_aprovacao" id="pendente" />
              <Label htmlFor="pendente" className="flex items-center gap-2 cursor-pointer flex-1">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Pendente Aprovação</p>
                  <p className="text-sm text-muted-foreground">Aguardando aprovação de admin</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4">
              <RadioGroupItem value="inativo" id="inativo" />
              <Label htmlFor="inativo" className="flex items-center gap-2 cursor-pointer flex-1">
                <XCircle className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Inativo</p>
                  <p className="text-sm text-muted-foreground">Sem acesso ao sistema</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 space-y-0 rounded-lg border p-4">
              <RadioGroupItem value="rejeitado" id="rejeitado" />
              <Label htmlFor="rejeitado" className="flex items-center gap-2 cursor-pointer flex-1">
                <Ban className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Rejeitado</p>
                  <p className="text-sm text-muted-foreground">Acesso negado</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações de Segurança</CardTitle>
          <CardDescription>
            Ações críticas que afetam o acesso do usuário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setResetPasswordOpen(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar Senha
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setForceLogoutOpen(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Forçar Logout
          </Button>

          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => setDeleteUserOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Usuário
          </Button>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        title="Resetar Senha"
        description="Uma nova senha será gerada automaticamente. Certifique-se de anotar e enviar para o usuário."
        confirmText="Resetar Senha"
        onConfirm={handleResetPassword}
      />

      <ConfirmationDialog
        open={forceLogoutOpen}
        onOpenChange={setForceLogoutOpen}
        title="Forçar Logout"
        description={`Desconectar ${user.nome} de todas as sessões ativas? O usuário precisará fazer login novamente.`}
        confirmText="Desconectar"
        onConfirm={handleForceLogout}
      />

      <ConfirmationDialog
        open={deleteUserOpen}
        onOpenChange={setDeleteUserOpen}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir ${user.nome}? Esta ação é IRREVERSÍVEL e todos os dados serão perdidos.`}
        confirmText="Excluir Permanentemente"
        variant="destructive"
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
