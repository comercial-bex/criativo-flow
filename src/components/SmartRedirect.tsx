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
    // Wait for auth and role to load
    if (authLoading || roleLoading) return;

    // If not authenticated, redirect to auth
    if (!user) {
      navigate('/auth');
      return;
    }

    // If on root path, redirect to default route for user role
    if (location.pathname === '/' || location.pathname === '/index') {
      const defaultRoute = getDefaultRoute();
      navigate(defaultRoute, { replace: true });
    }
  }, [user, authLoading, roleLoading, getDefaultRoute, navigate, location.pathname]);

  return null;
}