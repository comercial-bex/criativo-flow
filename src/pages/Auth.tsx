import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PasswordResetModal } from '@/components/PasswordResetModal';
import { LoginDiagnostic } from '@/components/Auth/LoginDiagnostic';
import LoginPage from '@/components/ui/gaming-login';
import { Bug } from 'lucide-react';
import { toast } from 'sonner';
const backgroundVideo = '/bex_fundo.mp4';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const mountedRef = useRef(true);
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && mountedRef.current) {
      navigate('/dashboard', { replace: true });
    }
    return () => {
      mountedRef.current = false;
      setShowPasswordReset(false);
    };
  }, [user, navigate]);

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

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (!mountedRef.current) return;
      
      if (error) {
        toast.error(getErrorMessage(error));
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      }
    } catch (error) {
      if (mountedRef.current) {
        toast.error('Erro inesperado no login');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };



  const handleClearCache = async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      toast.success('Cache limpo! Recarregando...');
      setTimeout(() => {
        window.location.href = window.location.origin + '?v=' + Date.now();
      }, 500);
    } catch (error) {
      toast.error('Erro ao limpar cache');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <LoginPage.VideoBackground videoUrl={backgroundVideo} />
      
      {/* Botão Force Update */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-white/80 hover:text-white gap-2 bg-black/40 backdrop-blur-sm border border-bex/30 hover:border-bex/50"
          onClick={handleClearCache}
        >
          🔄 Limpar Cache
        </Button>
      </div>

      <div className="relative z-20 w-full max-w-md">
        <LoginPage.LoginForm 
          onSubmit={handleLogin}
          onForgotPassword={() => setShowPasswordReset(true)}
          loading={loading}
        />
      </div>

      <div className="absolute bottom-4 right-4 z-20">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-white/60 hover:text-white gap-2 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowDiagnostic(!showDiagnostic)}
        >
          <Bug className="h-3 w-3" />
          {showDiagnostic ? 'Ocultar' : 'Debug'}
        </Button>
      </div>

      <PasswordResetModal 
        open={showPasswordReset} 
        onOpenChange={setShowPasswordReset} 
      />

      {showDiagnostic && (
        <div className="absolute top-4 right-4 z-30 max-w-sm">
          <LoginDiagnostic />
        </div>
      )}
    </div>
  );
}