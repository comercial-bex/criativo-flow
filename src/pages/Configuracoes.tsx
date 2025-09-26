import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '@/components/SectionHeader';
import { FeatureCard } from '@/components/FeatureCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Globe,
  Save,
  AlertTriangle,
  Users,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

const Configuracoes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { 
    getDefaultRoute, 
    loading: permissionsLoading, 
    hasModuleAccess, 
    canPerformAction,
    dynamicPermissions 
  } = usePermissions();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso."
    });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const isJefferson = user?.email === 'jefferson@agenciabex.com.br';

  return (
    <div className="p-6 space-y-8">
      <SectionHeader
        title="Configurações"
        description="Gerencie as configurações do sistema e preferências"
        icon={Settings}
        action={{
          label: "Salvar Alterações",
          onClick: handleSave,
          icon: Save
        }}
      />

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="funcoes">Funções</TabsTrigger>
          <TabsTrigger value="servidor">Status do Servidor</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>
                  Configurações básicas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Nome da Empresa</Label>
                  <Input id="empresa" placeholder="Sua Agência LTDA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Input id="timezone" value="America/Sao_Paulo" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moeda">Moeda</Label>
                  <Input id="moeda" value="BRL - Real Brasileiro" disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Backup & Dados
                </CardTitle>
                <CardDescription>
                  Configurações de backup e exportação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Backup diário dos dados
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    Exportar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" placeholder="CEO, Gestor, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Breve descrição sobre você" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Segurança da Conta
                </CardTitle>
                <CardDescription>
                  Configurações de segurança e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação em Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    Alterar Senha
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Chaves de API
                </CardTitle>
                <CardDescription>
                  Gerencie suas chaves de API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Principal</span>
                    <Badge variant="secondary">Ativa</Badge>
                  </div>
                  <Input value="sk-..." type="password" disabled />
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Gerar Nova Chave
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber updates por email
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações no navegador
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber alertas importantes por SMS
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.sms}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Personalização da Interface
              </CardTitle>
              <CardDescription>
                Customize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Tema</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="flex flex-col items-center space-y-2 cursor-pointer">
                      <div className="w-16 h-12 bg-white border-2 border-primary rounded"></div>
                      <span className="text-sm">Claro</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 cursor-pointer">
                      <div className="w-16 h-12 bg-gray-900 border-2 border-gray-300 rounded"></div>
                      <span className="text-sm">Escuro</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 cursor-pointer">
                      <div className="w-16 h-12 bg-gradient-to-r from-white to-gray-900 border-2 border-gray-300 rounded"></div>
                      <span className="text-sm">Auto</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-base font-medium">Cor Primária</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500'].map((color, index) => (
                      <div key={index} className={`w-8 h-8 ${color} rounded cursor-pointer`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Gerenciar Funções e Permissões
              </CardTitle>
              <CardDescription>
                Configure as permissões de acesso para cada função do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Clique no botão abaixo para acessar o painel de configuração de funções
                </p>
                <Button 
                  onClick={() => navigate('/configuracoes/funcoes')}
                  className="w-full"
                >
                  Abrir Configurações de Funções
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servidor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  Status do Sistema
                </CardTitle>
                <CardDescription>
                  Informações sobre o estado atual do servidor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status da Conexão:</span>
                    <Badge variant={user ? "default" : "destructive"}>
                      {user ? "Conectado" : "Desconectado"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sessão Ativa:</span>
                    <Badge variant={session ? "default" : "secondary"}>
                      {session ? "Sim" : "Não"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo de Atividade:</span>
                    <Badge variant="outline">{new Date().toLocaleTimeString()}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações do Usuário
                </CardTitle>
                <CardDescription>
                  Dados de autenticação e permissões
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email:</span>
                    <span className="text-xs text-muted-foreground">{user?.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Role:</span>
                    <Badge variant={role === 'admin' ? "default" : "secondary"}>
                      {role || "Carregando..."}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rota Padrão:</span>
                    <Badge variant="outline">{getDefaultRoute()}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Estados de Carregamento
                </CardTitle>
                <CardDescription>
                  Status dos hooks e permissões do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auth Loading:</span>
                      <Badge variant={authLoading ? "destructive" : "secondary"}>
                        {authLoading ? "Carregando" : "OK"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Role Loading:</span>
                      <Badge variant={roleLoading ? "destructive" : "secondary"}>
                        {roleLoading ? "Carregando" : "OK"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Permissions Loading:</span>
                      <Badge variant={permissionsLoading ? "destructive" : "secondary"}>
                        {permissionsLoading ? "Carregando" : "OK"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Acesso aos Módulos
                </CardTitle>
                <CardDescription>
                  Status de acesso para cada módulo do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.keys(dynamicPermissions).map(module => (
                    <div key={module} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-xs font-medium">{module}</span>
                      <Badge 
                        variant={hasModuleAccess(module as any) ? "default" : "destructive"} 
                        className="text-xs"
                      >
                        {hasModuleAccess(module as any) ? "✅" : "❌"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Jefferson Status */}
            {isJefferson && (
              <Card className="lg:col-span-2 border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Status Especial - Jefferson
                  </CardTitle>
                  <CardDescription>
                    Informações específicas para resolução de problemas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Admin Access:</span>
                      <Badge variant={role === 'admin' ? "default" : "destructive"}>
                        {role === 'admin' ? "✅ YES" : "❌ NO"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dashboard Access:</span>
                      <Badge variant={hasModuleAccess('dashboard') ? "default" : "destructive"}>
                        {hasModuleAccess('dashboard') ? "✅ YES" : "❌ NO"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Issue:</span>
                      <Badge variant="destructive">
                        {window.location.pathname === '/unauthorized' ? 'Blocked' : 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-4 border-t space-y-2">
                    <Button 
                      onClick={handleRefresh} 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar Página
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/dashboard'} 
                      variant="default" 
                      size="sm" 
                      className="w-full"
                    >
                      🎯 Forçar Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;