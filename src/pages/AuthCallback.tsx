import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const clienteId = localStorage.getItem('oauth_client_id');
        const provider = localStorage.getItem('oauth_provider');

        if (!clienteId || !provider) {
          throw new Error('Contexto OAuth não encontrado');
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          throw new Error('Sessão não encontrada');
        }

        const providerToken = session.provider_token;
        const providerRefreshToken = session.provider_refresh_token;

        sessionStorage.setItem('social_access_token', providerToken || '');
        sessionStorage.setItem('social_provider', provider);

        localStorage.removeItem('oauth_client_id');
        localStorage.removeItem('oauth_provider');

        toast.success('Autenticação realizada! Selecionando contas...');
        navigate(`/grs/cliente/${clienteId}/projetos?oauth_success=true&provider=${provider}`);
        
      } catch (error: any) {
        console.error('Erro no callback OAuth:', error);
        toast.error('Erro na autenticação social');
        navigate('/');
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
