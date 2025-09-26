import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';

export function SmartRedirect() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🔄 SmartRedirect: Auth loading:', authLoading, 'User:', !!user, 'Path:', location.pathname);

    // Emergency timeout - much shorter
    const emergencyTimeout = setTimeout(() => {
      console.log('🚨 SmartRedirect: Emergency timeout - forcing navigation');
      if (!user) {
        navigate('/auth', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }, 3000);

    // Wait for auth to load
    if (authLoading) {
      console.log('🔄 SmartRedirect: Auth still loading, waiting...');
      return () => clearTimeout(emergencyTimeout);
    }

    clearTimeout(emergencyTimeout);

    // Simple logic: if not authenticated, go to auth page
    if (!user) {
      console.log('🔄 SmartRedirect: No user, redirecting to auth');
      navigate('/auth', { replace: true });
      return;
    }

    // If authenticated and on root path, go to dashboard
    if (location.pathname === '/' || location.pathname === '/index') {
      console.log('🔄 SmartRedirect: On root path, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }

    return () => clearTimeout(emergencyTimeout);
  }, [user, authLoading, navigate, location.pathname]);

  return null;
}