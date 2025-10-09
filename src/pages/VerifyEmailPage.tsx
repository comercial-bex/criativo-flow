import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de verificação não encontrado na URL');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-email', {
          body: { token }
        });

        if (error) {
          setStatus('error');
          setMessage(error.message || 'Erro ao verificar email');
          return;
        }

        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verificado com sucesso!');
          
          // Redirecionar após 2 segundos
          setTimeout(() => {
            navigate(data.redirect || '/aguardando-aprovacao', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Erro desconhecido ao verificar email');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        setMessage('Erro ao processar verificação de email');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            )}
            {status === 'success' && (
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
            )}
            {status === 'error' && (
              <div className="p-3 rounded-full bg-destructive/10">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Verificando email...'}
            {status === 'success' && 'Email Verificado!'}
            {status === 'error' && 'Erro na Verificação'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={status === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          {status === 'success' && (
            <p className="text-sm text-muted-foreground text-center">
              Redirecionando em alguns segundos...
            </p>
          )}

          {status === 'error' && (
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              className="w-full"
            >
              Voltar para Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
