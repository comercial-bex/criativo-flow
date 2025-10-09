import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface SpecialistGuardProps {
  children: ReactNode;
}

export function SpecialistGuard({ children }: SpecialistGuardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      try {
        const { data, error } = await supabase.rpc('validate_specialist_access', {
          p_user_id: user.id
        });

        if (error) {
          console.error('Error validating access:', error);
          navigate('/auth', { replace: true });
          return;
        }

        const accessData = data as { can_access: boolean; redirect_to: string | null; reason: string };

        if (!accessData.can_access && accessData.redirect_to) {
          navigate(accessData.redirect_to, { replace: true });
          return;
        }

        setCanAccess(accessData.can_access);
      } catch (error) {
        console.error('Guard error:', error);
        navigate('/auth', { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [user, navigate]);

  if (isChecking || canAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return null;
  }

  return <>{children}</>;
}
