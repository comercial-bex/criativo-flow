import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';

export function SmartRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { getDefaultRoute, loading: roleLoading } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🔄 SmartRedirect: Auth loading:', authLoading, 'Role loading:', roleLoading, 'User:', !!user, 'Path:', location.pathname);

    // Emergency timeout to prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      console.log('🚨 SmartRedirect: Emergency timeout - forcing navigation to /dashboard');
      navigate('/dashboard', { replace: true });
    }, 8000);

    // Wait for auth and role to load
    if (authLoading || roleLoading) {
      console.log('🔄 SmartRedirect: Still loading, waiting...');
      return () => clearTimeout(emergencyTimeout);
    }

    clearTimeout(emergencyTimeout);

    // If not authenticated, redirect to auth
    if (!user) {
      console.log('🔄 SmartRedirect: No user, redirecting to auth');
      navigate('/auth');
      return;
    }

    // If on root path, redirect to default route for user role
    if (location.pathname === '/' || location.pathname === '/index') {
      console.log('🔄 SmartRedirect: On root path, getting default route');
      const defaultRoute = getDefaultRoute();
      console.log('🔄 SmartRedirect: Default route:', defaultRoute);
      navigate(defaultRoute, { replace: true });
    }

    return () => clearTimeout(emergencyTimeout);
  }, [user, authLoading, roleLoading, getDefaultRoute, navigate, location.pathname]);

  return null;
}