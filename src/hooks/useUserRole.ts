import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { authCache } from '@/lib/auth-cache';

export type UserRole = 
  | 'admin'
  | 'grs'
  | 'atendimento'
  | 'designer'
  | 'filmmaker'
  | 'gestor'
  | 'financeiro'
  | 'cliente'
  | 'trafego'
  | 'fornecedor'
  | null;

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('👤 UserRole: Effect triggered, user:', !!user, 'authLoading:', authLoading);
    
    if (authLoading) {
      return;
    }

    if (!user) {
      console.log('👤 UserRole: No user, setting role to null');
      authCache.remove('user_role');
      setRole(null);
      setLoading(false);
      return;
    }

    // Cache primeiro
    const cachedRole = authCache.get<UserRole>(`user_role_${user.id}`);
    if (cachedRole) {
      console.log('✅ UserRole: Using cached role:', cachedRole);
      setRole(cachedRole);
      setLoading(false);
      return;
    }

    const roleTimeout = setTimeout(() => {
      console.log('⚠️ UserRole: Timeout reached, keeping current role');
      setLoading(false);
    }, 1000);

    const fetchRole = async () => {
      try {
        // ✅ SPRINT 1: Ler de pessoas.papeis (fonte de verdade) 
        const { data, error } = await supabase
          .from('pessoas')
          .select('papeis')
          .eq('profile_id', user.id)
          .maybeSingle();

        clearTimeout(roleTimeout);

        if (error) {
          console.error('👤 UserRole: Error fetching role:', error);
          setRole(null);
          setLoading(false);
          return;
        }

        // Mapear primeiro papel para role (compatibilidade)
        const papeis = data?.papeis || [];
        const userRole = (papeis.length > 0 ? papeis[0] : null) as UserRole;
        console.log('👤 UserRole: Fetched role from papeis:', userRole);
        
        if (userRole) {
          authCache.set(`user_role_${user.id}`, userRole);
        }
        
        setRole(userRole);
        setLoading(false);
      } catch (error) {
        console.error('👤 UserRole: Unexpected error:', error);
        clearTimeout(roleTimeout);
        setRole(null);
        setLoading(false);
      }
    };

    fetchRole();

    return () => clearTimeout(roleTimeout);
  }, [user, authLoading]);

  return { role, loading };
}
