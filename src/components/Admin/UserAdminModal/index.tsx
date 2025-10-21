import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Shield, Lock, History } from 'lucide-react';
import { UserInfoTab } from './UserInfoTab';
import { UserRoleTab } from './UserRoleTab';
import { UserSecurityTab } from './UserSecurityTab';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
  role?: string;
  telefone?: string;
  cpf?: string;
  papeis?: string[];
  cliente_id?: string;
  empresa?: string;
  user_roles?: { role: string }[];
  clientes?: { nome: string };
}

interface UserAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onUpdate: () => void;
}

export function UserAdminModal({ open, onOpenChange, user, onUpdate }: UserAdminModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const { toast } = useToast();

  // Estados para edição
  const [selectedTipo, setSelectedTipo] = useState<'admin' | 'cliente' | 'especialista'>('especialista');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPapeis, setSelectedPapeis] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      // Determinar tipo baseado em role e cliente_id
      const role = user.user_roles?.[0]?.role || user.role;
      
      if (role === 'admin') {
        setSelectedTipo('admin');
        setSelectedRole('admin');
      } else if (role === 'cliente' || user.cliente_id) {
        setSelectedTipo('cliente');
        setSelectedRole('cliente');
        setSelectedClienteId(user.cliente_id || null);
      } else {
        setSelectedTipo('especialista');
        setSelectedRole(role || 'grs');
      }
      
      setSelectedStatus(user.status || 'aprovado');
      setSelectedPapeis(user.papeis || []);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Validação: Cliente precisa ter cliente_id
    if (selectedTipo === 'cliente' && !selectedClienteId) {
      toast({
        title: '⚠️ Validação',
        description: 'Selecione o cliente antes de salvar.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Mapear status "ativo" para "aprovado" (compatibilidade)
      const statusParaEnviar = selectedStatus === 'ativo' ? 'aprovado' : selectedStatus;

      // Preparar updates baseado no tipo selecionado
      const updates: any = {
        role: selectedRole,
        status: statusParaEnviar,
      };

      // Definir papéis baseado no tipo
      if (selectedTipo === 'admin') {
        updates.papeis = ['admin'];
      } else if (selectedTipo === 'cliente') {
        updates.papeis = ['cliente'];
        updates.cliente_id = selectedClienteId;
      } else {
        // Especialista
        updates.papeis = ['colaborador', selectedRole];
        updates.cliente_id = null;
      }

      // Chamar edge function para atualizar
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'update-user-complete',
          user_id: user.id,
          updates
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Falha ao atualizar usuário');
      }

      // Toast de sucesso
      toast({
        title: '✅ Usuário atualizado com sucesso',
        description: `${user.nome} foi atualizado com tipo: ${selectedTipo}, role: ${selectedRole}`,
      });

      // Aviso se role foi pulada devido a FK antigo
      if (data.role_skipped === true) {
        toast({
          title: '⚠️ Atenção',
          description: 'Permissão principal salva em papeis; ajuste estrutural do user_roles pendente (sem impacto para o acesso do usuário).',
          variant: 'default',
        });
      }

      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: '❌ Erro ao atualizar usuário',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-500/10 text-green-600">Aprovado</Badge>;
      case 'pendente_aprovacao':
        return <Badge className="bg-yellow-500/10 text-yellow-600">Pendente</Badge>;
      case 'rejeitado':
        return <Badge className="bg-red-500/10 text-red-600">Rejeitado</Badge>;
      case 'inativo':
        return <Badge className="bg-gray-500/10 text-gray-600">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(user.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{user.nome}</DialogTitle>
              <DialogDescription className="sr-only">
                Administração de usuário: visualizar, editar permissões e segurança
              </DialogDescription>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2">{getStatusBadge(user.status)}</div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">
              <User className="h-4 w-4 mr-2" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="role">
              <Shield className="h-4 w-4 mr-2" />
              Tipo & Permissões
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            <UserInfoTab user={user} />
          </TabsContent>

          <TabsContent value="role" className="mt-6">
            <UserRoleTab
              selectedTipo={selectedTipo}
              setSelectedTipo={setSelectedTipo}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              selectedClienteId={selectedClienteId}
              setSelectedClienteId={setSelectedClienteId}
              selectedPapeis={selectedPapeis}
              setSelectedPapeis={setSelectedPapeis}
            />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <UserSecurityTab
              user={user}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              onUpdate={onUpdate}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
