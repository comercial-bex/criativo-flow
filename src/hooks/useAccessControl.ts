import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useProfileData } from './useProfileData';
import { useUserRole } from './useUserRole';

export function useAccessControl() {
  const { user } = useAuth();
  const { getProfileById } = useProfileData();
  const { role } = useUserRole();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAccess = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfileById(user.id);
        setUserProfile(profile);
      } catch (error) {
        console.error('Erro ao verificar acesso:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserAccess();
  }, [user?.id, getProfileById]);

  const canAccess = () => {
    // Admins sempre têm acesso
    if (role === 'admin') return true;
    
    // Clientes sempre têm acesso (não precisam de aprovação)
    if (role === 'cliente') return true;
    
    // Usuários aprovados têm acesso (mesmo sem role definido)
    if (userProfile?.status === 'aprovado') return true;
    
    // Outros casos: negado
    return false;
  };

  const isBlocked = () => {
    return userProfile?.status === 'rejeitado' || userProfile?.status === 'suspenso';
  };

  const isPending = () => {
    return userProfile?.status === 'pendente_aprovacao';
  };

  return {
    canAccess: canAccess(),
    isBlocked: isBlocked(),
    isPending: isPending(),
    userProfile,
    loading,
    role
  };
}