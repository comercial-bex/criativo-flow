import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { getDashboardForRole } from '@/utils/roleRoutes';

export function SmartRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFirstAccess, setIsFirstAccess] = useState(false);

  useEffect(() => {
    console.log('🔄 SmartRedirect: Auth loading:', authLoading, 'User:', !!user, 'Path:', location.pathname);

    // Emergency timeout - reduced to 1.5s
    const emergencyTimeout = setTimeout(() => {
      console.error('🚨 SmartRedirect: TIMEOUT 1.5s - Forçando navegação');
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (role) {
        // ✅ Usar dashboard correto baseado na role
        navigate(getDashboardForRole(role), { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }, 1500);

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

    // NOVA LÓGICA: Validar acesso via função do banco
    const validateAndRedirect = async () => {
      try {
        console.log('🔄 SmartRedirect: Chamando validate_specialist_access...');
        const { data, error } = await supabase.rpc('validate_specialist_access', {
          p_user_id: user.id
        });

        if (error) {
          console.error('🚨 SmartRedirect: ERRO na RPC:', error);
          const safeDashboard = role ? getDashboardForRole(role) : '/dashboard';
          navigate(safeDashboard, { replace: true });
          return;
        }

        console.log('✅ SmartRedirect: RPC retornou:', data);
        const accessData = data as { can_access: boolean; redirect_to: string | null; reason: string };

        // Se não pode acessar e tem redirecionamento, redirecionar
        if (!accessData.can_access && accessData.redirect_to) {
          console.log('🔄 SmartRedirect: Access denied, redirecting to:', accessData.redirect_to);
          navigate(accessData.redirect_to, { replace: true });
          return;
        }

        // Se pode acessar, aplicar lógica normal de redirecionamento
        if (location.pathname === '/' || location.pathname === '/index') {
          const targetDashboard = getDashboardForRole(role || 'cliente');
          
          // Verificar primeiro acesso (apenas para colaboradores)
          if (role && !['cliente', 'admin'].includes(role)) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('avatar_url, telefone')
              .eq('id', user.id)
              .single();

            if (!profile?.avatar_url && !profile?.telefone) {
              navigate('/perfil', { replace: true });
              return;
            }
          }
          
          navigate(targetDashboard, { replace: true });
        }
      } catch (err) {
        console.error('🚨 SmartRedirect: EXCEÇÃO:', err);
        const safeDashboard = role ? getDashboardForRole(role) : '/dashboard';
        navigate(safeDashboard, { replace: true });
      }
    };

    validateAndRedirect();

    return () => clearTimeout(emergencyTimeout);
  }, [user, authLoading, roleLoading, role, navigate, location.pathname]);

  return null;
}