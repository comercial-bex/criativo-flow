import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, User, Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  especialidade?: string;
};

type UserRole = Database['public']['Tables']['user_roles']['Row'];

const especialidadeLabels: Record<string, string> = {
  'videomaker': 'Videomaker',
  'filmmaker': 'Filmmaker',
  'design': 'Designer',
  'gerente_redes_sociais': 'Gerente de Redes Sociais'
};

const roleLabels: Record<string, string> = {
  'admin': 'Administrador',
  'grs': 'GRS',
  'atendimento': 'Atendimento',
  'designer': 'Designer',
  'filmmaker': 'Filmmaker',
  'gestor': 'Gestor',
  'financeiro': 'Financeiro',
  'cliente': 'Cliente'
};

interface EspecialistaFormData {
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  role: string;
  senha: string;
}

export function Especialistas() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [especialistas, setEspecialistas] = useState<(Profile & { user_role?: UserRole })[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EspecialistaFormData>({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
    role: '',
    senha: ''
  });

  useEffect(() => {
    fetchEspecialistas();
  }, []);

  const fetchEspecialistas = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os perfis com suas especialidades e roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Buscar roles dos usuários
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combinar dados
      const profilesWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(role => role.user_id === profile.id);
        return {
          ...profile,
          user_role: userRole
        };
      }) || [];

      setEspecialistas(profilesWithRoles);
    } catch (error) {
      console.error('Erro ao buscar especialistas:', error);
      toast.error('Erro ao carregar especialistas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.role) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Atualizar especialista existente
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            nome: formData.nome,
            telefone: formData.telefone,
            especialidade: formData.especialidade as any || null
          })
          .eq('id', editingId);

        if (profileError) throw profileError;

        // Atualizar role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: formData.role as any })
          .eq('user_id', editingId);

        if (roleError) throw roleError;

        toast.success('Especialista atualizado com sucesso');
      } else {
        // Criar novo usuário usando Edge Function
        const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.email,
            password: formData.senha,
            nome: formData.nome,
            telefone: formData.telefone,
            especialidade: formData.especialidade,
            role: formData.role
          }
        });

        if (userError) throw userError;

        toast.success('Especialista criado com sucesso');
      }

      setFormData({
        nome: '',
        email: '',
        telefone: '',
        especialidade: '',
        role: '',
        senha: ''
      });
      setEditingId(null);
      setIsDialogOpen(false);
      fetchEspecialistas();
    } catch (error: any) {
      console.error('Erro ao salvar especialista:', error);
      toast.error(error.message || 'Erro ao salvar especialista');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (especialista: Profile & { user_role?: UserRole }) => {
    setFormData({
      nome: especialista.nome,
      email: especialista.email,
      telefone: especialista.telefone || '',
      especialidade: especialista.especialidade || '',
      role: especialista.user_role?.role || '',
      senha: ''
    });
    setEditingId(especialista.id);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      header: 'Nome',
      accessorKey: 'nome',
    },
    {
      key: 'email',
      label: 'Email', 
      header: 'Email',
      accessorKey: 'email',
    },
    {
      key: 'especialidade',
      label: 'Especialidade',
      header: 'Especialidade',
      accessorKey: 'especialidade',
      cell: ({ row }: any) => {
        const especialidade = row.getValue('especialidade') as string;
        return especialidade ? (
          <Badge variant="secondary">
            {especialidadeLabels[especialidade] || especialidade}
          </Badge>
        ) : (
          <span className="text-muted-foreground">Não definida</span>
        );
      }
    },
    {
      key: 'role',
      label: 'Função',
      header: 'Função',
      accessorKey: 'user_role.role',
      cell: ({ row }: any) => {
        const role = row.original.user_role?.role;
        return role ? (
          <Badge variant="outline">
            {roleLabels[role] || role}
          </Badge>
        ) : (
          <span className="text-muted-foreground">Sem função</span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Ações',
      header: 'Ações',
      id: 'actions',
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(row.original)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Especialistas</h1>
          <p className="text-muted-foreground">
            Gerencie os especialistas e suas competências
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({
                  nome: '',
                  email: '',
                  telefone: '',
                  especialidade: '',
                  role: '',
                  senha: ''
                });
                setEditingId(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Especialista
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Especialista' : 'Novo Especialista'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    required
                    disabled={!!editingId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                {!editingId && (
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha *</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      placeholder="Digite a senha"
                      required={!editingId}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="especialidade">Especialidade</Label>
                  <Select 
                    value={formData.especialidade} 
                    onValueChange={(value) => setFormData({ ...formData, especialidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="videomaker">Videomaker</SelectItem>
                      <SelectItem value="filmmaker">Filmmaker</SelectItem>
                      <SelectItem value="design">Designer</SelectItem>
                      <SelectItem value="gerente_redes_sociais">Gerente de Redes Sociais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Função no Sistema *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="grs">GRS</SelectItem>
                      <SelectItem value="atendimento">Atendimento</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="filmmaker">Filmmaker</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Especialistas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{especialistas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Designers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {especialistas.filter(e => e.especialidade === 'design').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videomakers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {especialistas.filter(e => ['videomaker', 'filmmaker'].includes(e.especialidade || '')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Designers</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {especialistas.filter(e => e.especialidade === 'design').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Especialistas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={especialistas}
          />
        </CardContent>
      </Card>
    </div>
  );
}