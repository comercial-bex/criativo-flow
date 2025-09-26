import { useUserRole, UserRole } from './useUserRole';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PermissionActions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ModulePermissions {
  dashboard: PermissionActions;
  clientes: PermissionActions;
  crm: PermissionActions;
  financeiro: PermissionActions;
  administrativo: PermissionActions;
  audiovisual: PermissionActions;
  design: PermissionActions;
  configuracoes: PermissionActions;
  planos: PermissionActions;
  especialistas: PermissionActions;
  relatorios: PermissionActions;
}

interface RolePermission {
  id: string;
  role: string;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
}

const ROLE_PERMISSIONS: Record<NonNullable<UserRole>, Partial<ModulePermissions>> = {
  admin: {
    dashboard: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    clientes: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    crm: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    financeiro: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    administrativo: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    audiovisual: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    design: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    configuracoes: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    planos: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    especialistas: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    relatorios: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  },
  grs: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    clientes: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    crm: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    design: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    relatorios: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  atendimento: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    clientes: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    crm: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  },
  designer: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    design: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    clientes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  filmmaker: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    audiovisual: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    clientes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  gestor: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    clientes: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    crm: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    financeiro: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    administrativo: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    audiovisual: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    design: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    relatorios: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    especialistas: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  },
  financeiro: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    clientes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    financeiro: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    administrativo: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    relatorios: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  cliente: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
};

const DEFAULT_PERMISSIONS: PermissionActions = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
};

export function usePermissions() {
  const { role, loading } = useUserRole();
  const [dynamicPermissions, setDynamicPermissions] = useState<Record<string, PermissionActions>>({});
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  // Carregar permissões dinâmicas do banco
  useEffect(() => {
    if (!role || loading) return;

    const fetchPermissions = async () => {
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role', role);

        if (error) {
          console.warn('Erro ao buscar permissões:', error);
          setPermissionsLoading(false);
          return;
        }

        const permissions: Record<string, PermissionActions> = {};
        data?.forEach((perm: RolePermission) => {
          permissions[perm.module] = {
            canView: perm.can_view,
            canCreate: perm.can_create,
            canEdit: perm.can_edit,
            canDelete: perm.can_delete,
          };
        });

        setDynamicPermissions(permissions);
      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchPermissions();
  }, [role, loading]);

  const getModulePermissions = (module: keyof ModulePermissions): PermissionActions => {
    if (!role || loading || permissionsLoading) return DEFAULT_PERMISSIONS;
    
    // Priorizar permissões dinâmicas do banco
    if (dynamicPermissions[module]) {
      return dynamicPermissions[module];
    }
    
    // Fallback para permissões estáticas
    const rolePermissions = role ? ROLE_PERMISSIONS[role] : undefined;
    return rolePermissions?.[module] || DEFAULT_PERMISSIONS;
  };

  const hasModuleAccess = (module: keyof ModulePermissions): boolean => {
    return getModulePermissions(module).canView;
  };

  const canPerformAction = (module: keyof ModulePermissions, action: keyof PermissionActions): boolean => {
    return getModulePermissions(module)[action];
  };

  const getDefaultRoute = (): string => {
    if (!role || loading) return '/auth';

    switch (role) {
      case 'admin':
        return '/dashboard';
      case 'grs':
        return '/grs/dashboard';
      case 'atendimento':
        return '/atendimento/inbox';
      case 'designer':
        return '/design/dashboard';
      case 'filmmaker':
        return '/audiovisual/dashboard';
      case 'gestor':
        return '/dashboard';
      case 'financeiro':
        return '/financeiro';
      case 'cliente':
        return '/cliente/painel';
      default:
        return '/auth';
    }
  };

  return {
    role,
    loading: loading || permissionsLoading,
    getModulePermissions,
    hasModuleAccess,
    canPerformAction,
    getDefaultRoute,
    dynamicPermissions,
  };
}