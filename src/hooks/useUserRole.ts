import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

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
      setRole(null);
      setLoading(false);
      return;
    }

    // Timeout para evitar loading infinito
    const roleTimeout = setTimeout(() => {
      console.log('⚠️ UserRole: Timeout reached, keeping current role');
      setLoading(false);
    }, 1000);

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        clearTimeout(roleTimeout);

        if (error) {
          console.error('👤 UserRole: Error fetching role:', error);
          setRole(null);
          setLoading(false);
          return;
        }

        const userRole = (data?.role as UserRole) || null;
        console.log('👤 UserRole: Fetched role:', userRole);
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
