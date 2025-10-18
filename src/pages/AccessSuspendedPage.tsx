import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, LogOut, Mail } from 'lucide-react';

export default function AccessSuspendedPage() {
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
        .from('pessoas')
        .select('observacoes, nome, email')
        .eq('profile_id', user.id)
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
      <Card className="w-full max-w-md border-warning">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-warning/10">
              <AlertCircle className="h-12 w-12 text-warning" />
            </div>
          </div>
          <CardTitle className="text-2xl text-warning">Conta Suspensa</CardTitle>
          <CardDescription>
            Seu acesso foi temporariamente suspenso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.observacoes && (
            <Alert variant="default" className="border-warning">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription>
                <strong>Motivo:</strong> {profile.observacoes}
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
              Para mais informações ou solicitar reativação, entre em contato através do email:{' '}
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
