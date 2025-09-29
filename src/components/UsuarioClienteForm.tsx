import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, Lock, User, Settings } from "lucide-react";

interface UsuarioClienteFormProps {
  clienteId: string;
  onSuccess?: () => void;
}

interface Permissoes {
  projetos: {
    ver: boolean;
    criar: boolean;
    editar: boolean;
  };
  marketing: {
    ver: boolean;
    aprovar: boolean;
  };
  financeiro: {
    ver: boolean;
    editar: boolean;
  };
  relatorios: {
    ver: boolean;
  };
}

export function UsuarioClienteForm({ clienteId, onSuccess }: UsuarioClienteFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    roleCliente: 'visualizador'
  });

  const [permissoes, setPermissoes] = useState<Permissoes>({
    projetos: { ver: true, criar: false, editar: false },
    marketing: { ver: true, aprovar: false },
    financeiro: { ver: false, editar: false },
    relatorios: { ver: true }
  });

  const roles = [
    { value: 'proprietario', label: 'Proprietário', description: 'Acesso total, pode gerenciar outros usuários' },
    { value: 'gestor', label: 'Gestor', description: 'Pode aprovar e gerenciar projetos' },
    { value: 'aprovador', label: 'Aprovador', description: 'Pode aprovar tarefas de marketing' },
    { value: 'visualizador', label: 'Visualizador', description: 'Apenas visualização de projetos' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Chamar edge function para criar usuário cliente
      const { data, error } = await supabase.functions.invoke('manage-client-users', {
        body: {
          email: formData.email,
          password: formData.password,
          nome: formData.nome,
          cliente_id: clienteId,
          role: 'cliente',
          permissoes: permissoes
        }
      });

      if (error) throw error;

      const response = data;
      
      if (!response.success) {
        throw new Error(response.message || 'Erro ao criar usuário');
      }

      // Criar log de atividade
      await supabase.rpc('criar_log_atividade', {
        p_cliente_id: clienteId,
        p_usuario_id: response.user_id,
        p_acao: 'criou',
        p_entidade_tipo: 'usuario',
        p_entidade_id: response.user_id,
        p_descricao: `Usuário interno ${formData.nome} foi criado com role ${formData.roleCliente}`,
        p_metadata: { role: formData.roleCliente, permissoes: JSON.stringify(permissoes) }
      });

      toast({
        title: "Sucesso",
        description: `Usuário ${formData.nome} criado com sucesso!`,
      });

      // Reset form
      setFormData({ nome: '', email: '', password: '', roleCliente: 'visualizador' });
      setPermissoes({
        projetos: { ver: true, criar: false, editar: false },
        marketing: { ver: true, aprovar: false },
        financeiro: { ver: false, editar: false },
        relatorios: { ver: true }
      });

      onSuccess?.();

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePermissao = (modulo: keyof Permissoes, acao: string, value: boolean) => {
    setPermissoes(prev => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [acao]: value
      }
    }));
  };

  const getRolePermissoes = (role: string) => {
    switch (role) {
      case 'proprietario':
        return {
          projetos: { ver: true, criar: true, editar: true },
          marketing: { ver: true, aprovar: true },
          financeiro: { ver: true, editar: true },
          relatorios: { ver: true }
        };
      case 'gestor':
        return {
          projetos: { ver: true, criar: true, editar: true },
          marketing: { ver: true, aprovar: true },
          financeiro: { ver: true, editar: false },
          relatorios: { ver: true }
        };
      case 'aprovador':
        return {
          projetos: { ver: true, criar: false, editar: false },
          marketing: { ver: true, aprovar: true },
          financeiro: { ver: false, editar: false },
          relatorios: { ver: true }
        };
      case 'visualizador':
        return {
          projetos: { ver: true, criar: false, editar: false },
          marketing: { ver: true, aprovar: false },
          financeiro: { ver: false, editar: false },
          relatorios: { ver: true }
        };
      default:
        return permissoes;
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ ...prev, roleCliente: role }));
    setPermissoes(getRolePermissoes(role));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Criar Usuário Interno
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do usuário"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha Temporária *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Senha para primeiro acesso"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Função no Sistema *
            </Label>
            <Select value={formData.roleCliente} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permissões Detalhadas */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Permissões Específicas</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Projetos */}
              <Card className="p-3">
                <h4 className="font-medium mb-2">Projetos</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="projetos-ver"
                      checked={permissoes.projetos.ver}
                      onCheckedChange={(checked) => updatePermissao('projetos', 'ver', !!checked)}
                    />
                    <Label htmlFor="projetos-ver" className="text-sm">Ver projetos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="projetos-criar"
                      checked={permissoes.projetos.criar}
                      onCheckedChange={(checked) => updatePermissao('projetos', 'criar', !!checked)}
                    />
                    <Label htmlFor="projetos-criar" className="text-sm">Criar projetos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="projetos-editar"
                      checked={permissoes.projetos.editar}
                      onCheckedChange={(checked) => updatePermissao('projetos', 'editar', !!checked)}
                    />
                    <Label htmlFor="projetos-editar" className="text-sm">Editar projetos</Label>
                  </div>
                </div>
              </Card>

              {/* Marketing */}
              <Card className="p-3">
                <h4 className="font-medium mb-2">Marketing</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing-ver"
                      checked={permissoes.marketing.ver}
                      onCheckedChange={(checked) => updatePermissao('marketing', 'ver', !!checked)}
                    />
                    <Label htmlFor="marketing-ver" className="text-sm">Ver materiais</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing-aprovar"
                      checked={permissoes.marketing.aprovar}
                      onCheckedChange={(checked) => updatePermissao('marketing', 'aprovar', !!checked)}
                    />
                    <Label htmlFor="marketing-aprovar" className="text-sm">Aprovar materiais</Label>
                  </div>
                </div>
              </Card>

              {/* Financeiro */}
              <Card className="p-3">
                <h4 className="font-medium mb-2">Financeiro</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="financeiro-ver"
                      checked={permissoes.financeiro.ver}
                      onCheckedChange={(checked) => updatePermissao('financeiro', 'ver', !!checked)}
                    />
                    <Label htmlFor="financeiro-ver" className="text-sm">Ver relatórios</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="financeiro-editar"
                      checked={permissoes.financeiro.editar}
                      onCheckedChange={(checked) => updatePermissao('financeiro', 'editar', !!checked)}
                    />
                    <Label htmlFor="financeiro-editar" className="text-sm">Editar dados</Label>
                  </div>
                </div>
              </Card>

              {/* Relatórios */}
              <Card className="p-3">
                <h4 className="font-medium mb-2">Relatórios</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="relatorios-ver"
                      checked={permissoes.relatorios.ver}
                      onCheckedChange={(checked) => updatePermissao('relatorios', 'ver', !!checked)}
                    />
                    <Label htmlFor="relatorios-ver" className="text-sm">Ver relatórios</Label>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Criando usuário...' : 'Criar Usuário'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}