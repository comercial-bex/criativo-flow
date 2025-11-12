import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from '@/lib/toast-compat';

interface PermissionWrapperProps {
  children: ReactNode;
  module: keyof import('@/hooks/usePermissions').ModulePermissions;
  action?: 'canView' | 'canCreate' | 'canEdit' | 'canDelete';
  fallback?: ReactNode;
  showErrorToast?: boolean;
}

export function PermissionWrapper({ 
  children, 
  module, 
  action = 'canView', 
  fallback = null,
  showErrorToast = false
}: PermissionWrapperProps) {
  const { canPerformAction, loading, role } = usePermissions();

  if (loading) {
    return <>{fallback}</>;
  }

  const hasPermission = canPerformAction(module, action);

  if (!hasPermission) {
    if (showErrorToast) {
      toast.error(`Sem permissão para ${action === 'canView' ? 'visualizar' : action === 'canCreate' ? 'criar' : action === 'canEdit' ? 'editar' : 'excluir'} ${module}`);
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}