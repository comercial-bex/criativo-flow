import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from './ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  module?: keyof import('@/hooks/usePermissions').ModulePermissions;
  action?: keyof import('@/hooks/usePermissions').PermissionActions;
  requiredRole?: import('@/hooks/useUserRole').UserRole;
}

export function ProtectedRoute({ 
  children, 
  module, 
  action = 'canView', 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: permissionsLoading, canPerformAction, hasModuleAccess } = usePermissions();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute: Checking access', {
    path: location.pathname,
    user: !!user,
    authLoading,
    role,
    permissionsLoading,
    module,
    action,
    requiredRole
  });

  // Show loading state while auth or permissions are loading
  if (authLoading || permissionsLoading) {
    console.log('🛡️ ProtectedRoute: Still loading...', { authLoading, permissionsLoading });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <div className="text-xs text-muted-foreground">
            Loading {authLoading ? 'authentication' : 'permissions'}...
          </div>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    console.log('🛡️ ProtectedRoute: No user, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Admin bypass for all checks
  if (role === 'admin') {
    console.log('🛡️ ProtectedRoute: Admin access granted');
    return <>{children}</>;
  }

  // Check specific role requirement
  if (requiredRole && role !== requiredRole) {
    console.log('🛡️ ProtectedRoute: Role check failed', { required: requiredRole, actual: role });
    return <Navigate to="/unauthorized" replace />;
  }

  // Check module access only if module is specified
  if (module) {
    const hasAccess = hasModuleAccess(module);
    console.log('🛡️ ProtectedRoute: Module access check', { module, hasAccess });
    
    if (!hasAccess) {
      console.log('🛡️ ProtectedRoute: Module access denied');
      return <Navigate to="/unauthorized" replace />;
    }

    // Check specific action permission
    const canPerform = canPerformAction(module, action);
    console.log('🛡️ ProtectedRoute: Action permission check', { module, action, canPerform });
    
    if (!canPerform) {
      console.log('🛡️ ProtectedRoute: Action permission denied');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('🛡️ ProtectedRoute: Access granted');
  return <>{children}</>;
}