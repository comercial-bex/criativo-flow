import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { TestTube } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Contas de teste
  const testAccounts = [
    { role: 'admin', email: 'admin@teste.com', password: '123456', name: 'Administrador', color: 'bg-red-500' },
    { role: 'grs', email: 'grs@teste.com', password: '123456', name: 'GRS', color: 'bg-blue-500' },
    { role: 'designer', email: 'designer@teste.com', password: '123456', name: 'Designer', color: 'bg-purple-500' },
    { role: 'filmmaker', email: 'audiovisual@teste.com', password: '123456', name: 'Filmmaker', color: 'bg-orange-500' },
    { role: 'atendimento', email: 'atendimento@teste.com', password: '123456', name: 'Atendimento', color: 'bg-green-500' },
    { role: 'financeiro', email: 'financeiro@teste.com', password: '123456', name: 'Financeiro', color: 'bg-yellow-500' },
    { role: 'gestor', email: 'gestor@teste.com', password: '123456', name: 'Gestor', color: 'bg-indigo-500' },
    { role: 'cliente', email: 'cliente@teste.com', password: '123456', name: 'Cliente', color: 'bg-gray-500' },
  ];

  const handleTestLogin = async (account: typeof testAccounts[0]) => {
    setLoading(true);
    try {
      const { error } = await signIn(account.email, account.password);
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no login de teste",
          description: error.message,
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: `Entrando como ${account.name}`,
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao ERP da Agência de Marketing",
      });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password, nome);
    
    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao ERP da Agência de Marketing",
      });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ERP Agência Marketing</CardTitle>
          <CardDescription>
            Faça login ou crie sua conta para acessar o sistema
          </CardDescription>
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Senha</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Separator className="my-4" />
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TestTube className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Contas de Teste</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Clique para fazer login direto em cada função
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {testAccounts.map((account) => (
                <Button
                  key={account.role}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-center gap-1"
                  onClick={() => handleTestLogin(account)}
                  disabled={loading}
                >
                  <Badge className={`${account.color} text-white text-xs`}>
                    {account.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {account.email}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;