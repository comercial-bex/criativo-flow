import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PasswordResetModal } from '@/components/PasswordResetModal';
import { TestClientUserCreation } from '@/components/TestClientUserCreation';
import bexLogo from '@/assets/logo_bex_verde.png';

import { toast } from 'sonner';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [userType, setUserType] = useState('cliente');
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 UI: Tentando login para:', email);
      const { error } = await signIn(email, password);
      if (error) {
        console.error('🔐 UI: Erro no login:', error);
        toast.error(error.message || 'Erro no login');
      } else {
        console.log('🔐 UI: Login bem-sucedido, redirecionando...');
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('🔐 UI: Erro inesperado:', error);
      toast.error('Erro inesperado no login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nome) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, nome);
      if (error) {
        toast.error('Erro no cadastro: ' + error.message);
      } else {
        toast.success('Cadastro realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Erro inesperado no cadastro');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src={bexLogo} 
                alt="BEX Logo" 
                className="h-16 w-auto"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary">Sistema BEX</CardTitle>
              <CardDescription>
                Acesse o sistema de gestão da agência
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      disabled={loading}
                    />
                  </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                    <div className="text-center">
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setShowPasswordReset(true)}
                      >
                        Esqueci minha senha
                      </Button>
                    </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-3">
                    <Label>Tipo de Cadastro</Label>
                    <RadioGroup 
                      value={userType} 
                      onValueChange={setUserType}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cliente" id="cliente" />
                        <Label htmlFor="cliente" className="text-sm font-normal">
                          <span className="font-medium">Cliente</span> - Empresa que contrata serviços
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="colaborador" id="colaborador" />
                        <Label htmlFor="colaborador" className="text-sm font-normal">
                          <span className="font-medium">Colaborador</span> - Funcionário da agência
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome Completo</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Credenciais de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Usuários de Teste</CardTitle>
            <CardDescription>Use estas credenciais para acessar diferentes áreas do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">Atendimento</p>
                  <p className="text-xs text-muted-foreground">atendimento@teste.com</p>
                  <p className="text-xs text-muted-foreground">Senha: 123456</p>
                </div>
                <div className="p-3 border rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">Tráfego</p>
                  <p className="text-xs text-muted-foreground">trafego@teste.com</p>
                  <p className="text-xs text-muted-foreground">Senha: 123456</p>
                </div>
                <div className="p-3 border rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">Financeiro</p>
                  <p className="text-xs text-muted-foreground">financeiro@teste.com</p>
                  <p className="text-xs text-muted-foreground">Senha: 123456</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <p className="font-medium text-sm text-yellow-800">Agência Bex</p>
                  <p className="text-xs text-yellow-700">comercial@agenciabex.com.br</p>
                  <p className="text-xs text-yellow-700">Senha: TempPass2024!</p>
                </div>
                <div className="p-3 border rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">Fornecedor</p>
                  <p className="text-xs text-muted-foreground">fornecedor@teste.com</p>
                  <p className="text-xs text-muted-foreground">Senha: 123456</p>
                </div>
                <div className="p-3 border rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">Gestor</p>
                  <p className="text-xs text-muted-foreground">gestor@teste.com</p>
                  <p className="text-xs text-muted-foreground">Senha: 123456</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Componente de Teste */}
        <TestClientUserCreation />

        {/* Modal de Recuperação de Senha */}
        <PasswordResetModal 
          open={showPasswordReset} 
          onOpenChange={setShowPasswordReset} 
        />
      </div>
    </div>
  );
}