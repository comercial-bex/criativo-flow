import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CredentialsModal } from './CredentialsModal';

interface ClientUser {
  id: string;
  user_id: string;
  role_cliente: 'proprietario' | 'gerente_financeiro' | 'gestor_marketing' | 'social_media';
  permissoes: any;
  ativo: boolean;
  created_at: string;
  profile?: {
    nome: string;
    email: string;
  };
}

interface ClientUserManagementProps {
  clienteId: string;
  clienteData: any;
}

const roleLabels: Record<string, string> = {
  proprietario: 'Proprietário',
  gerente_financeiro: 'Gerente Financeiro',
  gestor_marketing: 'Gestor de Marketing',
  social_media: 'Social Media'
};

const roleColors: Record<string, string> = {
  proprietario: 'bg-purple-100 text-purple-800',
  gerente_financeiro: 'bg-green-100 text-green-800',
  gestor_marketing: 'bg-blue-100 text-blue-800',
  social_media: 'bg-orange-100 text-orange-800'
};

export function ClientUserManagement({ clienteId, clienteData }: ClientUserManagementProps) {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role_cliente: 'social_media'
  });
  const [creating, setCreating] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('cliente_usuarios')
        .select(`
          *,
          profiles!cliente_usuarios_user_id_fkey (
            nome,
            email
          )
        `)
        .eq('cliente_id', clienteId)
        .eq('ativo', true);

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Erro ao carregar usuários');
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [clienteId]);

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleCreateUser = async () => {
    if (!formData.nome.trim() || !formData.email.trim()) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    setCreating(true);
    try {
      const password = generatePassword();

      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: {
          email: formData.email.trim(),
          password: password,
          nome: formData.nome.trim(),
          cliente_id: clienteId,
          role: 'cliente'
        }
      });

      if (error) {
        console.error('Error creating user:', error);
        toast.error(error.message || 'Erro ao criar usuário');
        return;
      }

      if (data?.success) {
        // Update the role in cliente_usuarios
        const { error: roleError } = await supabase
          .from('cliente_usuarios')
          .update({ 
            role_cliente: formData.role_cliente as 'proprietario' | 'gerente_financeiro' | 'gestor_marketing' | 'social_media',
            permissoes: getPermissionsByRole(formData.role_cliente)
          })
          .eq('cliente_id', clienteId)
          .eq('user_id', data.user.id);

        if (roleError) {
          console.error('Error updating role:', roleError);
        }

        setCredentials({
          email: data.email,
          password: data.password,
          message: data.message
        });
        setShowCredentials(true);
        
        toast.success('Usuário criado com sucesso!');
        setFormData({ nome: '', email: '', role_cliente: 'social_media' });
        setShowAddForm(false);
        fetchUsers();
      } else {
        toast.error('Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar usuário');
    } finally {
      setCreating(false);
    }
  };

  const getPermissionsByRole = (role: string) => {
    const permissions = {
      proprietario: {
        financeiro: { ver: true, editar: true },
        marketing: { ver: true, aprovar: true },
        projetos: { ver: true, criar: true, editar: true },
        relatorios: { ver: true }
      },
      gerente_financeiro: {
        financeiro: { ver: true, editar: true },
        marketing: { ver: true, aprovar: false },
        projetos: { ver: true, criar: false, editar: false },
        relatorios: { ver: true }
      },
      gestor_marketing: {
        financeiro: { ver: false, editar: false },
        marketing: { ver: true, aprovar: true },
        projetos: { ver: true, criar: true, editar: true },
        relatorios: { ver: true }
      },
      social_media: {
        financeiro: { ver: false, editar: false },
        marketing: { ver: true, aprovar: false },
        projetos: { ver: true, criar: true, editar: false },
        relatorios: { ver: false }
      }
    };
    return permissions[role] || permissions.social_media;
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;

    try {
      const { error } = await supabase
        .from('cliente_usuarios')
        .update({ ativo: false })
        .eq('user_id', userId)
        .eq('cliente_id', clienteId);

      if (error) {
        console.error('Error removing user:', error);
        toast.error('Erro ao remover usuário');
        return;
      }

      toast.success('Usuário removido com sucesso');
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao remover usuário');
    }
  };

  if (loading) return <div>Carregando usuários...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Usuários do Cliente</span>
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Usuário
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Digite o email"
                />
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Select value={formData.role_cliente} onValueChange={(value) => setFormData({ ...formData, role_cliente: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proprietario">Proprietário</SelectItem>
                    <SelectItem value="gerente_financeiro">Gerente Financeiro</SelectItem>
                    <SelectItem value="gestor_marketing">Gestor de Marketing</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateUser} disabled={creating}>
                  {creating ? 'Criando...' : 'Criar Usuário'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum usuário encontrado</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.profile?.nome || 'Nome não disponível'}</span>
                    <Badge className={roleColors[user.role_cliente] || roleColors.social_media}>
                      {roleLabels[user.role_cliente] || user.role_cliente}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{user.profile?.email || 'Email não disponível'}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleRemoveUser(user.user_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <CredentialsModal
          open={showCredentials}
          onOpenChange={setShowCredentials}
          email={credentials?.email || ''}
          senha={credentials?.password || ''}
          nomeCliente={clienteData?.nome || 'Cliente'}
        />
      </CardContent>
    </Card>
  );
}