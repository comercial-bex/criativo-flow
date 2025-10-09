import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, LogOut, Mail } from 'lucide-react';

export default function AccessRejectedPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('observacoes_aprovacao, nome, email')
        .eq('id', user.id)
        .single();

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl text-destructive">Acesso Não Autorizado</CardTitle>
          <CardDescription>
            Sua solicitação de acesso foi recusada pela gestão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.observacoes_aprovacao && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Motivo:</strong> {profile.observacoes_aprovacao}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Nome:</strong> {profile?.nome || 'Não disponível'}
            </p>
            <p>
              <strong>Email:</strong> {profile?.email || user?.email}
            </p>
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Se você acredita que houve um erro, entre em contato com nossa equipe através do email:{' '}
              <a href="mailto:suporte@suaempresa.com" className="font-medium underline">
                suporte@suaempresa.com
              </a>
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Fazer Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
