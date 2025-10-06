import { useUserRole, UserRole } from './useUserRole';
import { usePermissions } from './usePermissions';

export interface OperationalPermissions {
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canCreateSchedule: boolean;
  canEditSchedule: boolean;
  canApproveSchedule: boolean;
  canViewAllTasks: boolean;
  canAssignSpecialists: boolean;
  showCreateButton: boolean;
}

export function useOperationalPermissions(): {
  permissions: OperationalPermissions;
  loading: boolean;
  role: UserRole;
} {
  const { role, loading: roleLoading } = useUserRole();
  const { loading: permLoading } = usePermissions();

  const loading = roleLoading || permLoading;

  // Definição clara de permissões por papel
  const permissions: OperationalPermissions = {
    // Administrador: acesso total
    canCreateTask: role === 'admin' || role === 'grs' || role === 'gestor',
    canEditTask: role === 'admin' || role === 'grs' || role === 'gestor',
    canDeleteTask: role === 'admin' || role === 'gestor',
    canCreateSchedule: role === 'admin' || role === 'grs' || role === 'gestor',
    canEditSchedule: role === 'admin' || role === 'grs' || role === 'gestor',
    canApproveSchedule: role === 'admin' || role === 'gestor',
    canViewAllTasks: role === 'admin' || role === 'gestor' || role === 'grs',
    canAssignSpecialists: role === 'admin' || role === 'grs' || role === 'gestor',
    
    // Botão de criação visível apenas para Admin e GRS
    showCreateButton: role === 'admin' || role === 'grs' || role === 'gestor',
  };

  return { permissions, loading, role };
}