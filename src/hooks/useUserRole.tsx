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
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('cliente'); // Default to 'cliente' immediately
  const [loading, setLoading] = useState(false); // Start with false for faster UI

  useEffect(() => {
    console.log('👤 UserRole: Effect triggered, user:', !!user, 'authLoading:', authLoading);
    
    // If auth is still loading, wait
    if (authLoading) {
      setLoading(true);
      return;
    }

    // If no user, set cliente role immediately
    if (!user) {
      console.log('👤 UserRole: No user, setting role to cliente');
      setRole('cliente');
      setLoading(false);
      return;
    }

    // Short timeout for role fetching
    const roleTimeout = setTimeout(() => {
      console.log('⚠️ UserRole: Timeout reached, keeping default role');
      setLoading(false);
    }, 1000);

    const fetchUserRole = async () => {
      try {
        console.log('👤 UserRole: Fetching role for user:', user.id);
        setLoading(true);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        clearTimeout(roleTimeout);

        if (error || !data) {
          console.warn('👤 UserRole: No role found, using default cliente');
          setRole('cliente');
        } else {
          const userRole = (data.role as UserRole) ?? 'cliente';
          console.log('👤 UserRole: Fetched role:', userRole);
          setRole(userRole);
        }
      } catch (error) {
        console.error('👤 UserRole: Error fetching role:', error);
        clearTimeout(roleTimeout);
        setRole('cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    return () => {
      clearTimeout(roleTimeout);
    };
  }, [user, authLoading]);

  return { role, loading };
}