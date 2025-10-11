import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordResetModal } from '@/components/PasswordResetModal';
import { PasswordInput } from '@/components/ui/password-input';
import { Info, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import bexLogo from '@/assets/logo_bex_verde.png';

import { toast } from 'sonner';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  // Add ref to track if component is mounted
  const mountedRef = useRef(true);
  
  const { signIn, user } = useAuth();
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Validação de email em tempo real
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Formato de email inválido');
    } else {
      setEmailError('');
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const getErrorMessage = (error: any): string => {
    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
      return 'Email ou senha incorretos';
    }
    if (message.includes('email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada';
    }
    if (message.includes('user not found')) {
      return 'Usuário não encontrado';
    }
    if (message.includes('too many requests')) {
      return 'Muitas tentativas. Aguarde alguns minutos';
    }
    
    return error?.message || 'Erro ao fazer login';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mountedRef.current) return;
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (emailError) {
      toast.error('Por favor, corrija o email antes de continuar');
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
        toast.error(getErrorMessage(error));
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
              <CardDescription className="space-y-2">
                <p>Acesse o sistema de gestão da agência</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <Info className="h-3 w-3" />
                  <span>Use suas credenciais fornecidas pela equipe BEX</span>
                </div>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="seu@email.com"
                  disabled={loading}
                  required
                  className={emailError ? 'border-destructive' : ''}
                />
                {emailError && (
                  <p className="text-xs text-destructive">{emailError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyUp}
                  placeholder="Sua senha"
                  disabled={loading}
                  required
                  showRequirements={false}
                />
                {capsLockOn && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      Caps Lock está ativado
                    </AlertDescription>
                  </Alert>
                )}
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