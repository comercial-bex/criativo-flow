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
      // For team roles (gestor, atendimento, grs), use the filtered function
      // For admins and users viewing their own profile, use direct table access
      if (role === 'gestor' || role === 'atendimento' || role === 'grs') {
        // Get all profile IDs first, then fetch filtered data for each
        const { data: profileIds, error: idsError } = await supabase
          .from('profiles')
          .select('id')
          .order('created_at', { ascending: false });

        if (idsError) {
          console.error('Erro ao buscar IDs dos perfis:', idsError);
          setError('Erro ao carregar dados dos perfis');
          return;
        }

        // Fetch filtered profile data using the security definer function
        const filteredProfiles = [];
        if (profileIds) {
          for (const profileId of profileIds) {
            const { data: filteredProfile } = await supabase
              .rpc('get_filtered_profile', { profile_id: profileId.id });
            
            if (filteredProfile) {
              filteredProfiles.push({
                ...filteredProfile,
                _hasFullAccess: false
              });
            }
          }
        }
        
        setProfiles(filteredProfiles);
      } else {
        // For admins and users viewing their own profile, use direct access
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Erro ao buscar perfis:', fetchError);
          setError('Erro ao carregar dados dos perfis');
          return;
        }

        const profilesWithAccess = (data || []).map((profile: any) => ({
          ...profile,
          _hasFullAccess: true
        }));

        setProfiles(profilesWithAccess);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getProfileById = async (id: string): Promise<ProfileWithAccessFlag | null> => {
    try {
      // Use the security definer function for secure profile access
      const { data: filteredProfile, error: fetchError } = await supabase
        .rpc('get_filtered_profile', { profile_id: id });

      if (fetchError) {
        console.error('Erro ao buscar perfil:', fetchError);
        return null;
      }

      if (!filteredProfile) {
        return null;
      }

      // Check if user has full access (admin or own profile)
      const currentUser = await supabase.auth.getUser();
      const currentUserId = currentUser.data.user?.id;
      const isOwnProfile = filteredProfile.id === currentUserId;
      const isAdmin = role === 'admin';
      const hasFullAccess = isOwnProfile || isAdmin;

      return {
        ...filteredProfile,
        _hasFullAccess: hasFullAccess
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