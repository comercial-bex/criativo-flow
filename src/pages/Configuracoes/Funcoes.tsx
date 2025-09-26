import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Users, Shield, Edit } from 'lucide-react';

interface RolePermission {
  id: string;
  role: string;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const MODULES = [
  { key: 'dashboard', name: 'Dashboard', icon: '📊' },
  { key: 'clientes', name: 'Clientes', icon: '👥' },
  { key: 'crm', name: 'CRM', icon: '📞' },
  { key: 'financeiro', name: 'Financeiro', icon: '💰' },
  { key: 'administrativo', name: 'Administrativo', icon: '📋' },
  { key: 'audiovisual', name: 'Audiovisual', icon: '🎬' },
  { key: 'design', name: 'Design', icon: '🎨' },
  { key: 'configuracoes', name: 'Configurações', icon: '⚙️' },
  { key: 'especialistas', name: 'Especialistas', icon: '👨‍💼' },
  { key: 'relatorios', name: 'Relatórios', icon: '📈' },
  { key: 'planos', name: 'Planos', icon: '📦' },
];

const ROLES = [
  { key: 'admin', name: 'Administrador', color: 'bg-red-500' },
  { key: 'grs', name: 'GRS', color: 'bg-blue-500' },
  { key: 'atendimento', name: 'Atendimento', color: 'bg-green-500' },
  { key: 'designer', name: 'Designer', color: 'bg-purple-500' },
  { key: 'filmmaker', name: 'Filmmaker', color: 'bg-orange-500' },
  { key: 'gestor', name: 'Gestor', color: 'bg-indigo-500' },
  { key: 'financeiro', name: 'Financeiro', color: 'bg-yellow-500' },
  { key: 'cliente', name: 'Cliente', color: 'bg-gray-500' },
];

export default function Funcoes() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar permissões.',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (id: string, field: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      setPermissions(prev =>
        prev.map(perm =>
          perm.id === id ? { ...perm, [field]: value } : perm
        )
      );

      toast({
        title: 'Sucesso',
        description: 'Permissão atualizada com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar permissão.',
      });
    }
  };

  const getRolePermissions = (role: string) => {
    return permissions.filter(p => p.role === role);
  };

  const getPermissionForModule = (role: string, module: string) => {
    return permissions.find(p => p.role === role && p.module === module);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Funções</h1>
            <p className="text-muted-foreground">
              Configure permissões de acesso por função
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {ROLES.map(role => (
          <Card key={role.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`${role.color} text-white`}>
                    {role.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getRolePermissions(role.key).length} módulos configurados
                  </span>
                </div>
                <Dialog open={isOpen && selectedRole === role.key} onOpenChange={(open) => {
                  setIsOpen(open);
                  if (open) setSelectedRole(role.key);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Permissões
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        Permissões - {role.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Módulo</TableHead>
                            <TableHead className="text-center">Visualizar</TableHead>
                            <TableHead className="text-center">Criar</TableHead>
                            <TableHead className="text-center">Editar</TableHead>
                            <TableHead className="text-center">Excluir</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {MODULES.map(module => {
                            const perm = getPermissionForModule(role.key, module.key);
                            if (!perm) return null;
                            
                            return (
                              <TableRow key={module.key}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span>{module.icon}</span>
                                    <span className="font-medium">{module.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={perm.can_view}
                                    onCheckedChange={(checked) =>
                                      updatePermission(perm.id, 'can_view', checked)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={perm.can_create}
                                    onCheckedChange={(checked) =>
                                      updatePermission(perm.id, 'can_create', checked)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={perm.can_edit}
                                    onCheckedChange={(checked) =>
                                      updatePermission(perm.id, 'can_edit', checked)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={perm.can_delete}
                                    onCheckedChange={(checked) =>
                                      updatePermission(perm.id, 'can_delete', checked)
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MODULES.map(module => {
                  const perm = getPermissionForModule(role.key, module.key);
                  const hasAccess = perm?.can_view;
                  
                  return (
                    <div
                      key={module.key}
                      className={`p-2 rounded text-sm text-center ${
                        hasAccess 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      <span className="mr-1">{module.icon}</span>
                      {module.name}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}