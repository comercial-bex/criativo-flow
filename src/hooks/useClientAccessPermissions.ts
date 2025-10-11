import { useUserRole } from './useUserRole';

export function useClientAccessPermissions() {
  const { role, loading } = useUserRole();

  return {
    loading,
    // Acesso total (CRUD)
    canManageOnboarding: role === 'admin' || role === 'gestor' || role === 'grs',
    canManageFiles: role === 'admin' || role === 'gestor' || role === 'grs' || role === 'designer' || role === 'filmmaker',
    canManageCredentials: role === 'admin' || role === 'gestor' || role === 'grs',
    
    // Acesso somente leitura
    canViewOnboarding: role === 'admin' || role === 'gestor' || role === 'grs' || role === 'designer' || role === 'filmmaker',
    canViewFiles: role === 'admin' || role === 'gestor' || role === 'grs' || role === 'designer' || role === 'filmmaker',
    canViewCredentials: role === 'admin' || role === 'gestor' || role === 'grs',
    
    // Permissões específicas do cofre
    canRevealPasswords: role === 'admin' || role === 'gestor' || role === 'grs',
    canEditCredentials: role === 'admin' || role === 'gestor' || role === 'grs',
  };
}
