import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/SectionHeader";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Shield, 
  Activity, 
  AlertTriangle,
  Search,
  UserX,
  RefreshCw,
  Key,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Filter
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
import { Label } from "@/components/ui/label";

interface AdminUser {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  status: string;
  created_at: string;
  user_roles?: { role: string }[];
  clientes?: { nome: string };
  last_sign_in_at?: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  adminUsers: number;
  onlineUsers: number;
}

export default function AdminPainel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    adminUsers: 0,
    onlineUsers: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [roleFilter, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const filters = {
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      };

      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'list', filters }
      });

      if (error) throw error;
      
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('status, user_roles(role)');

      if (profilesData) {
        const totalUsers = profilesData.length;
        const activeUsers = profilesData.filter(p => p.status === 'aprovado').length;
        const pendingUsers = profilesData.filter(p => p.status === 'pendente_aprovacao').length;
        const adminUsers = profilesData.filter(p => 
          p.user_roles?.some((r: any) => r.role === 'admin')
        ).length;

        setStats({
          totalUsers,
          activeUsers,
          pendingUsers,
          adminUsers,
          onlineUsers: 0 // Would need real-time tracking
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPassword) {
      toast.error('Digite uma nova senha');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { 
          action: 'reset-password', 
          user_id: userId, 
          new_password: newPassword 
        }
      });

      if (error) throw error;
      
      toast.success('Senha alterada com sucesso');
      setNewPassword("");
      setSelectedUser(null);
    } catch (error: any) {
      toast.error('Erro ao alterar senha');
    }
  };

  const handleForceLogout = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'force-logout', user_id: userId }
      });

      if (error) throw error;
      
      toast.success('Usuário desconectado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao desconectar usuário');
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'update-status', user_id: userId, status }
      });

      if (error) throw error;
      
      toast.success('Status atualizado com sucesso');
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'delete-user', user_id: userId }
      });

      if (error) throw error;
      
      toast.success('Usuário excluído com sucesso');
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-500';
      case 'pendente_aprovacao': return 'bg-yellow-500';
      case 'rejeitado': return 'bg-red-500';
      case 'suspenso': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getRoleText = (user: AdminUser) => {
    return user.user_roles?.[0]?.role || 'sem-role';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="PAINEL ADMINISTRATIVO"
          description="Controle total do sistema - Modo Deus Ativado"
        />
        <Badge variant="destructive" className="animate-pulse">
          <Shield className="h-3 w-3 mr-1" />
          ADMIN MODE
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuários</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Shield className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">{stats.adminUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="h-8 w-8 bg-green-500 rounded-full animate-pulse" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-green-600">{stats.onlineUsers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="grs">GRS</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="atendimento">Atendimento</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="pendente_aprovacao">Pendente</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ações</Label>
              <div className="flex gap-2">
                <Button size="sm" onClick={fetchUsers}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando usuários...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(user.status)}`} />
                    <div>
                      <p className="font-medium">{user.nome}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getRoleText(user)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {user.status}
                        </Badge>
                        {user.clientes && (
                          <Badge variant="outline" className="text-xs">
                            {user.clientes.nome}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Controles Administrativos - {user.nome}</DialogTitle>
                          <DialogDescription>
                            Gerencie o usuário com poderes administrativos
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* User Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Email</Label>
                              <p className="text-sm">{user.email}</p>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <Select
                                value={user.status}
                                onValueChange={(value) => handleUpdateStatus(user.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="aprovado">Aprovado</SelectItem>
                                  <SelectItem value="pendente_aprovacao">Pendente</SelectItem>
                                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                                  <SelectItem value="suspenso">Suspenso</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Reset Password */}
                          <div className="space-y-2">
                            <Label>Nova Senha</Label>
                            <div className="flex gap-2">
                              <Input
                                type="password"
                                placeholder="Digite nova senha..."
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <Button onClick={() => handleResetPassword(user.id)}>
                                <Key className="h-4 w-4 mr-2" />
                                Alterar
                              </Button>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleForceLogout(user.id)}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Desconectar
                            </Button>
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Usuário
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}