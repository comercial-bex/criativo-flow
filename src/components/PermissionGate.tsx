import { ReactNode } from 'react';
import { usePermissions, PermissionActions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: ReactNode;
  module: keyof import('@/hooks/usePermissions').ModulePermissions;
  action?: keyof PermissionActions;
  fallback?: ReactNode;
}

export function PermissionGate({ 
  children, 
  module, 
  action = 'canView', 
  fallback = null 
}: PermissionGateProps) {
  const { canPerformAction, loading } = usePermissions();

  if (loading) {
    return <>{fallback}</>;
  }

  if (!canPerformAction(module, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}