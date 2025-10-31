import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { getDashboardForRole } from '@/utils/roleRoutes';
import { supabase } from '@/integrations/supabase/client';

export function useAccessControl() {
  const { user } = useAuth();
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
        // ✅ JÁ ESTÁ CORRETO: pessoas.profile_id
        const { data } = await supabase
          .from('pessoas')
          .select('status, nome, email')
          .eq('profile_id', user.id)
          .maybeSingle();
        setUserProfile(data);
      } catch (error) {
        console.error('Erro ao verificar acesso:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserAccess();
  }, [user?.id]);

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

  const getDefaultRoute = () => {
    if (!role) return '/dashboard';
    return getDashboardForRole(role);
  };

  return {
    canAccess: canAccess(),
    isBlocked: isBlocked(),
    isPending: isPending(),
    userProfile,
    loading,
    role,
    defaultRoute: getDefaultRoute(), // ✅ NOVO
  };
}