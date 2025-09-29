import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PasswordResetModal } from '@/components/PasswordResetModal';

import bexLogo from '@/assets/logo_bex_verde.png';

import { toast } from 'sonner';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [userType, setUserType] = useState('cliente');
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  // Add ref to track if component is mounted
  const mountedRef = useRef(true);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && mountedRef.current) {
      navigate('/dashboard', { replace: true });
    }
    
  // Cleanup function
    return () => {
      mountedRef.current = false;
      setShowPasswordReset(false);
    };
  }, [user, navigate]);

  // Reset form when switching tabs
  const handleTabChange = (value: string) => {
    setEmail('');
    setPassword('');
    setNome('');
    setEmpresa('');
    setIsPasswordValid(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mountedRef.current) return;
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 UI: Tentando login para:', email);
      const { error } = await signIn(email, password);
      
      // Check if component is still mounted before updating state
      if (!mountedRef.current) return;
      
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
      if (mountedRef.current) {
        toast.error('Erro inesperado no login');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mountedRef.current) return;
    
    // Validação básica
    if (!email || !password || !nome) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    // Validação de senha forte
    if (!isPasswordValid) {
      toast.error('Por favor, crie uma senha que atenda todos os requisitos de segurança');
      return;
    }

    // Validação específica para clientes
    if (userType === 'cliente' && !empresa) {
      toast.error('Por favor, informe o nome da empresa');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, nome, userType === 'cliente' ? empresa : undefined);
      
      // Check if component is still mounted before updating state
      if (!mountedRef.current) return;
      
      if (error) {
        toast.error('Erro no cadastro: ' + error.message);
      } else {
        toast.success('Cadastro realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      if (mountedRef.current) {
        toast.error('Erro inesperado no cadastro');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
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

            <Tabs defaultValue="login" className="w-full" onValueChange={handleTabChange}>
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
                  
                  {userType === 'cliente' && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-empresa">Nome da Empresa</Label>
                      <Input
                        id="signup-empresa"
                        type="text"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        placeholder="Nome da sua empresa"
                        disabled={loading}
                        required
                      />
                    </div>
                  )}
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
                    <PasswordInput
                      id="signup-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crie uma senha segura"
                      disabled={loading}
                      showRequirements={true}
                      onValidityChange={setIsPasswordValid}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || !isPasswordValid}>
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>



        {/* Modal de Recuperação de Senha */}
        <PasswordResetModal 
          open={showPasswordReset} 
          onOpenChange={setShowPasswordReset} 
        />
      </div>
    </div>
  );
}