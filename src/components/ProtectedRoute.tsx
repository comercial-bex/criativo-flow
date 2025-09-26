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
  const { role, loading: roleLoading, canPerformAction, hasModuleAccess } = usePermissions();
  const location = useLocation();

  // Show loading while auth or role is loading - with timeout
  if (authLoading || roleLoading) {
    console.log('🛡️ ProtectedRoute: Loading state - Auth:', authLoading, 'Role:', roleLoading);
    
    return (
      <div className="p-6 space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Carregando... {authLoading ? 'Autenticação' : ''} {roleLoading ? 'Permissões' : ''}
        </div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check specific role requirement
  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check module access
  if (module && !hasModuleAccess(module)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check specific action permission
  if (module && !canPerformAction(module, action)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}