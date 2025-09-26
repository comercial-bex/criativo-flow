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

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
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