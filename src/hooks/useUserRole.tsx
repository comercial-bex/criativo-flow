import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [role, setRole] = useState<UserRole>(null); // Start with null instead of 'cliente'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('👤 UserRole: Effect triggered, user:', !!user, 'authLoading:', authLoading);
    
    // If auth is still loading, wait
    if (authLoading) {
      setLoading(true);
      return;
    }

    // If no user, set null role
    if (!user) {
      console.log('👤 UserRole: No user, setting role to null');
      setRole(null);
      setLoading(false);
      return;
    }

    // Short timeout for role fetching
    const roleTimeout = setTimeout(() => {
      console.log('⚠️ UserRole: Timeout reached, keeping current role');
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

        if (error) {
          console.error('❌ UserRole: Erro ao buscar role:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar permissões",
            description: "Tente fazer login novamente.",
          });
          setRole(null);
        } else if (!data) {
          console.warn('⚠️ UserRole: Usuário sem role atribuída');
          toast({
            variant: "destructive",
            title: "Sem permissões atribuídas",
            description: "Entre em contato com o administrador.",
          });
          setRole(null);
        } else {
          const userRole = data.role as UserRole;
          console.log('👤 UserRole: Fetched role:', userRole);
          setRole(userRole);
        }
      } catch (error) {
        console.error('❌ UserRole: Erro inesperado ao buscar role:', error);
        clearTimeout(roleTimeout);
        toast({
          variant: "destructive",
          title: "Erro inesperado",
          description: "Não foi possível carregar suas permissões.",
        });
        setRole(null);
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
