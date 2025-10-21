import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  Search,
  Settings,
  RefreshCw,
  UserPlus,
  CheckCircle,
  XCircle,
  Palette,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserAdminModal, AdminUser } from '@/components/Admin/UserAdminModal';

const AdminUsuarios = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'list',
          filters: {
            role: filterRole !== 'all' ? filterRole : undefined,
            status: filterStatus !== 'all' ? filterStatus : undefined,
            search: searchTerm || undefined
          }
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Falha ao buscar usuários');
      }

      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: '❌ Erro ao carregar usuários',
        description: error.message || 'Não foi possível carregar os dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user: AdminUser) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleUpdate = () => {
    fetchUsers();
  };

  // Filtrar usuários localmente
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const role = user.user_roles?.[0]?.role || user.role;
    const matchesRole = filterRole === 'all' || role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Categorizar usuários
  const specialists = filteredUsers.filter(u => {
    const role = u.user_roles?.[0]?.role || u.role;
    return role && role !== 'cliente' && !u.cliente_id;
  });

  const clients = filteredUsers.filter(u => {
    const role = u.user_roles?.[0]?.role || u.role;
    return role === 'cliente' || u.cliente_id;
  });

  const pending = filteredUsers.filter(u => u.status === 'pendente_aprovacao');

  const statsData = [
    {
      title: "Total Usuários",
      value: users.length,
      icon: Users,
      description: "Usuários cadastrados",
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Especialistas",
      value: specialists.length,
      icon: Palette,
      description: "Equipe interna",
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      title: "Clientes",
      value: clients.length,
      icon: UserCheck,
      description: "Usuários de clientes",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      title: "Pendentes",
      value: pending.length,
      icon: Clock,
      description: "Aguardando aprovação",
      color: "bg-yellow-500/10 text-yellow-600"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'pendente_aprovacao':
        return <Badge className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'rejeitado':
        return <Badge className="bg-red-500/10 text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      case 'inativo':
        return <Badge className="bg-gray-500/10 text-gray-600">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return <Badge variant="outline">Sem role</Badge>;
    
    const roleConfig: Record<string, { label: string; className: string }> = {
      admin: { label: 'Admin', className: 'bg-primary/10 text-primary' },
      grs: { label: 'GRS', className: 'bg-purple-500/10 text-purple-600' },
      designer: { label: 'Designer', className: 'bg-pink-500/10 text-pink-600' },
      filmmaker: { label: 'Filmmaker', className: 'bg-orange-500/10 text-orange-600' },
      gestor: { label: 'Gestor', className: 'bg-blue-500/10 text-blue-600' },
      financeiro: { label: 'Financeiro', className: 'bg-green-500/10 text-green-600' },
      atendimento: { label: 'Atendimento', className: 'bg-cyan-500/10 text-cyan-600' },
      rh: { label: 'RH', className: 'bg-indigo-500/10 text-indigo-600' },
      cliente: { label: 'Cliente', className: 'bg-gray-500/10 text-gray-600' },
    };

    const config = roleConfig[role] || { label: role, className: 'bg-gray-500/10 text-gray-600' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const renderUserRow = (user: AdminUser) => {
    const role = user.user_roles?.[0]?.role || user.role;
    
    return (
      <TableRow key={user.id}>
        <TableCell className="font-medium">{user.nome}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{getRoleBadge(role)}</TableCell>
        <TableCell>{user.clientes?.nome || user.empresa || '-'}</TableCell>
        <TableCell>{getStatusBadge(user.status)}</TableCell>
        <TableCell className="text-right">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenModal(user)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <SectionHeader
        title="Gerenciamento de Usuários"
        description="Administre usuários, permissões e acessos"
      />

      <StatsGrid stats={statsData} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuários do Sistema</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={fetchUsers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">
                  Todos ({filteredUsers.length})
                </TabsTrigger>
                <TabsTrigger value="specialists">
                  <Palette className="h-4 w-4 mr-2" />
                  Especialistas ({specialists.length})
                </TabsTrigger>
                <TabsTrigger value="clients">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Clientes ({clients.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  <Clock className="h-4 w-4 mr-2" />
                  Pendentes ({pending.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Cliente/Empresa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(renderUserRow)
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="specialists" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialists.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum especialista encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      specialists.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nome}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.user_roles?.[0]?.role || user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(user)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="clients" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum cliente encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nome}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.clientes?.nome || user.empresa || '-'}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(user)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum usuário pendente
                        </TableCell>
                      </TableRow>
                    ) : (
                      pending.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nome}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.user_roles?.[0]?.role || user.role)}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(user)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <UserAdminModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={selectedUser}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default AdminUsuarios;
