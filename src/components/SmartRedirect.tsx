import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

export function SmartRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  useEffect(() => {
    console.log('🔄 SmartRedirect: Auth loading:', authLoading, 'User:', !!user, 'Path:', location.pathname);

    // Emergency timeout
    const emergencyTimeout = setTimeout(() => {
      console.log('🚨 SmartRedirect: Emergency timeout - forcing navigation');
      if (!user) {
        navigate('/auth', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }, 3000);

    // Wait for auth and role to load
    if (authLoading || roleLoading) {
      console.log('🔄 SmartRedirect: Still loading...');
      return () => clearTimeout(emergencyTimeout);
    }

    clearTimeout(emergencyTimeout);

    // Simple logic: if not authenticated, go to auth page
    if (!user) {
      console.log('🔄 SmartRedirect: No user, redirecting to auth');
      navigate('/auth', { replace: true });
      return;
    }

    // Check if this is the first access (email confirmation redirect)
    const checkFirstAccess = async () => {
      if (location.pathname === '/perfil' && user) {
        // User came from email confirmation
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, telefone')
          .eq('id', user.id)
          .single();

        // If profile is incomplete, this is first access
        if (!profile?.avatar_url && !profile?.telefone) {
          setIsFirstAccess(true);
          return;
        }
      }

      // Normal redirect logic based on role
      if (location.pathname === '/' || location.pathname === '/index') {
        if (role === 'cliente') {
          navigate('/cliente/painel', { replace: true });
        } else if (role && ['grs', 'designer', 'filmmaker'].includes(role)) {
          // Check if first login for collaborators
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url, telefone')
            .eq('id', user.id)
            .single();

          if (!profile?.avatar_url && !profile?.telefone) {
            navigate('/perfil', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    };

    checkFirstAccess();

    return () => clearTimeout(emergencyTimeout);
  }, [user, authLoading, roleLoading, role, navigate, location.pathname]);

  return null;
}