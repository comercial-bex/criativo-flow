import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/DataTable';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Users, Palette, Camera, User, Clock, CheckCircle, XCircle, Pause, Eye, Trash2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { EspecialistaApprovalCard } from '@/components/EspecialistaApprovalCard';
import { ApprovalActionsModal } from '@/components/ApprovalActionsModal';
import { StatusBadgeEspecialista } from '@/components/StatusBadgeEspecialista';
import { PermissionGate } from '@/components/PermissionGate';
import { PermissionWrapper } from '@/components/PermissionWrapper';
import { ViewEspecialistaModal } from '@/components/ViewEspecialistaModal';
import { ViewClienteModal } from '@/components/ViewClienteModal';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  status?: 'pendente_aprovacao' | 'aprovado' | 'rejeitado' | 'suspenso';
  observacoes_aprovacao?: string;
  data_aprovacao?: string;
  aprovado_por?: string;
};
type UserRole = Database['public']['Enums']['user_role'];

const especialidadeLabels = {
  'grs': 'Gestão de Redes Sociais',
  'design': 'Design',
  'audiovisual': 'Audiovisual',
  'atendimento': 'Atendimento',
  'financeiro': 'Financeiro',
  'gestor': 'Gestor'
};

const roleLabels = {
  'admin': 'Administrador',
  'grs': 'GRS',
  'design': 'Designer',
  'audiovisual': 'Audiovisual',
  'atendimento': 'Atendimento',
  'financeiro': 'Financeiro',
  'gestor': 'Gestor',
  'cliente': 'Cliente'
};

interface EspecialistaFormData {
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  role: string;
  password: string;
}

interface ApprovalAction {
  especialistaId: string;
  especialistaNome: string;
  action: 'approve' | 'reject' | 'suspend';
}

export default function Especialistas() {
  const [especialistas, setEspecialistas] = useState<(Profile & { role?: UserRole })[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [approvalAction, setApprovalAction] = useState<ApprovalAction | null>(null);
  const [viewEspecialista, setViewEspecialista] = useState<any>(null);
  const [deleteEspecialista, setDeleteEspecialista] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState<EspecialistaFormData>({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
    role: '',
    password: ''
  });

  const fetchEspecialistas = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar profiles (apenas especialistas, não clientes)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('especialidade', 'is', null);

      if (profilesError) {
        throw profilesError;
      }

      // Buscar roles dos usuários
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        throw rolesError;
      }

      // Combinar dados
      const especialistasComRoles = profiles?.map(profile => {
        const userRole = userRoles?.find(role => role.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role
        };
      }) || [];

      setEspecialistas(especialistasComRoles as any);
    } catch (error: any) {
      console.error('Erro ao buscar especialistas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar especialistas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApprovalAction = useCallback(async (observacao?: string) => {
    if (!approvalAction) return;

    setApprovalLoading(true);
    try {
      const functionName = approvalAction.action === 'approve' ? 'aprovar_especialista' : 'rejeitar_especialista';
      
      if (approvalAction.action === 'suspend') {
        // Para suspensão, atualizamos diretamente
        const { error } = await supabase
          .from('profiles')
          .update({ 
            status: 'suspenso',
            observacoes_aprovacao: observacao,
            data_aprovacao: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', approvalAction.especialistaId);

        if (error) throw error;
      } else {
        // Para aprovar/rejeitar, usamos as funções do banco
        const { error } = await supabase.rpc(functionName, {
          especialista_id: approvalAction.especialistaId,
          observacao: observacao || null
        });

        if (error) throw error;
      }

      await fetchEspecialistas();
      
      toast({
        title: "Sucesso",
        description: `Especialista ${
          approvalAction.action === 'approve' ? 'aprovado' : 
          approvalAction.action === 'reject' ? 'rejeitado' : 'suspenso'
        } com sucesso`,
      });
    } catch (error: any) {
      console.error('Erro na ação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar ação",
        variant: "destructive",
      });
    } finally {
      setApprovalLoading(false);
      setApprovalAction(null);
    }
  }, [approvalAction, fetchEspecialistas]);

  useEffect(() => {
    fetchEspecialistas();
  }, [fetchEspecialistas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.role) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Atualizar especialista existente usando edge function
        const { data: response, error } = await supabase.functions.invoke('manage-specialist', {
          body: {
            action: 'update-specialist',
            especialistaData: {
              id: editingId,
              nome: formData.nome,
              telefone: formData.telefone,
              especialidade: formData.especialidade,
              role: formData.role
            }
          }
        });

        if (error) {
          console.error('❌ Erro da edge function:', error);
          throw new Error(error.message || 'Erro ao atualizar especialista');
        }

        if (!response?.success) {
          console.error('❌ Resposta da edge function indica falha:', response);
          throw new Error(response?.error || 'Erro ao atualizar especialista');
        }

        toast({
          title: "Sucesso",
          description: "Especialista atualizado com sucesso",
        });
      } else {
        // Criar novo usuário usando Edge Function
        const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.email,
            password: formData.password,
            nome: formData.nome,
            telefone: formData.telefone,
            especialidade: formData.especialidade,
            role: formData.role
          }
        });

        if (userError) throw userError;

        toast({
          title: "Sucesso",
          description: "Especialista criado com sucesso",
        });
      }

      setFormData({
        nome: '',
        email: '',
        telefone: '',
        especialidade: '',
        role: '',
        password: ''
      });
      setEditingId(null);
      setIsDialogOpen(false);
      fetchEspecialistas();
    } catch (error: any) {
      console.error('Erro ao salvar especialista:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar especialista",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (especialista: Profile & { role?: UserRole }) => {
    setEditingId(especialista.id);
    setFormData({
      nome: especialista.nome,
      email: especialista.email || '',
      telefone: especialista.telefone || '',
      especialidade: especialista.especialidade || '',
      role: especialista.role || '',
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleView = (especialista: Profile & { role?: UserRole }) => {
    setViewEspecialista(especialista);
  };

  const handleDelete = async () => {
    if (!deleteEspecialista) return;

    setDeleteLoading(true);
    try {
      // Usar edge function para deletar com verificações adequadas
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { 
          action: 'delete-user', 
          user_id: deleteEspecialista.id 
        }
      });

      if (error) throw error;

      await fetchEspecialistas();
      
      toast({
        title: "Sucesso",
        description: "Especialista excluído com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao excluir especialista:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir especialista",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteEspecialista(null);
    }
  };

  // Filtrar especialistas por status
  const filteredEspecialistas = especialistas.filter(especialista => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return especialista.status === 'pendente_aprovacao';
    if (activeTab === 'approved') return especialista.status === 'aprovado';
    if (activeTab === 'rejected') return especialista.status === 'rejeitado';
    if (activeTab === 'suspended') return especialista.status === 'suspenso';
    return true;
  });

  // Estatísticas
  const stats = {
    total: especialistas.length,
    pending: especialistas.filter(e => e.status === 'pendente_aprovacao').length,
    approved: especialistas.filter(e => e.status === 'aprovado').length,
    rejected: especialistas.filter(e => e.status === 'rejeitado').length,
    suspended: especialistas.filter(e => e.status === 'suspenso').length,
  };

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      render: (value: any) => value || '-'
    },
    {
      key: 'email',
      label: 'E-mail',
      render: (value: any) => value || '-'
    },
    {
      key: 'especialidade',
      label: 'Especialidade',
      render: (value: any) => value ? especialidadeLabels[value as keyof typeof especialidadeLabels] || value : '-'
    },
    {
      key: 'role',
      label: 'Função',
      render: (value: any) => value ? roleLabels[value as keyof typeof roleLabels] || value : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => <StatusBadgeEspecialista status={value || 'aprovado'} />
    }
  ];

  // Ações da tabela
  const tableActions = [
    {
      label: "Ver",
      onClick: handleView,
      variant: 'outline' as const
    },
    {
      label: "Editar",
      onClick: handleEdit,
      variant: 'outline' as const,
      wrapper: (action: ReactNode) => (
        <PermissionWrapper module="especialistas" action="canEdit" showErrorToast>
          {action}
        </PermissionWrapper>
      )
    },
    {
      label: "Excluir",
      onClick: (especialista: any) => setDeleteEspecialista(especialista),
      variant: 'destructive' as const,
      wrapper: (action: ReactNode) => (
        <PermissionWrapper module="especialistas" action="canDelete" showErrorToast>
          {action}
        </PermissionWrapper>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Gestão de Especialistas</h1>
        <PermissionGate module="especialistas" action="canCreate">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingId(null)}>
                <Plus className="w-4 h-4 mr-2" />
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
                      <Label htmlFor="password">Senha *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                        <SelectItem value="grs">Gestão de Redes Sociais</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="audiovisual">Audiovisual</SelectItem>
                        <SelectItem value="atendimento">Atendimento</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="gestor">Gestor</SelectItem>
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
                        <SelectItem value="design">Designer</SelectItem>
                        <SelectItem value="audiovisual">Audiovisual</SelectItem>
                        <SelectItem value="atendimento">Atendimento</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="gestor">Gestor</SelectItem>
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
        </PermissionGate>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspensos</CardTitle>
            <Pause className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Área de aprovações com abas */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Especialistas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Aprovados ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados ({stats.rejected})</TabsTrigger>
              <TabsTrigger value="suspended">Suspensos ({stats.suspended})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <DataTable
                title="Especialistas"
                columns={columns}
                data={filteredEspecialistas}
                actions={tableActions}
                searchable={true}
                emptyMessage="Nenhum especialista encontrado"
              />
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {stats.pending === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum especialista aguardando aprovação</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredEspecialistas.map((especialista) => (
                    <EspecialistaApprovalCard
                      key={especialista.id}
                      especialista={especialista}
                      onApprove={(id) => setApprovalAction({
                        especialistaId: id,
                        especialistaNome: especialista.nome,
                        action: 'approve'
                      })}
                      onReject={(id) => setApprovalAction({
                        especialistaId: id,
                        especialistaNome: especialista.nome,
                        action: 'reject'
                      })}
                      onSuspend={(id) => setApprovalAction({
                        especialistaId: id,
                        especialistaNome: especialista.nome,
                        action: 'suspend'
                      })}
                      isLoading={approvalLoading}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <div className="grid gap-4">
                {filteredEspecialistas.map((especialista) => (
                  <EspecialistaApprovalCard
                    key={especialista.id}
                    especialista={especialista}
                    onApprove={(id) => setApprovalAction({
                      especialistaId: id,
                      especialistaNome: especialista.nome,
                      action: 'approve'
                    })}
                    onReject={(id) => setApprovalAction({
                      especialistaId: id,
                      especialistaNome: especialista.nome,
                      action: 'reject'
                    })}
                    onSuspend={(id) => setApprovalAction({
                      especialistaId: id,
                      especialistaNome: especialista.nome,
                      action: 'suspend'
                    })}
                    isLoading={approvalLoading}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              <div className="grid gap-4">
                {filteredEspecialistas.map((especialista) => (
                  <EspecialistaApprovalCard
                    key={especialista.id}
                    especialista={especialista}
                    onApprove={(id) => setApprovalAction({
                      especialistaId: id,
                      especialistaNome: especialista.nome,
                      action: 'approve'
                    })}
                    onReject={(id) => setApprovalAction({
                      especialistaId: id,
                      especialistaNome: especialista.nome,
                      action: 'reject'
                    })}
                    onSuspend={(id) => setApprovalAction({
                      especialistaId: id,
                      especialistaNome: especialista.nome,
                      action: 'suspend'
                    })}
                    isLoading={approvalLoading}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="suspended" className="space-y-4">
              <div className="grid gap-4">
                {filteredEspecialistas.map((especialista) => (
                  <EspecialistaApprovalCard
                    key={especialista.id}
                    especialista={especialista}
                    onApprove={(id) => setApprovalAction({
                      especialistaId: id,
                      especialistaNome: especialista.nome,
                      action: 'approve'
                    })}
                    onReject={(id) => setApprovalAction({
                      especialistaId: id,
                      especialistaNome: especialista.nome,
                      action: 'reject'
                    })}
                    onSuspend={(id) => setApprovalAction({
                      especialistaId: id,
                      especialistaNome: especialista.nome,
                      action: 'suspend'
                    })}
                    isLoading={approvalLoading}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de confirmação de ações */}
      {approvalAction && (
        <ApprovalActionsModal
          isOpen={!!approvalAction}
          onClose={() => setApprovalAction(null)}
          onConfirm={handleApprovalAction}
          especialistaNome={approvalAction.especialistaNome}
          action={approvalAction.action}
          isLoading={approvalLoading}
        />
      )}

      {/* Renderização condicional: Modal de Cliente ou Especialista */}
      {viewEspecialista?.cliente_id ? (
        <ViewClienteModal
          isOpen={!!viewEspecialista}
          onClose={() => setViewEspecialista(null)}
          cliente={viewEspecialista}
        />
      ) : (
        <ViewEspecialistaModal
          isOpen={!!viewEspecialista}
          onClose={() => setViewEspecialista(null)}
          especialista={viewEspecialista}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteEspecialista}
        onClose={() => setDeleteEspecialista(null)}
        onConfirm={handleDelete}
        especialistaNome={deleteEspecialista?.nome || ''}
        isLoading={deleteLoading}
      />
    </div>
  );
}