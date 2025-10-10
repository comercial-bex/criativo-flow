import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  Search, 
  UserPlus, 
  Settings, 
  Activity,
  Filter,
  Download,
  AlertTriangle,
  Brain,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIAnalyticsDashboard } from "@/components/AIAnalyticsDashboard";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

interface AdminUser {
  id: string;
  nome: string;
  email: string;
  status: string;
  created_at: string;
  user_roles?: Array<{ role: string }>;
}

interface UserStats {
  total: number;
  admins: number;
  clientes: number;
  especialistas: number;
  pendentes: number;
}

export default function AdminPainel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const { startTutorial, hasSeenTutorial } = useTutorial('admin-painel');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    clientes: 0,
    especialistas: 0,
    pendentes: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'list' }
      });

      if (error) throw error;

      const usersData = data.users || [];
      setUsers(usersData);
      calculateStats(usersData);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData: AdminUser[]) => {
    const stats: UserStats = {
      total: usersData.length,
      admins: usersData.filter(u => u.user_roles?.[0]?.role === 'admin').length,
      clientes: usersData.filter(u => u.user_roles?.[0]?.role === 'cliente').length,
      especialistas: usersData.filter(u => ['grs', 'designer', 'filmmaker'].includes(u.user_roles?.[0]?.role || '')).length,
      pendentes: usersData.filter(u => u.status === 'pendente_aprovacao').length
    };
    setStats(stats);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== "all") {
      filtered = filtered.filter(user => user.user_roles?.[0]?.role === filterRole);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <CardTitle className="text-2xl text-orange-800">PAINEL ADMINISTRATIVO</CardTitle>
                <p className="text-orange-700">Controle total do sistema + IA</p>
              </div>
            </div>
            <Badge variant="destructive" className="text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              MODO DEUS
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs para organizar funcionalidades */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics" className="flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            Analytics IA
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AIAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="users">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Shield className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold">{stats.clientes}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Settings className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Especialistas</p>
                  <p className="text-2xl font-bold">{stats.especialistas}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.pendentes}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="grs">GRS</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="filmmaker">Filmmaker</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="pendente_aprovacao">Pendente</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchUsers} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <span className="ml-3">Carregando usuários...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(user.status)}`}></div>
                        <div>
                          <h4 className="font-medium">{user.nome}</h4>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Badge variant="outline">{getRoleText(user)}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.status === 'aprovado' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Relatórios
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Backup
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}