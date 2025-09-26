import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useUserRole } from './useUserRole';

export interface Profile {
  id: string;
  nome: string;
  email?: string | null; // Sensitive data - may be filtered
  telefone?: string | null; // Sensitive data - may be filtered
  avatar_url?: string | null;
  especialidade?: Database['public']['Enums']['especialidade_type'] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ProfileWithAccessFlag extends Profile {
  _hasFullAccess?: boolean;
}

/**
 * Hook to manage profile data access with security filtering
 * Automatically filters sensitive personal data based on user role and relationship
 */
export function useProfileData() {
  const { role } = useUserRole();
  const [profiles, setProfiles] = useState<ProfileWithAccessFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Erro ao buscar perfis:', fetchError);
        setError('Erro ao carregar dados dos perfis');
        return;
      }

      // Apply security filtering based on user role and relationship
      const currentUser = await supabase.auth.getUser();
      const currentUserId = currentUser.data.user?.id;

      const filteredProfiles = (data || []).map((profile: any) => {
        const isOwnProfile = profile.id === currentUserId;
        const isAdmin = role === 'admin';
        const hasFullAccess = isOwnProfile || isAdmin;
        
        // Filter sensitive data for limited access roles
        if (!hasFullAccess && (role === 'gestor' || role === 'atendimento' || role === 'grs')) {
          return {
            id: profile.id,
            nome: profile.nome,
            especialidade: profile.especialidade,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
            // Hide sensitive personal data
            email: null,
            telefone: null,
            _hasFullAccess: false
          };
        }

        return {
          ...profile,
          _hasFullAccess: true
        };
      });

      setProfiles(filteredProfiles);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getProfileById = async (id: string): Promise<ProfileWithAccessFlag | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar perfil:', fetchError);
        return null;
      }

      // Apply same security filtering for individual profile fetch
      const currentUser = await supabase.auth.getUser();
      const currentUserId = currentUser.data.user?.id;
      const isOwnProfile = data.id === currentUserId;
      const isAdmin = role === 'admin';
      const hasFullAccess = isOwnProfile || isAdmin;

      if (!hasFullAccess && (role === 'gestor' || role === 'atendimento' || role === 'grs')) {
        return {
          id: data.id,
          nome: data.nome,
          especialidade: data.especialidade,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          email: null,
          telefone: null,
          _hasFullAccess: false
        };
      }

      return {
        ...data,
        _hasFullAccess: true
      };
    } catch (err) {
      console.error('Erro inesperado ao buscar perfil:', err);
      return null;
    }
  };

  const updateProfile = async (id: string, profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Refresh the list
      await fetchProfiles();
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      return { data: null, error: err.message };
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [role]); // Refetch when role changes

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    getProfileById,
    updateProfile
  };
}