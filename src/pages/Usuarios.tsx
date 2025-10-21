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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  WifiOff,
  Trash2,
  Plus,
  User,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfileData } from '@/hooks/useProfileData';
import { useAdminUserManagement } from '@/hooks/useAdminUserManagement';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { NewUserModal } from '@/components/Admin/NewUserModal';
import { DataSyncIndicator } from '@/components/Admin/DataSyncIndicator';
import { EditRoleDialog } from '@/components/Admin/EditRoleDialog';
import { validarColaborador, StatusValidacao } from '@/hooks/useColaboradorValidation';
import { AlertaDadosIncompletos } from '@/components/RH/AlertaDadosIncompletos';
import { Pessoa } from '@/hooks/usePessoas';
import { PessoaEditModal } from '@/components/RH/PessoaEditModal';

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
  role?: string;
  empresa?: string;
  role_requested?: string;
  cpf?: string;
  papeis?: string[];
  pessoa_cliente_id?: string;
  pessoa?: Pessoa | null;
  validacao?: StatusValidacao | null;
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'gestor' | 'grs' | 'designer' | 'filmmaker' | 'atendimento' | 'financeiro' | 'trafego' | 'cliente' | 'fornecedor' | 'rh' | ''>('');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [editRoleProfile, setEditRoleProfile] = useState<Profile | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [pessoaEditando, setPessoaEditando] = useState<Pessoa | null>(null);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [editingPendingUser, setEditingPendingUser] = useState(false);
  const [editedTipoCadastro, setEditedTipoCadastro] = useState<'especialista' | 'cliente'>('cliente');
  const [editedDepartamento, setEditedDepartamento] = useState('');
  const [editedEmpresa, setEditedEmpresa] = useState('');
  const { toast } = useToast();
  const { deleteUser, loading: deleting } = useAdminUserManagement();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1) Buscar perfis básicos (sem joins implícitos)
      const { data: profilesData, error: profilesError } = await supabase
        .from('pessoas')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const profileIds = (profilesData ?? []).map((p: any) => p.id).filter(Boolean);

      // 2) Consultas paralelas independentes: roles, pessoas, logs de acesso
      const [
        { data: rolesData, error: rolesError },
        { data: pessoasData, error: pessoasError },
        { data: logsData, error: logsError },
      ] = await Promise.all([
        profileIds.length
          ? supabase
              .from('user_roles')
              .select('user_id, role')
              .in('user_id', profileIds)
          : Promise.resolve({ data: [], error: null } as any),
        profileIds.length
          ? supabase
              .from('pessoas')
              .select(`
                profile_id,
                cpf,
                papeis,
                cliente_id,
                regime,
                cargo_atual,
                salario_base,
                fee_mensal,
                dados_bancarios,
                data_admissao,
                email,
                telefones,
                status,
                nome
              `, { count: 'exact' })
              .in('profile_id', profileIds)
          : Promise.resolve({ data: [], error: null } as any),
        supabase
          .from('user_access_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (rolesError) throw rolesError;
      if (pessoasError) throw pessoasError;
      if (logsError) throw logsError;

      // 3) Carregar clientes referenciados em profiles ou em pessoas
      const clienteIds = Array.from(
        new Set(
          [
            ...(profilesData ?? []).map((p: any) => p.cliente_id).filter(Boolean),
            ...(pessoasData ?? []).map((p: any) => p.cliente_id).filter(Boolean),
          ] as string[]
        )
      );

      const { data: clientesData, error: clientesError } = clienteIds.length
        ? await supabase
            .from('clientes')
            .select('id, nome, nome_fantasia, razao_social')
            .in('id', clienteIds)
        : ({ data: [], error: null } as any);

      if (clientesError) {
        console.warn('Aviso: erro ao carregar clientes:', clientesError);
      }

      // 4) Índices para merge eficiente
      const rolesByUserId = new Map<string, string>(
        (rolesData ?? []).map((r: any) => [r.user_id, r.role])
      );
      const pessoasByProfileId = new Map<string, any>(
        (pessoasData ?? []).map((p: any) => [p.profile_id, p])
      );
      const clientesById = new Map<string, any>(
        (clientesData ?? []).map((c: any) => [c.id, c])
      );

      // 5) Montar estrutura final de profiles
      const profilesWithRole = (profilesData ?? []).map((profile: any) => {
        const pessoa = pessoasByProfileId.get(profile.id);
        const role = rolesByUserId.get(profile.id) || null;
        const pessoaClienteId = pessoa?.cliente_id || null;
        const efetivoClienteId = pessoaClienteId || profile.cliente_id || null;
        const cliente = efetivoClienteId ? clientesById.get(efetivoClienteId) : null;

        // Criar objeto Pessoa completo para validação (apenas para especialistas)
        const pessoaParaValidacao = pessoa && role && role !== 'cliente' ? {
          id: pessoa.profile_id || profile.id,
          nome: pessoa.nome || profile.nome,
          email: pessoa.email || profile.email,
          cpf: pessoa.cpf,
          papeis: pessoa.papeis,
          regime: pessoa.regime,
          cargo_atual: pessoa.cargo_atual,
          salario_base: pessoa.salario_base,
          fee_mensal: pessoa.fee_mensal,
          dados_bancarios: pessoa.dados_bancarios,
          data_admissao: pessoa.data_admissao,
          telefones: pessoa.telefones,
          status: pessoa.status || profile.status
        } as Pessoa : null;

        const validacao = pessoaParaValidacao ? validarColaborador(pessoaParaValidacao) : null;

        return {
          ...profile,
          role,
          cpf: pessoa?.cpf || null,
          papeis: pessoa?.papeis || [],
          pessoa_cliente_id: pessoaClienteId,
          empresa: cliente?.nome_fantasia || cliente?.razao_social || cliente?.nome || null,
          pessoa: pessoaParaValidacao,
          validacao
        } as Profile;
      });

      setProfiles(profilesWithRole);
      setAccessLogs(logsData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error?.message || 'Não foi possível carregar os dados de usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleApproval = async (profileId: string, action: 'aprovar' | 'rejeitar', observacao?: string) => {
    try {
      const { error } = await supabase.rpc(
        action === 'aprovar' ? 'aprovar_especialista' : 'rejeitar_especialista',
        {
          especialista_id: profileId,
          observacao: observacao || null
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const result = await deleteUser(userToDelete.id);
    
    if (result.success) {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      fetchData();
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedProfile || !selectedRole) return;

    setUpdatingRole(true);
    try {
      const { error } = await supabase.rpc('update_user_role', {
        p_user_id: selectedProfile.id,
        p_new_role: selectedRole
      });

      if (error) throw error;

      toast({
        title: "✅ Role atualizada com sucesso!",
        description: `${selectedProfile.nome} agora tem a role: ${selectedRole}`,
      });

      fetchData();
      setDetailsOpen(false);
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      toast({
        title: "❌ Erro ao atualizar role",
        description: error.message || "Não foi possível atualizar a role do usuário",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleUpdateRoleFromDialog = async (profileId: string, newRole: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    setUpdatingRole(true);
    try {
      const { error } = await supabase.rpc('update_user_role', {
        p_user_id: profileId,
        p_new_role: newRole as 'admin' | 'gestor' | 'grs' | 'designer' | 'filmmaker' | 'atendimento' | 'financeiro' | 'trafego' | 'cliente' | 'fornecedor' | 'rh'
      });

      if (error) throw error;

      toast({
        title: "✅ Role atualizada com sucesso!",
        description: `${profile.nome} agora tem a role: ${newRole}`,
      });

      fetchData();
      setEditRoleOpen(false);
      setEditRoleProfile(null);
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      toast({
        title: "❌ Erro ao atualizar role",
        description: error.message || "Não foi possível atualizar a role do usuário",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleSavePendingEdits = async () => {
    if (!selectedProfile) return;

    setUpdatingRole(true);
    try {
      const updates: any = {};

      if (editedTipoCadastro === 'especialista') {
        const especialidadeMap: Record<string, string> = {
          'grs': 'grs',
          'designer': 'design',
          'filmmaker': 'filmmaker',
          'atendimento': 'atendimento',
          'financeiro': 'financeiro',
          'rh': 'atendimento'
        };

        updates.especialidade = especialidadeMap[editedDepartamento] || 'atendimento';
        updates.empresa = null;
        updates.role_requested = null;
        updates.cliente_id = null;

        await supabase
          .from('pessoas')
          .update({ papeis: ['colaborador'] })
          .eq('profile_id', selectedProfile.id);

      } else {
        updates.empresa = editedEmpresa;
        updates.role_requested = editedDepartamento;
        updates.especialidade = null;

        await supabase
          .from('pessoas')
          .update({ papeis: ['cliente'] })
          .eq('profile_id', selectedProfile.id);
      }

      const { error } = await supabase
        .from('pessoas')
        .update(updates)
        .eq('profile_id', selectedProfile.id);

      if (error) throw error;

      toast({
        title: "✅ Alterações salvas com sucesso!",
        description: `Tipo de cadastro atualizado para: ${editedTipoCadastro === 'especialista' ? 'Especialista BEX' : 'Cliente'}`,
      });

      setEditingPendingUser(false);
      fetchData();

    } catch (error: any) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        title: "❌ Erro ao salvar alterações",
        description: error.message || "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(false);
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
  const specialists = filteredProfiles.filter(p => {
    // Especialista = tem papeis na tabela pessoas (grs, design, audiovisual, etc) 
    // OU tem role que não seja cliente, E não tem vínculo com cliente
    const temPapelEspecialista = p.papeis && p.papeis.length > 0 && 
      p.papeis.some(papel => ['grs', 'design', 'audiovisual', 'financeiro', 'atendimento', 'rh', 'trafego', 'especialista', 'colaborador'].includes(papel));
    
    const temRoleEspecialista = p.role && p.role !== 'cliente';
    
    const naoEhCliente = !p.cliente_id && !p.pessoa_cliente_id;
    
    return (temPapelEspecialista || temRoleEspecialista) && naoEhCliente;
  });
  
  const clients = filteredProfiles.filter(p => {
    // Cliente = tem cliente_id EM profiles OU em pessoas, OU tem role 'cliente'
    return p.cliente_id || 
           p.pessoa_cliente_id || 
           p.role === 'cliente';
  });
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

    const getOnlineTooltip = () => {
      if (onlineStatus.status === 'nunca') return 'Usuário nunca fez login';
      if (onlineStatus.status === 'online') return 'Online agora';
      if (onlineStatus.status === 'recente') return 'Visto recentemente (< 1h)';
      if (profile.last_sign_in_at) {
        return `Último acesso: ${new Date(profile.last_sign_in_at).toLocaleString('pt-BR')}`;
      }
      return 'Status desconhecido';
    };

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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-background shadow-sm ${onlineStatus.color} cursor-help`}>
                      <StatusIcon className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {getOnlineTooltip()}
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{profile.nome}</h3>
                  {getStatusBadge(profile.status)}
                </div>
                <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                {(profile.papeis?.length > 0 || profile.especialidade || profile.role === 'admin') && (
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {profile.papeis && profile.papeis.length > 0 
                      ? profile.papeis.map(p => {
                          const labels: Record<string, string> = {
                            'grs': 'GRS',
                            'design': 'Designer',
                            'audiovisual': 'Filmmaker',
                            'financeiro': 'Financeiro',
                            'atendimento': 'Atendimento',
                            'rh': 'RH',
                            'trafego': 'Tráfego',
                            'especialista': 'Especialista',
                            'colaborador': 'Colaborador'
                          };
                          return labels[p] || p;
                        }).join(', ')
                      : profile.especialidade || 'Administrador'}
                  </p>
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
                    title="Ver detalhes completos"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {profile.status === 'aprovado' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditRoleProfile(profile);
                        setEditRoleOpen(true);
                      }}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      title="Editar função/role"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUserToDelete(profile);
                      setDeleteConfirmOpen(true);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Deletar usuário permanentemente"
                  >
                    <Trash2 className="h-4 w-4" />
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

                  {/* Badge de validação para especialistas internos */}
                  {profile.pessoa && profile.validacao && profile.validacao.nivel !== 'completo' && (
                    <AlertaDadosIncompletos
                      pessoa={profile.pessoa}
                      validacao={profile.validacao}
                      onEditarInline={() => {
                        setPessoaEditando(profile.pessoa);
                        setModalEdicaoAberto(true);
                      }}
                    />
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
      <TooltipProvider>
        <div className="p-6 space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <SectionHeader
              title="Gerenciar Usuários"
              description="Controle de acesso, aprovações e monitoramento de usuários"
              icon={Users}
              badge="Admin"
            />
            <div className="flex gap-2">
              <DataSyncIndicator />
              <Button onClick={() => setNewUserModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>

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
            {/* Alerta de dados incompletos */}
            {specialists.some(s => s.validacao && s.validacao.nivel !== 'completo') && (
              <Alert variant="default" className="border-warning bg-warning/5">
                <AlertCircle className="h-4 w-4 text-warning" />
                <AlertTitle className="text-warning">⚠️ Dados RH/Financeiros Incompletos Detectados</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  Alguns especialistas estão com dados de RH/financeiros incompletos. 
                  Isso pode impedir a geração de folha de pagamento e relatórios.
                  <br />
                  <span className="font-medium">Verifique os badges nos cards abaixo e complete os dados necessários.</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-3"
                    onClick={() => window.location.href = '/rh/pessoas'}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Ir para RH &gt; Pessoas
                  </Button>
                </AlertDescription>
              </Alert>
            )}

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
                  {/* SEÇÃO 1: DADOS PESSOAIS */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Dados Pessoais
                    </h3>
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
                      {selectedProfile.cpf && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">CPF</label>
                          <p className="text-sm">{selectedProfile.cpf}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedProfile.status)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                        <p className="text-sm">{new Date(selectedProfile.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* SEÇÃO 2: TIPO DE CADASTRO */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Tipo de Cadastro
                    </h3>
                    
                    {selectedProfile.status === 'pendente_aprovacao' && editingPendingUser ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tipo de Cadastro</label>
                          <RadioGroup 
                            value={editedTipoCadastro} 
                            onValueChange={(value) => setEditedTipoCadastro(value as 'especialista' | 'cliente')}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="especialista" id="edit-especialista" />
                              <label htmlFor="edit-especialista" className="text-sm cursor-pointer">
                                Especialista BEX (Colaborador Interno)
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cliente" id="edit-cliente" />
                              <label htmlFor="edit-cliente" className="text-sm cursor-pointer">
                                Cliente (Externo)
                              </label>
                            </div>
                          </RadioGroup>
                        </div>

                        {editedTipoCadastro === 'especialista' ? (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Departamento/Área</label>
                            <Select value={editedDepartamento} onValueChange={setEditedDepartamento}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grs">GRS - Gestão de Redes Sociais</SelectItem>
                                <SelectItem value="designer">Designer - Criação Visual</SelectItem>
                                <SelectItem value="filmmaker">Filmmaker - Produção Audiovisual</SelectItem>
                                <SelectItem value="atendimento">Atendimento - Suporte ao Cliente</SelectItem>
                                <SelectItem value="financeiro">Financeiro - Contabilidade</SelectItem>
                                <SelectItem value="rh">RH - Recursos Humanos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium">Nome da Empresa</label>
                              <Input
                                value={editedEmpresa}
                                onChange={(e) => setEditedEmpresa(e.target.value)}
                                placeholder="Ex: Minha Empresa Ltda"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Departamento</label>
                              <Select value={editedDepartamento} onValueChange={setEditedDepartamento}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="financeiro">Financeiro</SelectItem>
                                  <SelectItem value="marketing">Marketing</SelectItem>
                                  <SelectItem value="proprietario">Proprietário/Decisor</SelectItem>
                                  <SelectItem value="operacional">Operacional</SelectItem>
                                  <SelectItem value="rh">RH</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingPendingUser(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleSavePendingEdits}
                            disabled={updatingRole || (editedTipoCadastro === 'cliente' && !editedEmpresa)}
                          >
                            {updatingRole ? 'Salvando...' : 'Salvar Alterações'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={selectedProfile.cliente_id ? 'default' : 'secondary'}>
                              {selectedProfile.cliente_id ? 'Cliente' : 'Especialista BEX'}
                            </Badge>
                            {selectedProfile.status === 'pendente_aprovacao' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setEditingPendingUser(true);
                                  setEditedTipoCadastro(selectedProfile.cliente_id ? 'cliente' : 'especialista');
                                  setEditedDepartamento(selectedProfile.role_requested || selectedProfile.especialidade || '');
                                  setEditedEmpresa(selectedProfile.empresa || '');
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                            )}
                          </div>
                        </div>

                        {!selectedProfile.cliente_id && selectedProfile.especialidade && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Especialidade</label>
                            <p className="text-sm capitalize">{selectedProfile.especialidade}</p>
                          </div>
                        )}

                        {selectedProfile.cliente_id && (
                          <>
                            {selectedProfile.empresa && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                                <p className="text-sm">{selectedProfile.empresa}</p>
                              </div>
                            )}
                            {selectedProfile.role_requested && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Departamento Solicitado</label>
                                <p className="text-sm capitalize">{selectedProfile.role_requested}</p>
                              </div>
                            )}
                          </>
                        )}
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

                  {/* SEÇÃO 3: EDIÇÃO DE ROLE (apenas aprovados) */}
                  {selectedProfile.status === 'aprovado' && (
                    <>
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Editar Função/Role</label>
                        <Select 
                          value={selectedRole} 
                          onValueChange={(value: string) => setSelectedRole(value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma role..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="gestor">Gestor</SelectItem>
                            <SelectItem value="grs">GRS</SelectItem>
                            <SelectItem value="designer">Designer</SelectItem>
                            <SelectItem value="filmmaker">Filmmaker</SelectItem>
                            <SelectItem value="atendimento">Atendimento</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="trafego">Tráfego</SelectItem>
                            <SelectItem value="cliente">Cliente</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Alterar a role do usuário afetará suas permissões de acesso ao sistema.
                        </p>
                      </div>
                      <Separator />
                    </>
                  )}
                  
                  {/* BOTÕES DE AÇÃO */}
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => {
                      setDetailsOpen(false);
                      setEditingPendingUser(false);
                    }}>
                      Fechar
                    </Button>

                    {selectedProfile.status === 'pendente_aprovacao' && !editingPendingUser && (
                      <>
                        <Button
                          variant="outline"
                          className="border-destructive/20 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDetailsOpen(false);
                            handleApproval(selectedProfile.id, 'rejeitar');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                        <Button
                          className="bg-success hover:bg-success/90"
                          onClick={() => {
                            setDetailsOpen(false);
                            handleApproval(selectedProfile.id, 'aprovar');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                      </>
                    )}

                    {selectedProfile.status === 'aprovado' && selectedRole && (
                      <Button 
                        onClick={handleUpdateRole}
                        disabled={updatingRole}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {updatingRole ? 'Salvando...' : 'Salvar Role'}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmationDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="⚠️ Deletar Usuário Permanentemente?"
          description={
            userToDelete 
              ? `Você está prestes a deletar "${userToDelete.nome}" (${userToDelete.email}).

Esta ação:
• Remove o usuário do sistema de autenticação
• Remove o perfil e dados vinculados
• Define campos de auditoria como NULL (preserva histórico)
• NÃO pode ser desfeita

Tem certeza que deseja continuar?`
              : ''
          }
          confirmText="Sim, deletar permanentemente"
          cancelText="Cancelar"
          onConfirm={handleDeleteUser}
          variant="destructive"
        />

        <NewUserModal
          open={newUserModalOpen}
          onOpenChange={setNewUserModalOpen}
          onSuccess={fetchData}
        />

        <EditRoleDialog
          open={editRoleOpen}
          onOpenChange={setEditRoleOpen}
          profile={editRoleProfile}
          onRoleUpdate={handleUpdateRoleFromDialog}
        />

        {pessoaEditando && (
          <PessoaEditModal
            open={modalEdicaoAberto}
            onOpenChange={setModalEdicaoAberto}
            pessoa={pessoaEditando}
            onSaved={() => {
              setModalEdicaoAberto(false);
              setPessoaEditando(null);
              fetchData();
            }}
          />
        )}
        </div>
      </TooltipProvider>
    </PermissionGate>
  );
};

export default Usuarios;