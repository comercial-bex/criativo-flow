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
  grs: PermissionActions;
  configuracoes: PermissionActions;
  planos: PermissionActions;
  especialistas: PermissionActions;
  relatorios: PermissionActions;
  inteligencia: PermissionActions;
  projetos: PermissionActions;
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
    design: { canView: true, canCreate: false, canEdit: true, canDelete: false },
    grs: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    configuracoes: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    planos: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    especialistas: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    relatorios: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    inteligencia: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    projetos: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  },
  grs: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    clientes: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    crm: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    design: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    grs: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    relatorios: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    projetos: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  },
  atendimento: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    clientes: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    crm: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    projetos: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  },
  designer: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    design: { canView: true, canCreate: false, canEdit: true, canDelete: false },
    clientes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    projetos: { canView: true, canCreate: false, canEdit: true, canDelete: false },
  },
  filmmaker: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    audiovisual: { canView: true, canCreate: false, canEdit: true, canDelete: false },
    clientes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    projetos: { canView: true, canCreate: false, canEdit: true, canDelete: false },
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
    inteligencia: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    projetos: { canView: true, canCreate: true, canEdit: true, canDelete: true },
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
  trafego: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    clientes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    financeiro: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    relatorios: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  fornecedor: {
    dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    clientes: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    financeiro: { canView: true, canCreate: false, canEdit: false, canDelete: false },
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
    console.log('🔑 Permissions: Effect triggered, role:', role, 'loading:', loading);
    
    if (!role || loading) {
      console.log('🔑 Permissions: Waiting for role or still loading...');
      return;
    }

    console.log('🔑 Permissions: Fetching permissions for role:', role);
    
    // Timeout para permissões
    const permTimeout = setTimeout(() => {
      console.log('⚠️ Permissions: Timeout reached, using static permissions');
      setPermissionsLoading(false);
    }, 1000);

    const fetchPermissions = async () => {
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role', role);

        clearTimeout(permTimeout);

        if (error) {
          console.warn('🔑 Permissions: Error fetching permissions:', error);
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

        console.log('🔑 Permissions: Dynamic permissions loaded:', permissions);
        setDynamicPermissions(permissions);
      } catch (error) {
        console.error('🔑 Permissions: Error fetching permissions:', error);
        clearTimeout(permTimeout);
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchPermissions();
    
    return () => clearTimeout(permTimeout);
  }, [role, loading]);

  const getModulePermissions = (module: keyof ModulePermissions): PermissionActions => {
    // Admin gets full access always
    if (role === 'admin') {
      return { canView: true, canCreate: true, canEdit: true, canDelete: true };
    }
    
    if (!role || loading || permissionsLoading) {
      console.log('🔑 getModulePermissions: No role or loading', { role, loading, permissionsLoading, module });
      return DEFAULT_PERMISSIONS;
    }
    
    // Priorizar permissões dinâmicas do banco
    if (dynamicPermissions[module]) {
      console.log('🔑 getModulePermissions: Using dynamic permissions', { module, permissions: dynamicPermissions[module] });
      return dynamicPermissions[module];
    }
    
    // Fallback para permissões estáticas
    const rolePermissions = role ? ROLE_PERMISSIONS[role] : undefined;
    const permissions = rolePermissions?.[module] || DEFAULT_PERMISSIONS;
    console.log('🔑 getModulePermissions: Using static permissions', { module, role, permissions });
    return permissions;
  };

  const hasModuleAccess = (module: keyof ModulePermissions): boolean => {
    const result = getModulePermissions(module).canView;
    console.log('🔑 hasModuleAccess:', { module, result, role });
    return result;
  };

  const canPerformAction = (module: keyof ModulePermissions, action: keyof PermissionActions): boolean => {
    const result = getModulePermissions(module)[action];
    console.log('🔑 canPerformAction:', { module, action, result, role });
    return result;
  };

  const getDefaultRoute = (): string => {
    console.log('🔄 Permissions: getDefaultRoute called, role:', role, 'loading:', loading);
    
    if (!role || loading) {
      console.log('🔄 Permissions: No role or loading, returning /auth');
      return '/auth';
    }

    let defaultRoute: string;
    switch (role) {
      case 'admin':
        defaultRoute = '/dashboard';
        break;
      case 'grs':
        defaultRoute = '/grs/dashboard';
        break;
      case 'atendimento':
        defaultRoute = '/atendimento/dashboard';
        break;
      case 'trafego':
        defaultRoute = '/trafego/dashboard';
        break;
      case 'fornecedor':
        defaultRoute = '/fornecedor/dashboard';
        break;
      case 'designer':
        defaultRoute = '/design/dashboard';
        break;
      case 'filmmaker':
        defaultRoute = '/audiovisual/dashboard';
        break;
      case 'gestor':
        defaultRoute = '/gestor/dashboard';
        break;
      case 'financeiro':
        defaultRoute = '/financeiro/dashboard';
        break;
      case 'cliente':
        defaultRoute = '/cliente/painel';
        break;
      default:
        console.log('🔄 Permissions: Unknown role, returning /dashboard');
        defaultRoute = '/dashboard';
    }
    
    console.log('🔄 Permissions: Returning route:', defaultRoute);
    return defaultRoute;
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