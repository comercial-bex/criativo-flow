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
  | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('👤 UserRole: Effect triggered, user:', !!user);
    
    if (!user) {
      console.log('👤 UserRole: No user, setting role to null');
      setRole(null);
      setLoading(false);
      return;
    }

    // Set timeout for role fetching to prevent infinite loading
    const roleTimeout = setTimeout(() => {
      console.log('⚠️ UserRole: Timeout reached, setting default role');
      setRole('cliente'); // Default role as fallback
      setLoading(false);
    }, 3000);

    const fetchUserRole = async () => {
      try {
        console.log('👤 UserRole: Fetching role for user:', user.id);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        clearTimeout(roleTimeout);

        if (error) {
          console.warn('👤 UserRole: Warning fetching user role:', error);
          setRole('cliente'); // Default to cliente if no role found
        } else {
          const userRole = (data?.role as UserRole) ?? 'cliente';
          console.log('👤 UserRole: Fetched role:', userRole);
          setRole(userRole);
        }
      } catch (error) {
        console.error('👤 UserRole: Error fetching role:', error);
        clearTimeout(roleTimeout);
        setRole('cliente'); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    return () => {
      clearTimeout(roleTimeout);
    };
  }, [user]);

  return { role, loading };
}