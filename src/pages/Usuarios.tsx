import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SectionHeader } from '@/components/SectionHeader';
import { StatsGrid } from '@/components/StatsGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PermissionGate } from '@/components/PermissionGate';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  Shield,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Settings,
  Calendar,
  UserPlus,
  RefreshCw,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfileData } from '@/hooks/useProfileData';

interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar_url?: string;
  status: string;
  especialidade?: string;
  cliente_id?: string;
  created_at: string;
  data_aprovacao?: string;
  aprovado_por?: string;
  observacoes_aprovacao?: string;
  last_sign_in_at?: string;
}

interface AccessLog {
  id: string;
  email: string;
  action: string;
  created_at: string;
  error_message?: string;
  ip_address?: string;
}

const Usuarios = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar logs de acesso
      const { data: logsData, error: logsError } = await supabase
        .from('user_access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setProfiles(profilesData || []);
      setAccessLogs(logsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (profileId: string, action: 'aprovar' | 'rejeitar', observacao?: string) => {
    try {
      const { error } = await supabase.functions.invoke(
        action === 'aprovar' ? 'aprovar_especialista' : 'rejeitar_especialista',
        {
          body: {
            especialista_id: profileId,
            observacao: observacao || null
          }
        }
      );

      if (error) throw error;

      toast({
        title: `Usuário ${action === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso!`,
        description: `O status do usuário foi atualizado`,
      });

      fetchData();
    } catch (error) {
      console.error(`Erro ao ${action} usuário:`, error);
      toast({
        title: `Erro ao ${action} usuário`,
        description: `Não foi possível ${action} o usuário`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejeitado':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      case 'pendente_aprovacao':
        return <Badge className="bg-warning/10 text-warning border-warning/20"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'suspenso':
        return <Badge className="bg-muted text-muted-foreground"><AlertCircle className="h-3 w-3 mr-1" />Suspenso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOnlineStatus = (lastSignIn?: string) => {
    if (!lastSignIn) return { status: 'nunca', color: 'text-muted-foreground', icon: WifiOff };
    
    const lastLogin = new Date(lastSignIn);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastLogin.getTime()) / (1000 * 60);
    
    if (diffMinutes < 15) {
      return { status: 'online', color: 'text-success', icon: Wifi };
    } else if (diffMinutes < 60) {
      return { status: 'recente', color: 'text-warning', icon: Wifi };
    } else {
      return { status: 'offline', color: 'text-muted-foreground', icon: WifiOff };
    }
  };

  // Filtrar profiles
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || profile.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Separar por categorias
  const specialists = filteredProfiles.filter(p => p.especialidade && !p.cliente_id);
  const clients = filteredProfiles.filter(p => p.cliente_id);
  const pending = filteredProfiles.filter(p => p.status === 'pendente_aprovacao');

  const statsData = [
    {
      title: "Total Usuários",
      value: profiles.length,
      icon: Users,
      description: "Usuários cadastrados",
      trend: { value: "3%", isPositive: true },
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Especialistas",
      value: specialists.length,
      icon: UserCheck,
      description: "Membros da equipe",
      trend: { value: "2%", isPositive: true },
      color: "bg-success/10 text-success"
    },
    {
      title: "Clientes",
      value: clients.length,
      icon: Shield,
      description: "Contas de cliente",
      trend: { value: "8%", isPositive: true },
      color: "bg-chart-1/10 text-chart-1"
    },
    {
      title: "Pendentes",
      value: pending.length,
      icon: Clock,
      description: "Aguardando aprovação",
      trend: { value: "-1%", isPositive: false },
      color: "bg-warning/10 text-warning"
    }
  ];

  const ProfileCard = ({ profile, showActions = true }: { profile: Profile; showActions?: boolean }) => {
    const onlineStatus = getOnlineStatus(profile.last_sign_in_at);
    const StatusIcon = onlineStatus.icon;

    return (
      <Card className="hover:shadow-md transition-all duration-200 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {profile.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-background shadow-sm ${onlineStatus.color}`}>
                  <StatusIcon className="h-3 w-3" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{profile.nome}</h3>
                  {getStatusBadge(profile.status)}
                </div>
                <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                {profile.especialidade && (
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{profile.especialidade}</p>
                )}
                <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-3">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  {profile.last_sign_in_at && (
                    <span className="flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      {new Date(profile.last_sign_in_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              {showActions && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProfile(profile);
                      setDetailsOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {profile.status === 'pendente_aprovacao' && (
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproval(profile.id, 'aprovar')}
                        className="border-success/20 text-success hover:bg-success/10"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproval(profile.id, 'rejeitar')}
                        className="border-destructive/20 text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGate module="especialistas" action="canView">
      <div className="p-6 space-y-8 animate-fade-in">
        <SectionHeader
          title="Gerenciar Usuários"
          description="Controle de acesso, aprovações e monitoramento de usuários"
          icon={Users}
          badge="Admin"
          action={{
            label: "Atualizar",
            onClick: fetchData,
            icon: RefreshCw
          }}
        />

        <StatsGrid stats={statsData} />

        <Tabs defaultValue="especialistas" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="especialistas">
                Especialistas
                {specialists.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {specialists.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="clientes">
                Clientes
                {clients.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {clients.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pendentes">
                Pendentes
                {pending.length > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {pending.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="logs">Logs de Acesso</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          <TabsContent value="especialistas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Equipe Interna
                </CardTitle>
                <CardDescription>
                  Membros da equipe com acesso ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {specialists.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {specialists.map((profile) => (
                      <ProfileCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserPlus className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhum especialista encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clientes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Contas de Cliente
                </CardTitle>
                <CardDescription>
                  Usuários com acesso de cliente ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clients.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {clients.map((profile) => (
                      <ProfileCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhum cliente encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pendentes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-warning" />
                  Aprovações Pendentes
                </CardTitle>
                <CardDescription>
                  Usuários aguardando aprovação para acesso ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pending.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pending.map((profile) => (
                      <ProfileCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>Não há aprovações pendentes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Logs de Acesso
                </CardTitle>
                <CardDescription>
                  Histórico de tentativas de login e atividades de usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accessLogs.length > 0 ? (
                  <div className="space-y-3">
                    {accessLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            log.action.includes('success') ? 'bg-success/10 text-success' :
                            log.action.includes('failed') ? 'bg-destructive/10 text-destructive' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            <Activity className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{log.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.action} {log.ip_address && `• ${log.ip_address}`}
                            </p>
                            {log.error_message && (
                              <p className="text-xs text-destructive mt-1">{log.error_message}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhum log de acesso encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de detalhes do usuário */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            {selectedProfile && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={selectedProfile.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedProfile.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedProfile.nome}
                  </DialogTitle>
                  <DialogDescription>
                    Detalhes completos do usuário e histórico
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{selectedProfile.email}</p>
                    </div>
                    {selectedProfile.telefone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                        <p className="text-sm">{selectedProfile.telefone}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedProfile.status)}</div>
                    </div>
                    {selectedProfile.especialidade && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Especialidade</label>
                        <p className="text-sm capitalize">{selectedProfile.especialidade}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                      <p className="text-sm">{new Date(selectedProfile.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    {selectedProfile.last_sign_in_at && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Último Acesso</label>
                        <p className="text-sm">{new Date(selectedProfile.last_sign_in_at).toLocaleString('pt-BR')}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedProfile.observacoes_aprovacao && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Observações de Aprovação</label>
                        <p className="text-sm mt-1 p-3 bg-muted/50 rounded">{selectedProfile.observacoes_aprovacao}</p>
                      </div>
                    </>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                      Fechar
                    </Button>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar Acesso
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  );
};

export default Usuarios;